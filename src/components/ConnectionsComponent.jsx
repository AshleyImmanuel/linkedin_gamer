import React, { useEffect, useState } from "react";
import { getAllUsers, addConnection } from "../api/FirestoreAPI";
import ConnectedUsers from "./common/ConnectedUsers";
import "../Sass/ConnectionsComponent.scss";

export default function ConnectionsComponent({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCurrentUser = (id) => {
    addConnection(currentUser.id, id);
  };

  useEffect(() => {
    const unsubscribe = getAllUsers((allUsers) => {
      setUsers(allUsers);
      setLoading(false);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const otherUsers = users.filter((user) => user.id !== currentUser?.id);

  return (
    <div className="users-page-container">
      <div className="users-header">
        <h2 className="users-title">Discover Users</h2>
        <p className="users-subtitle">
          Connect with creators, developers, and professionals in the Credora community.
        </p>
      </div>

      {loading ? (
        <div className="users-loading">Loading users directory...</div>
      ) : otherUsers.length > 0 ? (
        <div className="connections-main">
          {otherUsers.map((user) => (
            <ConnectedUsers
              key={user.id}
              currentUser={currentUser}
              user={user}
              getCurrentUser={getCurrentUser}
            />
          ))}
        </div>
      ) : (
        <div className="empty-users-state">
          <h3>No other users found</h3>
          <p>You are the first registered user on Credora, or other users have not joined yet.</p>
        </div>
      )}
    </div>
  );
}

