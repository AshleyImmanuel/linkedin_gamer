import React, { useEffect, useState } from "react";
import Home from "../Pages/Home";
import { getCurrentUser } from "../api/FirestoreAPI";
import Topbar from "../components/common/Topbar";

export default function HomeLayout() {
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const unsubscribe = getCurrentUser(setCurrentUser);
    return () => unsubscribe();
  }, []);
  return (
    <div>
      <Topbar currentUser={currentUser} />
      <Home currentUser={currentUser} />
    </div>
  );
}
