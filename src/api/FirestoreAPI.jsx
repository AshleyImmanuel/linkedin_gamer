import { firestore } from "../firebaseConfig";
import {
  addDoc,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  where,
  setDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  deleteField,
  getDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";
import moment from "moment";

let postsRef = collection(firestore, "posts");
let userRef = collection(firestore, "users");
let likeRef = collection(firestore, "likes");
let commentsRef = collection(firestore, "comments");
let connectionRef = collection(firestore, "connections");

export const getPostTimestamp = (post) => {
  if (post?.createdAt) {
    if (typeof post.createdAt === "number") return post.createdAt;
    if (typeof post.createdAt.toMillis === "function") return post.createdAt.toMillis();
    if (typeof post.createdAt.toDate === "function") return post.createdAt.toDate().getTime();
    if (post.createdAt.seconds) return post.createdAt.seconds * 1000;
    const m = moment(post.createdAt);
    if (m.isValid()) return m.valueOf();
  }
  if (post?.timeStamp) {
    const m = moment(post.timeStamp, ["LLL", "LL", "YYYY-MM-DD HH:mm:ss", "MMMM D, YYYY h:mm A", moment.ISO_8601], true);
    if (m.isValid()) return m.valueOf();
    const fallback = moment(post.timeStamp);
    if (fallback.isValid()) return fallback.valueOf();
  }
  return 0;
};

export const postStatus = async (object) => {
  try {
    const postData = {
      ...object,
      createdAt: object.createdAt || Date.now(),
    };
    await addDoc(postsRef, postData);
    toast.success("Post has been added successfully");
  } catch (err) {
    console.error("Error adding post:", err);
    toast.error("Failed to add post");
  }
};

export const getStatus = (setAllStatus) => {
  return onSnapshot(
    postsRef,
    (response) => {
      const posts = response.docs.map((docs) => {
        return { ...docs.data(), id: docs.id };
      });
      posts.sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a));
      setAllStatus(posts);
    },
    (err) => {
      console.error("Error fetching feed posts:", err);
      setAllStatus([]);
    }
  );
};

export const calculatePostScore = (
  post,
  currentUserId,
  likesMap,
  commentsMap,
  connectedUserIds
) => {
  const postTime = getPostTimestamp(post);

  // 1. Engagement metrics (likes and comments)
  const likesCount =
    (likesMap && post.id ? likesMap.get(post.id)?.size : 0) ||
    post.likesCount ||
    0;
  const commentsCount =
    (commentsMap && post.id ? commentsMap.get(post.id) : 0) ||
    post.commentsCount ||
    0;

  // Small ranking boost for likes (2 mins per like, max 10 mins)
  const likeBoostMs = Math.min(likesCount * (2 * 60 * 1000), 10 * 60 * 1000);

  // Small ranking boost for comments (3 mins per comment, max 15 mins)
  const commentBoostMs = Math.min(commentsCount * (3 * 60 * 1000), 15 * 60 * 1000);

  // Total engagement boost capped at 20 minutes so recency strictly dominates
  const engagementBoostMs = Math.min(likeBoostMs + commentBoostMs, 20 * 60 * 1000);

  // 2. Interaction metrics (connection with author or prior interaction)
  let interactionBoostMs = 0;
  if (currentUserId && post.userID) {
    if (connectedUserIds && connectedUserIds.has(post.userID)) {
      interactionBoostMs += 5 * 60 * 1000; // 5 minutes boost
    }
    if (likesMap && likesMap.get(post.id)?.has(currentUserId)) {
      interactionBoostMs += 5 * 60 * 1000; // 5 minutes boost
    }
  }
  interactionBoostMs = Math.min(interactionBoostMs, 10 * 60 * 1000);

  // Final score: recency is dominant factor. Total combined boost <= 30 mins.
  return postTime + engagementBoostMs + interactionBoostMs;
};

export const getFeedPosts = (currentUserId, setAllStatus) => {
  let allPosts = [];
  let likesMap = new Map();
  let commentsMap = new Map();
  let connectedUserIds = new Set();

  const reRankAndEmit = () => {
    if (!allPosts || allPosts.length === 0) {
      setAllStatus([]);
      return;
    }

    const scored = allPosts.map((post) => {
      const score = calculatePostScore(
        post,
        currentUserId,
        likesMap,
        commentsMap,
        connectedUserIds
      );
      return { post, score };
    });

    // Sort descending by calculated score: newest / highest ranked first
    scored.sort((a, b) => b.score - a.score);

    setAllStatus(scored.map((s) => s.post));
  };

  // 1. Real-time subscription to posts collection
  const unsubscribePosts = onSnapshot(
    postsRef,
    (snapshot) => {
      allPosts = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      reRankAndEmit();
    },
    (err) => {
      console.error("Error fetching feed posts:", err);
      setAllStatus([]);
    }
  );

  // 2. Real-time subscription to likes collection for dynamic ranking
  const unsubscribeLikes = onSnapshot(
    likeRef,
    (snapshot) => {
      likesMap.clear();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data?.postId) {
          if (!likesMap.has(data.postId)) {
            likesMap.set(data.postId, new Set());
          }
          if (data.userId) {
            likesMap.get(data.postId).add(data.userId);
          }
        }
      });
      reRankAndEmit();
    },
    (err) => {
      console.warn("Could not subscribe to likes for ranking:", err);
    }
  );

  // 3. Real-time subscription to comments collection for dynamic ranking
  const unsubscribeComments = onSnapshot(
    commentsRef,
    (snapshot) => {
      commentsMap.clear();
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data?.postId) {
          commentsMap.set(data.postId, (commentsMap.get(data.postId) || 0) + 1);
        }
      });
      reRankAndEmit();
    },
    (err) => {
      console.warn("Could not subscribe to comments for ranking:", err);
    }
  );

  // 4. Real-time subscription to connections for affinity ranking
  let unsubscribeConnections = null;
  if (currentUserId) {
    const connQuery1 = query(connectionRef, where("userId", "==", currentUserId));
    const connQuery2 = query(connectionRef, where("targetId", "==", currentUserId));

    const unsub1 = onSnapshot(connQuery1, (snap1) => {
      snap1.docs.forEach((doc) => {
        const data = doc.data();
        if (data?.targetId) connectedUserIds.add(data.targetId);
      });
      reRankAndEmit();
    });

    const unsub2 = onSnapshot(connQuery2, (snap2) => {
      snap2.docs.forEach((doc) => {
        const data = doc.data();
        if (data?.userId) connectedUserIds.add(data.userId);
      });
      reRankAndEmit();
    });

    unsubscribeConnections = () => {
      if (unsub1) unsub1();
      if (unsub2) unsub2();
    };
  }

  return () => {
    if (unsubscribePosts) unsubscribePosts();
    if (unsubscribeLikes) unsubscribeLikes();
    if (unsubscribeComments) unsubscribeComments();
    if (unsubscribeConnections) unsubscribeConnections();
  };
};

export const getAllUsers = (setAllUsers) => {
  return onSnapshot(userRef, (response) => {
    setAllUsers(
      response.docs.map((docs) => {
        return { ...docs.data(), id: docs.id };
      })
    );
  });
};

export const getSingleStatus = (setAllStatus, id) => {
  const singlePostQuery = query(postsRef, where("userID", "==", id));
  return onSnapshot(
    singlePostQuery,
    (response) => {
      const posts = response.docs.map((docs) => {
        return { ...docs.data(), id: docs.id };
      });
      posts.sort((a, b) => getPostTimestamp(b) - getPostTimestamp(a));
      setAllStatus(posts);
    },
    (err) => {
      console.error("Error fetching user posts:", err);
      setAllStatus([]);
    }
  );
};

export const getSingleUser = (setCurrentUser, email) => {
  const singleUserQuery = query(userRef, where("email", "==", email));
  return onSnapshot(singleUserQuery, (response) => {
    setCurrentUser(
      response.docs.map((docs) => {
        return { ...docs.data(), id: docs.id };
      })[0]
    );
  });
};

export const postUserData = (object) => {
  addDoc(userRef, object)
    .then(() => {})
    .catch((err) => {
      console.log(err);
    });
};

export const getCurrentUser = (setCurrentUser) => {
  const email = localStorage.getItem("userEmail");
  if (!email) return () => {};
  const q = query(userRef, where("email", "==", email));
  return onSnapshot(q, (response) => {
    setCurrentUser(
      response.docs.map((docs) => {
        return { ...docs.data(), id: docs.id };
      })[0]
    );
  });
};

export const editProfile = (userID, payload) => {
  let userToEdit = doc(userRef, userID);

  updateDoc(userToEdit, payload)
    .then(() => {
      toast.success("Profile has been updated successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};

export const likePost = (userId, postId, liked) => {
  try {
    let docToLike = doc(likeRef, `${userId}_${postId}`);
    if (liked) {
      deleteDoc(docToLike);
    } else {
      setDoc(docToLike, { userId, postId });
    }
  } catch (err) {
    console.log(err);
  }
};

export const getLikesByUser = (userId, postId, setLiked, setLikesCount) => {
  try {
    let likeQuery = query(likeRef, where("postId", "==", postId));

    return onSnapshot(likeQuery, (response) => {
      let likes = response.docs.map((doc) => doc.data());
      let likesCount = likes?.length;

      const isLiked = likes.some((like) => like.userId === userId);

      setLikesCount(likesCount);
      setLiked(isLiked);
    });
  } catch (err) {
    console.log(err);
  }
};

export const postComment = (postId, comment, timeStamp, name) => {
  try {
    addDoc(commentsRef, {
      postId,
      comment,
      timeStamp,
      name,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getComments = (postId, setComments) => {
  try {
    let singlePostQuery = query(commentsRef, where("postId", "==", postId));

    return onSnapshot(singlePostQuery, (response) => {
      const comments = response.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      setComments(comments);
    });
  } catch (err) {
    console.log(err);
  }
};

export const updatePost = async (id, status, postImages, userId) => {
  let docToUpdate = doc(postsRef, id);
  try {
    // First verify the user owns this post
    const docSnap = await getDoc(docToUpdate);
    if (!docSnap.exists()) {
      toast.error("Post not found");
      return;
    }
    
    const postData = docSnap.data();
    if (postData.userID !== userId) {
      toast.error("You can only edit your own posts");
      return;
    }
    
    await updateDoc(docToUpdate, { 
      status, 
      postImages,
      postImage: deleteField()
    });
    toast.success("Post has been updated!");
  } catch (err) {
    console.error("Update Post Error:", err);
    toast.error(`Failed to update post: ${err.message}`);
  }
};

export const deletePost = async (id, userId) => {
  let docToDelete = doc(postsRef, id);
  try {
    // First verify the user owns this post
    const docSnap = await getDoc(docToDelete);
    if (!docSnap.exists()) {
      toast.error("Post not found");
      return;
    }
    
    const postData = docSnap.data();
    if (postData.userID !== userId) {
      toast.error("You can only delete your own posts");
      return;
    }
    
    await deleteDoc(docToDelete);
    toast.success("Post has been Deleted!");
  } catch (err) {
    console.error("Delete Post Error:", err);
    toast.error(`Failed to delete post: ${err.message}`);
  }
};

export const addConnection = (userId, targetId) => {
  try {
    let connectionToAdd = doc(connectionRef, `${userId}_${targetId}`);

    setDoc(connectionToAdd, { userId, targetId });

    toast.success("Connection Added!");
  } catch (err) {
    console.log(err);
  }
};

export const getConnections = (userId, targetId, setIsConnected) => {
  try {
    let connectionsQuery = query(
      connectionRef,
      where("targetId", "==", targetId)
    );

    return onSnapshot(connectionsQuery, (response) => {
      let connections = response.docs.map((doc) => doc.data());

      const isConnected = connections.some(
        (connection) => connection.userId === userId
      );

      setIsConnected(isConnected);
    });
  } catch (err) {
    console.log(err);
  }
};
