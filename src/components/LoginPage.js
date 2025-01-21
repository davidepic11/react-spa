import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users")) || {};

    if (!users[username]) {
      alert("User not found!");
      return;
    }

    if (users[username].password !== password) {
      alert("Invalid password.");
      return;
    }

    
    const user = users[username];
   
    localStorage.setItem("currentUser", JSON.stringify(user));
    console.log("Logged in user:", user);

    if (user.type === "student") {
      navigate("/student");
    } else if (user.type === "teacher") {
      navigate("/teacher");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      <p>
        Don't have an account?
        <a href="/register" onClick={(e) => { e.preventDefault(); navigate("/register"); }}>
          Register here
        </a>
      </p>
    </div>
  );
}

export default LoginPage;
