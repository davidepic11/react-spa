import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");
  const [teacherKey, setTeacherKey] = useState("");
  const navigate = useNavigate();

  const TEACHER_KEY = "1";

  const handleRegister = () => {
    const users = JSON.parse(localStorage.getItem("users")) || {};

    if (users[username]) {
      alert("Username already taken.");
      return;
    }

    if (userType === "teacher" && teacherKey !== TEACHER_KEY) {
      alert("Invalid teacher key!");
      return;
    }

  
    users[username] = {
      username,
      password,
      type: userType,
      team: null,
      randomTeam: null
    };

    localStorage.setItem("users", JSON.stringify(users));
    alert("Registration successful! Please login.");
    navigate("/");
  };

  return (
    <div>
      <h2>Register</h2>
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
      <select value={userType} onChange={(e) => setUserType(e.target.value)}>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
      {userType === "teacher" && (
        <input
          type="password"
          placeholder="Teacher Key"
          value={teacherKey}
          onChange={(e) => setTeacherKey(e.target.value)}
        />
      )}
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default RegisterPage;
