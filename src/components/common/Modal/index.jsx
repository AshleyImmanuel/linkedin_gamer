import React, { useState } from "react";
import { Button, Modal, Progress } from "antd";
import { AiOutlinePicture } from "react-icons/ai";
import ReactQuill from "react-quill";
import { toast } from "react-toastify";
import "./index.scss";

const ModalComponent = ({
  modalOpen,
  setModalOpen,
  sendStatus,
  setStatus,
  status,
  isEdit,
  updateStatus,
  uploadPostImage,
  setPostImages,
  postImages,
  currentPost,
  setCurrentPost,
}) => {
  const [progress, setProgress] = useState(0);
  const [localPreviews, setLocalPreviews] = useState([]);
  return (
    <>
      <Modal
        title="Create a post"
        centered
        open={modalOpen}
        onOk={() => {
          setStatus("");
          setModalOpen(false);
          setPostImages([]);
          setLocalPreviews([]);
          setCurrentPost({});
        }}
        onCancel={() => {
          setStatus("");
          setModalOpen(false);
          setPostImages([]);
          setLocalPreviews([]);
          setCurrentPost({});
        }}
        footer={[
          <Button
            onClick={isEdit ? updateStatus : sendStatus}
            key="submit"
            type="primary"
            disabled={
              status.replace(/<[^>]*>?/gm, "").trim().length === 0 &&
              postImages?.length === 0 &&
              localPreviews.length === 0
            }
          >
            {isEdit ? "Update" : "Post"}
          </Button>,
        ]}
      >
        <div className="posts-body">
          <ReactQuill
            className="modal-input"
            theme="snow"
            value={status}
            placeholder="Share Something Useful.."
            onChange={setStatus}
          />
          {progress === 0 ? (
            <></>
          ) : (
            <div className="progress-bar">
              <Progress type="circle" percent={progress} />
            </div>
          )}
          {postImages?.length > 0 || localPreviews.length > 0 ? (
            <div className="preview-images-container">
              {localPreviews.map((image, index) => (
                <div key={`local-${index}`} className="preview-image-wrapper">
                  <img
                    className="preview-image"
                    src={image}
                    alt={`localPreview-${index}`}
                    style={{ opacity: 0.5 }}
                  />
                </div>
              ))}
              {postImages.map((image, index) => (
                <div key={index} className="preview-image-wrapper">
                  <img
                    className="preview-image"
                    src={image}
                    alt={`postImage-${index}`}
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() =>
                      setPostImages((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <></>
          )}
        </div>
        <label htmlFor="pic-upload">
          <AiOutlinePicture size={35} className="picture-icon" />
        </label>
        <input
          id="pic-upload"
          type="file"
          multiple
          hidden
          onChange={(event) => {
            const files = Array.from(event.target.files);
            if (files.length > 0) {
              toast.info(`Uploading ${files.length} image(s)...`);
            }
            files.forEach((file) => {
              const localUrl = URL.createObjectURL(file);
              setLocalPreviews((prev) => [...prev, localUrl]);
              uploadPostImage(file, setPostImages, setProgress, () => {
                setLocalPreviews((prev) => prev.filter((url) => url !== localUrl));
              });
            });
            event.target.value = "";
          }}
        />
      </Modal>
    </>
  );
};

export default ModalComponent;
