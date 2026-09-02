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

export const getFeedPosts = (userId, setAllStatus) => {
  // Return the public community feed sorted with newest posts first
  return getStatus(setAllStatus);
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
