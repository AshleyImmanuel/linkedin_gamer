import React, { useEffect, useState } from "react";
import Connections from "../Pages/Connections";
import { getCurrentUser } from "../api/FirestoreAPI";
import Topbar from "../components/common/Topbar";

export default function ConnectionLayout() {
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const unsubscribe = getCurrentUser(setCurrentUser);
    return () => unsubscribe();
  }, []);
  return (
    <div>
      <Topbar currentUser={currentUser} />
      <Connections currentUser={currentUser} />
    </div>
  );
}
