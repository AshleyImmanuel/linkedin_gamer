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

let postsRef = collection(firestore, "posts");
let userRef = collection(firestore, "users");
let likeRef = collection(firestore, "likes");
let commentsRef = collection(firestore, "comments");
let connectionRef = collection(firestore, "connections");

export const postStatus = (object) => {
  addDoc(postsRef, object)
    .then(() => {
      toast.success("Post has been added successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};

export const getStatus = (setAllStatus) => {
  const q = query(postsRef, orderBy("timeStamp"));
  return onSnapshot(q, (response) => {
    setAllStatus(
      response.docs.map((docs) => {
        return { ...docs.data(), id: docs.id };
      })
    );
  });
};

export const getFeedPosts = (userId, setAllStatus) => {
  // Get posts from user's connections (both directions) and their own posts
  const connectionsQuery1 = query(
    connectionRef,
    where("userId", "==", userId)
  );
  
  const connectionsQuery2 = query(
    connectionRef,
    where("targetId", "==", userId)
  );
  
  const unsubscribe1 = onSnapshot(connectionsQuery1, (snapshot1) => {
    const unsubscribe2 = onSnapshot(connectionsQuery2, (snapshot2) => {
      // Get users where current user is the userId (they initiated connection)
      const connectedUserIds1 = snapshot1.docs.map(doc => doc.data().targetId).filter(id => id);
      // Get users where current user is the targetId (they were connected to)
      const connectedUserIds2 = snapshot2.docs.map(doc => doc.data().userId).filter(id => id);
      
      // Combine both directions and remove duplicates
      const allConnectedUserIds = [...new Set([...connectedUserIds1, ...connectedUserIds2])];
      // Include current user's ID to show their own posts in feed
      const allUserIds = [...allConnectedUserIds, userId].filter(id => id);
      
      console.log("Feed Debug - Connected User IDs:", allConnectedUserIds);
      console.log("Feed Debug - All User IDs for posts:", allUserIds);
      console.log("Feed Debug - Snapshot1 docs:", snapshot1.docs.length);
      console.log("Feed Debug - Snapshot2 docs:", snapshot2.docs.length);
      
      if (!allUserIds || allUserIds.length === 0) {
        console.log("Feed Debug - No connected users, showing all posts as fallback");
        // Fallback: show all posts if no connections
        const allPostsQuery = query(postsRef, orderBy("timeStamp", "desc"));
        const unsubscribeAllPosts = onSnapshot(allPostsQuery, (response) => {
          console.log("Feed Debug - All posts found:", response.docs.length);
          setAllStatus(
            response.docs.map((docs) => {
              return { ...docs.data(), id: docs.id };
            })
          );
        });
        return () => {
          if (unsubscribeAllPosts) unsubscribeAllPosts();
          if (unsubscribe2) unsubscribe2();
        };
      }
      
      // Firebase 'in' queries support up to 10 values
      const userIdsToQuery = allUserIds.length > 10 ? allUserIds.slice(0, 10) : allUserIds;
      
      try {
        // Fetch posts from all connected users
        const postsQuery = query(
          postsRef,
          where("userID", "in", userIdsToQuery),
          orderBy("timeStamp", "desc")
        );
        
        const unsubscribePosts = onSnapshot(postsQuery, (response) => {
          console.log("Feed Debug - Posts found:", response.docs.length);
          setAllStatus(
            response.docs.map((docs) => {
              return { ...docs.data(), id: docs.id };
            })
          );
        });
        
        return () => {
          if (unsubscribePosts) unsubscribePosts();
          if (unsubscribe2) unsubscribe2();
        };
      } catch (error) {
        console.error("Error fetching feed posts:", error);
        setAllStatus([]);
      }
    });
    
    return () => {
      if (unsubscribe2) unsubscribe2();
    };
  });
  
  return unsubscribe1;
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
  return onSnapshot(singlePostQuery, (response) => {
    setAllStatus(
      response.docs.map((docs) => {
        return { ...docs.data(), id: docs.id };
      })
    );
  });
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
