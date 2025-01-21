import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function TeacherPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [teams, setTeams] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    if (!userData || userData.type !== "teacher") {
      alert("You must be logged in as a teacher!");
      navigate("/");
      return;
    }
    setCurrentUser(userData);

    const storedTeams = JSON.parse(localStorage.getItem("teams")) || {};
    setTeams(storedTeams);
  }, [navigate]);

  const getAverageGrade = (teamObj) => {
    if (!teamObj.grades || teamObj.grades.length < 3) {
      return "Not enough grades yet.";
    }
    const gradeValues = teamObj.grades.map((g) => g.grade);
    const sum = gradeValues.reduce((a, b) => a + b, 0);
    const minVal = Math.min(...gradeValues);
    const maxVal = Math.max(...gradeValues);
    return (sum - minVal - maxVal) / (gradeValues.length - 2);
  };

  return (
    <div id="teacherPage">
      <h2>Welcome Teacher</h2>
      <p>You are logged in as a teacher.</p>
      <h3>Team Dashboard</h3>
      <div id="teamDashboard">
        {Object.keys(teams).length === 0 && (
          <p>No teams have been created yet.</p>
        )}
        {Object.entries(teams).map(([teamName, teamObj]) => {
          const members = teamObj.teamMembers || [];
          const linkRequirements = teamObj.linkRequirements || [];
          const grades = teamObj.grades || [];
          const averageGrade =
            grades.length >= 3 ? getAverageGrade(teamObj) : "Not enough grades yet.";

          return (
            <div key={teamName}>
              <h4>{teamName}</h4>
              <p>
                <strong>Members:</strong>{" "}
                {members.length > 0 ? members.join(", ") : "None"}
              </p>
              <h5>Grades:</h5>
              <ul>
                {grades.length > 0 ? (
                  grades.map((entry, idx) => <li key={idx}>{entry.grade}</li>)
                ) : (
                  <li>No grades submitted yet.</li>
                )}
              </ul>
              <p>
                <strong>Average Grade:</strong> {averageGrade}
              </p>
              <h5>Project Requirements:</h5>
              <ul>
                {linkRequirements.length > 0 ? (
                  linkRequirements.map((req, idx) => (
                    <li key={idx}>
                      {req.description} ({req.type})
                    </li>
                  ))
                ) : (
                  <li>No requirements added yet.</li>
                )}
              </ul>
              <hr />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeacherPage;
