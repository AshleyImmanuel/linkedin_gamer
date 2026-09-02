import React, { useEffect, useState } from "react";
import CredoraLogo from "../../../assets/Credora.jpeg";
import user from "../../../assets/user.png";
import SearchUsers from "../SearchUsers";
import {
  AiOutlineHome,
  AiOutlineUserSwitch,
  AiOutlineSearch,
  AiOutlineMessage,
  AiOutlineBell,
} from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import { BsBriefcase } from "react-icons/bs";
import { getAllUsers } from "../../../api/FirestoreAPI";
import ProfilePopup from "../ProfilePopup";
import "./index.scss";

export default function Topbar({ currentUser }) {
  const [popupVisible, setPopupVisible] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  let navigate = useNavigate();
  let location = useLocation();
  const goToRoute = (route) => {
    navigate(route);
  };

  const displayPopup = () => {
    setPopupVisible(!popupVisible);
  };

  const openUser = (user) => {
    navigate(`/user/${user.id}`, {
      state: {
        id: user.id,
        email: user.email,
      },
    });
  };

  const handleSearch = () => {
    if (searchInput !== "") {
      let searched = users.filter((user) => {
        return Object.values(user)
          .join("")
          .toLowerCase()
          .includes(searchInput.toLowerCase());
      });

      setFilteredUsers(searched);
    } else {
      setFilteredUsers(users);
    }
  };

  useEffect(() => {
    let debounced = setTimeout(() => {
      handleSearch();
    }, 1000);

    return () => clearTimeout(debounced);
  }, [searchInput]);

  useEffect(() => {
    const unsubscribe = getAllUsers(setUsers);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="topbar-main">
      {popupVisible ? (
        <div className="popup-position">
          <ProfilePopup />
        </div>
      ) : (
        <></>
      )}

      <img
        className="linkedin-logo"
        src={CredoraLogo}
        alt="CredoraLogo"
        title="Credora Home"
        onClick={() => goToRoute("/home")}
      />
      {isSearch ? (
        <SearchUsers
          setIsSearch={setIsSearch}
          setSearchInput={setSearchInput}
        />
      ) : (
        <div className="react-icons">
          <AiOutlineSearch
            size={30}
            className="react-icon"
            title="Search"
            onClick={() => setIsSearch(true)}
          />
          <AiOutlineHome
            size={30}
            className={`react-icon ${location.pathname === "/home" ? "active" : ""}`}
            title="Home Feed"
            onClick={() => goToRoute("/home")}
          />
          <AiOutlineUserSwitch
            size={30}
            className={`react-icon ${location.pathname === "/users" || location.pathname === "/connections" ? "active" : ""}`}
            title="Users Directory"
            onClick={() => goToRoute("/users")}
          />
          <BsBriefcase size={30} className="react-icon" title="Jobs" />
          <AiOutlineMessage size={30} className="react-icon" title="Messages" />
          <AiOutlineBell size={30} className="react-icon" title="Notifications" />
        </div>
      )}
      <img
        className={`user-logo ${location.pathname === "/profile" ? "active" : ""}`}
        src={currentUser?.imageLink || user}
        alt="user"
        title="My Profile"
        onClick={displayPopup}
      />

      {searchInput.length === 0 ? (
        <></>
      ) : (
        <div className="search-results">
          {filteredUsers.length === 0 ? (
            <div className="search-inner">No Results Found..</div>
          ) : (
            filteredUsers.map((userItem) => (
              <div
                key={userItem.id}
                className="search-inner"
                onClick={() => openUser(userItem)}
              >
                <img src={userItem.imageLink || user} alt={userItem.name} />
                <p className="name">{userItem.name || "User"}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
