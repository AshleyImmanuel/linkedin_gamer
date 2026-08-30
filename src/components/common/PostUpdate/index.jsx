import React, { useState, useEffect } from "react";
import { postStatus, getFeedPosts, updatePost } from "../../../api/FirestoreAPI";
import { getCurrentTimeStamp } from "../../../helpers/useMoment";
import ModalComponent from "../Modal";
import { uploadPostImage } from "../../../api/ImageUpload";
import { getUniqueID } from "../../../helpers/getUniqueId";
import PostsCard from "../PostsCard";
import "./index.scss";

export default function PostStatus({ currentUser }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [allStatuses, setAllStatus] = useState([]);
  const [currentPost, setCurrentPost] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [postImages, setPostImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const sendStatus = async () => {
    let object = {
      status: status,
      timeStamp: getCurrentTimeStamp("LLL"),
      userEmail: currentUser.email,
      userName: currentUser.name,
      postID: getUniqueID(),
      userID: currentUser.id,
      postImages: postImages,
    };
    await postStatus(object);
    setModalOpen(false);
    setIsEdit(false);
    setStatus("");
    setPostImages([]);
  };

  const getEditData = (posts) => {
    setModalOpen(true);
    setStatus(posts?.status);
    setCurrentPost(posts);
    setPostImages(posts?.postImages || (posts?.postImage ? [posts.postImage] : []));
    setIsEdit(true);
  };

  const updateStatus = () => {
    updatePost(currentPost.id, status, postImages, currentUser.id);
    setModalOpen(false);
    setStatus("");
    setPostImages([]);
    setCurrentPost({});
  };

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }
    
    const unsubscribe = getFeedPosts(currentUser.id, setAllStatus);
    setLoading(false);
    return () => unsubscribe();
  }, [currentUser?.id]);

  return (
    <div className="post-status-main">
      <div className="user-details">
        <img src={currentUser?.imageLink} alt="imageLink" />
        <p className="name">{currentUser?.name}</p>
        <p className="headline">{currentUser?.headline}</p>
      </div>
      <div className="post-status">
        <img
          className="post-image"
          src={currentUser?.imageLink}
          alt="imageLink"
        />
        <button
          className="open-post-modal"
          onClick={() => {
            setModalOpen(true);
            setIsEdit(false);
          }}
        >
          Start a Post
        </button>
      </div>

      <ModalComponent
        setStatus={setStatus}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        status={status}
        sendStatus={sendStatus}
        isEdit={isEdit}
        updateStatus={updateStatus}
        uploadPostImage={uploadPostImage}
        postImages={postImages}
        setPostImages={setPostImages}
        setCurrentPost={setCurrentPost}
        currentPost={currentPost}
      />

      <div className="feed-container">
        {loading ? (
          <div className="feed-loading">Loading feed...</div>
        ) : allStatuses.length > 0 ? (
          allStatuses.map((posts) => {
            return (
              <div key={posts.id}>
                <PostsCard posts={posts} getEditData={getEditData} />
              </div>
            );
          })
        ) : (
          <div className="empty-feed">
            <div className="empty-feed-content">
              <h3>Your feed is empty</h3>
              <p>Connect with other users to see their posts here, or start by creating your own posts!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
