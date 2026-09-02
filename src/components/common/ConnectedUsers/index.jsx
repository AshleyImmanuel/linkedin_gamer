import React, { useEffect, useState } from "react";
import { AiOutlineUsergroupAdd, AiOutlineCheck } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { getConnections } from "../../../api/FirestoreAPI";
import userIcon from "../../../assets/user.png";

export default function ConnectedUsers({ user, getCurrentUser, currentUser }) {
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.id || !user?.id) return;
    const unsubscribe = getConnections(currentUser.id, user.id, setIsConnected);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.id, user?.id]);

  const openProfile = () => {
    if (user?.id === currentUser?.id) {
      navigate("/profile");
    } else {
      navigate(`/user/${user.id}`, {
        state: { id: user.id, email: user.email },
      });
    }
  };

  return (
    <div className="grid-child" onClick={openProfile}>
      <img
        src={user.imageLink || userIcon}
        alt={user.name || "User"}
        className="user-avatar"
      />
      <p className="name">{user.name || "Anonymous User"}</p>
      <p className="headline">{user.headline || "Credora Member"}</p>

      {isConnected ? (
        <button
          className="connected-btn"
          disabled
          onClick={(e) => e.stopPropagation()}
        >
          <AiOutlineCheck size={18} />
          Connected
        </button>
      ) : (
        <button
          className="connect-btn"
          onClick={(e) => {
            e.stopPropagation();
            getCurrentUser(user.id);
          }}
        >
          <AiOutlineUsergroupAdd size={20} />
          Connect
        </button>
      )}
    </div>
  );
}

