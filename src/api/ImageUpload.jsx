import { editProfile } from "./FirestoreAPI";
import { toast } from "react-toastify";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadImage = (
  file,
  id,
  setModalOpen,
  setProgress,
  setCurrentImage
) => {
  if (!file) return;

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const xhr = new XMLHttpRequest();
  const fd = new FormData();

  xhr.open("POST", url, true);

  // Set up progress tracking
  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const progress = Math.round((e.loaded * 100) / e.total);
      setProgress(progress);
    }
  });

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        const imageLink = response.secure_url;
        
        editProfile(id, { imageLink });
        setModalOpen(false);
        setCurrentImage({});
        setProgress(0);
      } else {
        let errMsg = xhr.statusText;
        try {
          const error = JSON.parse(xhr.responseText);
          errMsg = error.error?.message || errMsg;
        } catch (e) {
          // ignore parsing error if response is not JSON
        }
        console.error("Cloudinary Error:", errMsg);
        toast.error(`Error uploading image: ${errMsg}`);
        setProgress(0);
      }
    }
  };

  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("file", file);
  xhr.send(fd);
};

export const uploadPostImage = (file, setPostImages, setProgress, onComplete) => {
  if (!file) {
    if (onComplete) onComplete();
    return;
  }

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
  const xhr = new XMLHttpRequest();
  const fd = new FormData();

  xhr.open("POST", url, true);

  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const progress = Math.round((e.loaded * 100) / e.total);
      setProgress(progress);
    }
  });

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        const imageLink = response.secure_url;

        setPostImages((prev) => [...prev, imageLink]);
        setProgress(0);
        if (onComplete) onComplete();
      } else {
        let errMsg = xhr.statusText;
        try {
          const error = JSON.parse(xhr.responseText);
          errMsg = error.error?.message || errMsg;
        } catch (e) {
          // ignore parsing error
        }
        console.error("Cloudinary Error:", errMsg);
        toast.error(`Error uploading image: ${errMsg}`);
        setProgress(0);
        if (onComplete) onComplete();
      }
    }
  };

  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("file", file);
  xhr.send(fd);
};

