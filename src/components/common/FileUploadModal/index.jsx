import React from "react";
import { Button, Modal, Progress } from "antd";
import "./index.scss";

export default function FileUploadModal({
  modalOpen,
  setModalOpen,
  getImage,
  uploadImage,
  currentImage,
  progress,
  currentImageLink,
}) {
  return (
    <div>
      <Modal
        title="Add a Profile Image"
        centered
        open={modalOpen}
        onOk={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button
            disabled={currentImage.name ? false : true}
            key="submit"
            type="primary"
            onClick={uploadImage}
          >
            Upload Profile Picture
          </Button>,
        ]}
      >
        <div className="image-upload-main">
          {currentImage && currentImage.name ? (
            <img
              src={URL.createObjectURL(currentImage)}
              alt="preview"
              className="image-preview"
            />
          ) : currentImageLink ? (
            <img
              src={currentImageLink}
              alt="current profile"
              className="image-preview"
            />
          ) : (
            <></>
          )}
          <p className="file-name">{currentImage.name || "No file chosen"}</p>
          <label className="upload-btn" htmlFor="image-upload">
            Add an Image
          </label>
          {progress === 0 ? (
            <></>
          ) : (
            <div className="progress-bar">
              <Progress type="circle" percent={progress} />
            </div>
          )}
          <input hidden id="image-upload" type={"file"} onChange={getImage} />
        </div>
      </Modal>
    </div>
  );
}
