import { storage } from "../firebaseConfig";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { editProfile } from "./FirestoreAPI";
import { getUniqueID } from "../helpers/getUniqueId";
import { toast } from "react-toastify";

export const uploadImage = (
  file,
  id,
  setModalOpen,
  setProgress,
  setCurrentImage
) => {
  if (!file || !file.name) return;
  const profilePicsRef = ref(storage, `profileImages/${id}_${file.name}`);
  const uploadTask = uploadBytesResumable(profilePicsRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );

      setProgress(progress);
    },
    (error) => {
      console.error(error);
      toast.error(`Error uploading image: ${error.message}`);
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((response) => {
        editProfile(id, { imageLink: response });
        setModalOpen(false);
        setCurrentImage({});
        setProgress(0);
      });
    }
  );
};

export const uploadPostImage = (file, setPostImages, setProgress, onComplete) => {
  if (!file || !file.name) {
    if (onComplete) onComplete();
    return;
  }
  const postPicsRef = ref(storage, `postImages/${getUniqueID()}_${file.name}`);
  const uploadTask = uploadBytesResumable(postPicsRef, file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );

      setProgress(progress);
    },
    (error) => {
      console.error(error);
      toast.error(`Error uploading image: ${error.message}`);
      if (onComplete) onComplete();
    },
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((response) => {
        setPostImages((prev) => [...prev, response]);
        setProgress(0);
        if (onComplete) onComplete();
      });
    }
  );
};
