import React, { useState, useEffect } from "react";
import { getSingleStatus, getSingleUser, updatePost } from "../../../api/FirestoreAPI";
import PostsCard from "../PostsCard";
import { HiOutlinePencil } from "react-icons/hi";
import { BsPencil } from "react-icons/bs";
import { useLocation } from "react-router-dom";
import FileUploadModal from "../FileUploadModal";
import { uploadImage as uploadImageAPI, uploadPostImage } from "../../../api/ImageUpload";
import ModalComponent from "../Modal";
import "./index.scss";

export default function ProfileCard({ onEdit, currentUser }) {
  let location = useLocation();
  const [allStatuses, setAllStatus] = useState([]);
  const [currentProfile, setCurrentProfile] = useState({});
  const [currentImage, setCurrentImage] = useState({});
  const [progress, setProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  // Post Edit Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [postStatusText, setPostStatusText] = useState("");
  const [currentPost, setCurrentPost] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [postImages, setPostImages] = useState([]);
  const [postProgress, setPostProgress] = useState(0);

  const getEditData = (posts) => {
    setEditModalOpen(true);
    setPostStatusText(posts?.status);
    setCurrentPost(posts);
    setPostImages(posts?.postImages || (posts?.postImage ? [posts.postImage] : []));
    setIsEdit(true);
  };

  const updateStatus = () => {
    updatePost(currentPost.id, postStatusText, postImages);
    setEditModalOpen(false);
    setPostStatusText("");
    setPostImages([]);
    setCurrentPost({});
    setIsEdit(false);
  };

  const getImage = (event) => {
    if (event.target.files && event.target.files[0]) {
      setCurrentImage(event.target.files[0]);
    }
  };
  console.log(currentProfile);
  const uploadImage = () => {
    uploadImageAPI(
      currentImage,
      currentUser.id,
      setModalOpen,
      setProgress,
      setCurrentImage
    );
  };

  useEffect(() => {
    let unsubscribeStatus;
    let unsubscribeUser;

    if (location?.state?.id) {
      unsubscribeStatus = getSingleStatus(setAllStatus, location?.state?.id);
    }

    if (location?.state?.email) {
      unsubscribeUser = getSingleUser(setCurrentProfile, location?.state?.email);
    }

    return () => {
      if (unsubscribeStatus) unsubscribeStatus();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, [location?.state?.id, location?.state?.email]);

  return (
    <>
      <FileUploadModal
        getImage={getImage}
        uploadImage={uploadImage}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        currentImage={currentImage}
        progress={progress}
        currentImageLink={
          Object.values(currentProfile).length === 0
            ? currentUser.imageLink
            : currentProfile?.imageLink
        }
      />
      <div className="profile-card">
        {currentUser.id === location?.state?.id ? (
          <div className="edit-btn">
            <HiOutlinePencil className="edit-icon" onClick={onEdit} />
          </div>
        ) : (
          <></>
        )}
        <div className="profile-info">
          <div>
            <div className="profile-image-container">
              <img
                className="profile-image"
                onClick={
                  (!location?.state?.id || location?.state?.id === currentUser.id)
                    ? () => setModalOpen(true)
                    : undefined
                }
                src={
                  Object.values(currentProfile).length === 0
                    ? currentUser.imageLink
                    : currentProfile?.imageLink
                }
                alt="profile-image"
                style={{
                  cursor: (!location?.state?.id || location?.state?.id === currentUser.id)
                    ? "pointer"
                    : "default"
                }}
              />
              {(!location?.state?.id || location?.state?.id === currentUser.id) ? (
                <BsPencil
                  className="edit-image-icon"
                  onClick={() => setModalOpen(true)}
                  size={22}
                />
              ) : (
                <></>
              )}
            </div>
            <h3 className="userName">
              {Object.values(currentProfile).length === 0
                ? currentUser.name
                : currentProfile?.name}
            </h3>
            <p className="heading">
              {Object.values(currentProfile).length === 0
                ? currentUser.headline
                : currentProfile?.headline}
            </p>
            {(currentUser.city || currentUser.country) &&
            (currentProfile?.city || currentProfile?.country) ? (
              <p className="location">
                {Object.values(currentProfile).length === 0
                  ? `${currentUser.city}, ${currentUser.country} `
                  : `${currentProfile?.city}, ${currentUser.country}`}
              </p>
            ) : (
              <></>
            )}
            {currentUser.website || currentProfile?.website ? (
              <a
                className="website"
                target="_blank"
                href={
                  Object.values(currentProfile).length === 0
                    ? `${currentUser.website}`
                    : currentProfile?.website
                }
              >
                {Object.values(currentProfile).length === 0
                  ? `${currentUser.website}`
                  : currentProfile?.website}
              </a>
            ) : (
              <></>
            )}
          </div>

          <div className="right-info">
            <p className="college">
              {Object.values(currentProfile).length === 0
                ? currentUser.college
                : currentProfile?.college}
            </p>
            <p className="company">
              {Object.values(currentProfile).length === 0
                ? currentUser.company
                : currentProfile?.company}
            </p>
          </div>
        </div>
        <p className="about-me">
          {Object.values(currentProfile).length === 0
            ? currentUser.aboutMe
            : currentProfile?.aboutMe}
        </p>

        {currentUser.skills || currentProfile?.skills ? (
          <p className="skills">
            <span className="skill-label">Skills</span>:&nbsp;
            {Object.values(currentProfile).length === 0
              ? currentUser.skills
              : currentProfile?.skills}
          </p>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
