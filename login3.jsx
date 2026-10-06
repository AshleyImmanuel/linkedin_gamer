import { useState } from "react";
import "./login3.css";

const CardBackground = ({ activeView }) => (
    <div className={`card-bg ${activeView === "login" ? "login" : ""}`} />
);

const SocialButtons = () => (
    <div className="sso">
        <a href="#" className="fa-brands fa-facebook"></a>
        <a href="#" className="fa-brands fa-twitter"></a>
        <a href="#" className="fa-brands fa-linkedin"></a>
    </div>
);

const HeroPanel = ({ type, activeView, title, text, buttonText, onToggle }) => (
    <div className={`hero ${type} ${activeView === type ? "active" : ""}`}>
        <h2>{title}</h2>
        <p>{text}</p>
        <button type="button" onClick={onToggle}>
            {buttonText}
        </button>
    </div>
);

const RegisterForm = ({ activeView }) => (
    <div className={`form register ${activeView === "register" ? "active" : ""}`}>
        <h2>Sign Up</h2>
        <SocialButtons />
        <p>or use your email for registration</p>
        <form onSubmit={(e) => e.preventDefault()}>
            <input type="text" placeholder="Full Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button type="submit">SIGN UP</button>
        </form>
    </div>
);

const LoginForm = ({ activeView }) => (
    <div className={`form login ${activeView === "login" ? "active" : ""}`}>
        <h2>Login</h2>
        <SocialButtons />
        <p>or use your email and password for login</p>
        <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <a style={{ paddingTop: "6px", marginBottom: "7px" }} href="#">
                Forgot your password?
            </a>
            <button type="submit">LOGIN</button>
        </form>
    </div>
);

export const Login3 = () => {
    const [activeView, setActiveView] = useState("login");

    const toggleView = () => {
        setActiveView((prev) => (prev === "login" ? "register" : "login"));
    };

    return (
        <div className="card">
            <CardBackground activeView={activeView} />
            <HeroPanel 
                type="register" 
                activeView={activeView} 
                title="Join Now" 
                text="Create a free account to connect with professionals and grow your network." 
                buttonText="Sign Up" 
                onToggle={toggleView} 
            />
            <RegisterForm activeView={activeView} />
            <HeroPanel 
                type="login" 
                activeView={activeView}
                title="Welcome Back"
                text="Log in to your account to continue connecting with professionals."
                buttonText="Log In"
                onToggle={toggleView}
            />
            <LoginForm activeView={activeView} />
        </div>
    );
};

export default Login3;