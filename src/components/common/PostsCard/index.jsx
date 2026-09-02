import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Carousel } from "antd";
import { BsPencil, BsTrash } from "react-icons/bs";
import {
  getCurrentUser,
  deletePost,
} from "../../../api/FirestoreAPI";
import LikeButton from "../LikeButton";
import userIcon from "../../../assets/user.png";
import "./index.scss";

export default function PostsCard({ posts, id, getEditData, currentUser: currentUserProp }) {
  let navigate = useNavigate();
  const [currentUserState, setCurrentUser] = useState({});
  const [imageModal, setImageModal] = useState(false);
  const [postImage, setPostImage] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const currentUser = currentUserProp || currentUserState;
  
  useEffect(() => {
    let unsubscribeUser;
    if (!currentUserProp?.id) {
      unsubscribeUser = getCurrentUser(setCurrentUser);
    }
    return () => {
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [currentUserProp?.id]);

  const authorName = posts?.userName || "User";
  const authorHeadline = posts?.userHeadline || "";
  const authorImage = posts?.userImageLink || userIcon;

  const navigateToAuthorProfile = () => {
    if (posts?.userID && posts?.userID === currentUser?.id) {
      navigate("/profile");
    } else if (posts?.userID) {
      navigate(`/user/${posts?.userID}`, {
        state: { id: posts?.userID, email: posts?.userEmail },
      });
    }
  };

  return (
    <div className="posts-card" key={id}>
      <div className="post-image-wrapper">
        {currentUser?.id === posts.userID ? (
          <div className="action-container">
            <BsPencil
              size={20}
              className="action-icon"
              onClick={() => getEditData(posts)}
            />
            <BsTrash
              size={20}
              className="action-icon"
              onClick={() => deletePost(posts.id, currentUser.id)}
            />
          </div>
        ) : (
          <></>
        )}

        <img
          alt="profile-image"
          className="profile-image"
          src={authorImage}
          onClick={navigateToAuthorProfile}
          style={{ cursor: "pointer" }}
        />
        <div>
          <p
            className="name"
            onClick={navigateToAuthorProfile}
          >
            {authorName}
          </p>
          {authorHeadline && <p className="headline">{authorHeadline}</p>}
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
  );
}
