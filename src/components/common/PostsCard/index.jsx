import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Modal, Carousel } from "antd";
import { BsPencil, BsTrash } from "react-icons/bs";
import {
  getCurrentUser,
  getAllUsers,
  deletePost,
  getConnections,
} from "../../../api/FirestoreAPI";
import LikeButton from "../LikeButton";
import "./index.scss";

export default function PostsCard({ posts, id, getEditData }) {
  let navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [imageModal, setImageModal] = useState(false);
  const [postImage, setPostImage] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  useEffect(() => {
    const unsubscribeUser = getCurrentUser(setCurrentUser);
    const unsubscribeAllUsers = getAllUsers(setAllUsers);
    return () => {
      unsubscribeUser();
      unsubscribeAllUsers();
    };
  }, []);

  useEffect(() => {
    const unsubscribeConnections = getConnections(currentUser.id, posts.userID, setIsConnected);
    return () => {
      if (unsubscribeConnections) unsubscribeConnections();
    };
  }, [currentUser.id, posts.userID]);

  return isConnected || currentUser.id === posts.userID ? (
    <div className="posts-card" key={id}>
      <div className="post-image-wrapper">
        {currentUser.id === posts.userID ? (
          <div className="action-container">
            <BsPencil
              size={20}
              className="action-icon"
              onClick={() => getEditData(posts)}
            />
            <BsTrash
              size={20}
              className="action-icon"
              onClick={() => deletePost(posts.id)}
            />
          </div>
        ) : (
          <></>
        )}

        <img
          alt="profile-image"
          className="profile-image"
          src={
            allUsers
              .filter((item) => item.id === posts.userID)
              .map((item) => item.imageLink)[0]
          }
        />
        <div>
          <p
            className="name"
            onClick={() =>
              navigate("/profile", {
                state: { id: posts?.userID, email: posts.userEmail },
              })
            }
          >
            {allUsers.filter((user) => user.id === posts.userID)[0]?.name}
          </p>
          <p className="headline">
            {allUsers.filter((user) => user.id === posts.userID)[0]?.headline}
          </p>
          <p className="timestamp">{posts.timeStamp}</p>
        </div>
      </div>
      {posts.postImages && posts.postImages.length > 0 ? (
        posts.postImages.length === 1 ? (
          <img
            onClick={() => {
              setPostImage(posts.postImages[0]);
              setImageModal(true);
            }}
            src={posts.postImages[0]}
            className="post-image"
            alt="post-image"
          />
        ) : (
          <div className="carousel-wrapper" style={{ position: "relative" }}>
            <Carousel
              arrows
              dots
              afterChange={(current) => setCurrentSlide(current)}
              className="post-images-carousel"
            >
              {posts.postImages.map((image, idx) => (
                <div key={idx} className="carousel-slide">
                  <img
                    onClick={() => {
                      setPostImage(image);
                      setImageModal(true);
                    }}
                    src={image}
                    className="post-image"
                    alt={`post-image-${idx}`}
                  />
                </div>
              ))}
            </Carousel>
            <div className="carousel-counter">
              {currentSlide + 1} / {posts.postImages.length}
            </div>
          </div>
        )
      ) : posts.postImage ? (
        <img
          onClick={() => {
            setPostImage(posts.postImage);
            setImageModal(true);
          }}
          src={posts.postImage}
          className="post-image"
          alt="post-image"
        />
      ) : (
        <></>
      )}
      <p
        className="status"
        dangerouslySetInnerHTML={{ __html: posts.status }}
      ></p>

      <LikeButton
        userId={currentUser?.id}
        postId={posts.id}
        currentUser={currentUser}
      />

      <Modal
        centered
        open={imageModal}
        onOk={() => setImageModal(false)}
        onCancel={() => setImageModal(false)}
        footer={[]}
      >
        <img
          src={postImage}
          className="post-image modal"
          alt="post-image"
        />
      </Modal>
    </div>
  ) : (
    <></>
  );
}
