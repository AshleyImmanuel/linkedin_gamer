import React, { useEffect, useState } from "react";
import HomeComponent from "../components/HomeComponent";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import Loader from "../components/common/Loader";

export default function Home({ currentUser }) {
  const [loading, setLoading] = useState(true);
  let navigate = useNavigate();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (res) => {
      if (!res) {
        navigate("/");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);
  return loading ? <Loader /> : <HomeComponent currentUser={currentUser} />;
}
