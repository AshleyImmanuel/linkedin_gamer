import React from "react";
import "../Sass/HomeComponent.scss";
import PostStatus from "./common/PostUpdate";
import Introduction from "./common/Introduction";

export default function HomeComponent({ currentUser }) {
  return (
    <div className="home-component">
      <Introduction />
      <div id="community-feed-section">
        <PostStatus currentUser={currentUser} />
      </div>
    </div>
  );
}

