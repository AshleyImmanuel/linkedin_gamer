import React, { useState, useEffect } from "react";
import { getSingleStatus, getSingleUser, updatePost, getAllUsers } from "../../../api/FirestoreAPI";
import PostsCard from "../PostsCard";
import { HiOutlinePencil } from "react-icons/hi";
import { BsPencil } from "react-icons/bs";
import { useLocation, useParams } from "react-router-dom";
import FileUploadModal from "../FileUploadModal";
import { uploadImage as uploadImageAPI, uploadPostImage } from "../../../api/ImageUpload";
import ModalComponent from "../Modal";
import userIcon from "../../../assets/user.png";
import "./index.scss";

export default function ProfileCard({ onEdit, currentUser }) {
  let location = useLocation();
  let { id } = useParams();
  const [allStatuses, setAllStatus] = useState([]);
  const [currentProfile, setCurrentProfile] = useState({});
  const [currentImage, setCurrentImage] = useState({});
  const [progress, setProgress] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  // Post Edit Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [postStatusText, setPostStatusText] = useState("");
  const [currentPost, setCurrentPost] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [postImages, setPostImages] = useState([]);
  const [postProgress, setPostProgress] = useState(0);

  const isOwnProfile = Boolean(
    currentUser?.id &&
      ((!id && (!location?.state?.id || location?.state?.id === currentUser?.id)) ||
        id === currentUser?.id)
  );

  const getEditData = (posts) => {
    setEditModalOpen(true);
    setPostStatusText(posts?.status);
    setCurrentPost(posts);
    setPostImages(posts?.postImages || (posts?.postImage ? [posts.postImage] : []));
    setIsEdit(true);
  };

  const updateStatus = () => {
    updatePost(currentPost.id, postStatusText, postImages, currentUser.id);
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
    let unsubscribeAllUsers;

    // Determine which user's posts to show - priority: URL param > location state > current user
    const targetUserId = id || location?.state?.id || currentUser?.id;
    const targetEmail = location?.state?.email;

    // Only proceed if we have a valid user ID
    if (!targetUserId) {
      return;
    }

    unsubscribeStatus = getSingleStatus(setAllStatus, targetUserId);

    if (targetEmail) {
      unsubscribeUser = getSingleUser(setCurrentProfile, targetEmail);
    } else if (id) {
      // If viewing another user via URL param, fetch all users to find the target
      unsubscribeAllUsers = getAllUsers((users) => {
        const targetUser = users.find(user => user.id === id);
        if (targetUser) {
          setCurrentProfile(targetUser);
        }
      });
    } else if (!location?.state?.id) {
      // Viewing own profile without state, use current user data
      setCurrentProfile(currentUser);
    }

    return () => {
      if (unsubscribeStatus) unsubscribeStatus();
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeAllUsers) unsubscribeAllUsers();
    };
  }, [id, location?.state?.id, location?.state?.email, currentUser?.id, currentUser?.email]);

  const displayedImage =
    (Object.values(currentProfile).length === 0
      ? currentUser?.imageLink
      : currentProfile?.imageLink) || userIcon;

  const displayedName =
    Object.values(currentProfile).length === 0
      ? currentUser?.name
      : currentProfile?.name || "User";

  const displayedHeadline =
    Object.values(currentProfile).length === 0
      ? currentUser?.headline
      : currentProfile?.headline;

  return (
    <>
      <FileUploadModal
        getImage={getImage}
        uploadImage={uploadImage}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        currentImage={currentImage}
        progress={progress}
        currentImageLink={displayedImage}
      />
      <div className="profile-card">
        {isOwnProfile ? (
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
                onClick={isOwnProfile ? () => setModalOpen(true) : undefined}
                src={displayedImage}
                alt="profile-image"
                style={{
                  cursor: isOwnProfile ? "pointer" : "default",
                }}
              />
              {isOwnProfile ? (
                <BsPencil
                  className="edit-image-icon"
                  onClick={() => setModalOpen(true)}
                  size={22}
                />
              ) : (
                <></>
              )}
            </div>
            <h3 className="userName">{displayedName}</h3>
            <p className="heading">{displayedHeadline}</p>
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
      
      {/* My Uploads Section */}
      <center>
      <div className="my-uploads-section">
        <h3 className="section-title">
          {isOwnProfile ? "My Uploads" : `${displayedName}'s Posts`}
        </h3>
        {allStatuses.length > 0 ? (
          allStatuses.map((posts) => (
            <div key={posts.id}>
              <PostsCard posts={posts} getEditData={getEditData} currentUser={currentUser} />
            </div>
          ))
        ) : (
          <p className="no-posts-message">
            {isOwnProfile ? "No posts yet. Start sharing!" : "No posts yet."}
          </p>
        )}
      </div>
      </center>
      
      {/* Post Edit Modal */}
      <ModalComponent
        setStatus={setPostStatusText}
        modalOpen={editModalOpen}
        setModalOpen={setEditModalOpen}
        status={postStatusText}
        sendStatus={updateStatus}
        isEdit={isEdit} 
        updateStatus={updateStatus}
        uploadPostImage={uploadPostImage}
        postImages={postImages}
        setPostImages={setPostImages}
        setCurrentPost={setCurrentPost}
        currentPost={currentPost}
      />
    </>
  );
}