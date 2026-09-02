import React from "react";
import "../Sass/HomeComponent.scss";
import PostStatus from "./common/PostUpdate";

export default function HomeComponent({ currentUser }) {
  return (
    <div className="home-component">
      <div id="community-feed-section">
        <PostStatus currentUser={currentUser} />
      </div>
    </div>
  );
}

