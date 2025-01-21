import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function StudentPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState({});
  const [teams, setTeams] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

 
  const [requirementDescription, setRequirementDescription] = useState("");
  const [requirementType, setRequirementType] = useState("");

  
  const [projectLink, setProjectLink] = useState("");
  const [selectedRequirementIndex, setSelectedRequirementIndex] = useState("");

 
  const [studentNumber, setStudentNumber] = useState("");

  useEffect(() => {
   
    const storedUsers = JSON.parse(localStorage.getItem("users")) || {};
    const storedTeams = JSON.parse(localStorage.getItem("teams")) || {};
    const userData = JSON.parse(localStorage.getItem("currentUser"));

    setUsers(storedUsers);
    setTeams(storedTeams);

    if (!userData || userData.type !== "student") {
      alert("You must be logged in as a student!");
      navigate("/");
      return;
    }
    setCurrentUser(userData);
  }, [navigate]);

 
  const updateLocalStorage = (newUsers, newTeams, newUser = null) => {
    if (newUsers) {
      localStorage.setItem("users", JSON.stringify(newUsers));
      setUsers(newUsers);
    }
    if (newTeams) {
      localStorage.setItem("teams", JSON.stringify(newTeams));
      setTeams(newTeams);
    }
    if (newUser) {
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      setCurrentUser(newUser);
    }
  };

  //Partea de update din CRUD
  const canModifyGrade = (teamObj, graderName) => {
    if (!teamObj) return false;
    const entry = teamObj.grades.find((g) => g.grader === graderName);
    if (!entry) return false;
    const timeframe = 7 * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - entry.timestamp;
    return elapsed <= timeframe;
  };

 
  const getRemainingTime = (teamObj, graderName) => {
    if (!teamObj) return null;
    const entry = teamObj.grades.find((g) => g.grader === graderName);
    if (!entry) return null;

    const timeframe = 7 * 24 * 60 * 60 * 1000;
    const elapsed = Date.now() - entry.timestamp;
    if (elapsed > timeframe) return null;

    const remaining = timeframe - elapsed;
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor(
      (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );
    const minutes = Math.floor(
      (remaining % (60 * 60 * 1000)) / (60 * 1000)
    );

    return `${days} days, ${hours} hours, ${minutes} minutes`;
  };


  const chooseTeam = (teamName) => {
    if (!currentUser) return;
    const updatedTeams = { ...teams };

    if (!updatedTeams[teamName]) {
      updatedTeams[teamName] = {
        teamName,
        teamMembers: [],
        teamLinks: [],
        linkRequirements: [],
        grades: []
      };
    }

    if (!updatedTeams[teamName].teamMembers.includes(currentUser.username)) {
      updatedTeams[teamName].teamMembers.push(currentUser.username);
    }

    const updatedUser = { ...currentUser, team: teamName };
    const updatedUsers = { ...users, [updatedUser.username]: updatedUser };

    updateLocalStorage(updatedUsers, updatedTeams, updatedUser);
    alert(`You have joined ${teamName}!`);
  };

 
  const addLinkRequirement = () => {
    if (!currentUser?.team) {
      alert("You must be in a team to add requirements.");
      return;
    }
    if (!requirementDescription || !requirementType) {
      alert("Please fill in both fields.");
      return;
    }

    const updatedTeams = { ...teams };
    const teamObj = updatedTeams[currentUser.team];
    if (!teamObj) {
      alert("Team not found in localStorage.");
      return;
    }

    teamObj.linkRequirements.push({
      description: requirementDescription,
      type: requirementType,
      links: []
    });

    updateLocalStorage(null, updatedTeams);
    alert("Requirement added!");
    setRequirementDescription("");
    setRequirementType("");
  };

  const getLinkRequirementsForTeam = () => {
    if (!currentUser?.team) return [];
    const tObj = teams[currentUser.team];
    return tObj ? tObj.linkRequirements : [];
  };

 
  const uploadProjectLink = () => {
    if (!currentUser?.team) {
      alert("Must be in a team first!");
      return;
    }
    if (!projectLink) {
      alert("Please enter a valid project link.");
      return;
    }
    if (selectedRequirementIndex === "") {
      alert("Select a link requirement.");
      return;
    }

    const updatedTeams = { ...teams };
    const teamObj = updatedTeams[currentUser.team];
    const req = teamObj.linkRequirements[selectedRequirementIndex];
    req.links.push(projectLink);

    updateLocalStorage(null, updatedTeams);
    alert("Link uploaded!");
    setProjectLink("");
    setSelectedRequirementIndex("");
  };

 
  const loadRandomProject = () => {
    if (!currentUser) return;
    if (currentUser.randomTeam) {
      alert(`Already assigned to grade ${currentUser.randomTeam}`);
      return;
    }

    const teamNames = Object.keys(teams);
    if (teamNames.length <= 1) {
      alert("No teams for random selection.");
      return;
    }

    let randomTeamName;
    do {
      const idx = Math.floor(Math.random() * teamNames.length);
      randomTeamName = teamNames[idx];
    } while (randomTeamName === currentUser.team);

    const updatedUser = { ...currentUser, randomTeam: randomTeamName };
    const updatedUsers = { ...users, [updatedUser.username]: updatedUser };

    updateLocalStorage(updatedUsers, null, updatedUser);
    alert(`You have been assigned to grade ${randomTeamName}.`);
  };

 
  const saveStudentNumber = () => {
    if (!currentUser) return;
    const randomTeamName = currentUser.randomTeam;
    if (!randomTeamName) {
      alert("Not assigned to a random team yet.");
      return;
    }

    const gradeVal = parseFloat(studentNumber);
    if (isNaN(gradeVal) || gradeVal < 0 || gradeVal > 10) {
      alert("Please enter a valid grade (0-10).");
      return;
    }

    const updatedTeams = { ...teams };
    const gradingTeam = updatedTeams[randomTeamName];
    if (!gradingTeam) {
      alert(`Team ${randomTeamName} not found.`);
      return;
    }

    const now = Date.now();
    const existingGrade = gradingTeam.grades.find(
      (g) => g.grader === currentUser.username
    );

    if (!existingGrade) {
     
      gradingTeam.grades.push({
        grader: currentUser.username,
        grade: gradeVal,
        timestamp: now
      });
    } else {
     
      const timeframe = 7 * 24 * 60 * 60 * 1000;
      const elapsed = now - existingGrade.timestamp;
      if (elapsed > timeframe) {
        alert("You can no longer modify this grade (over 7 days).");
        return;
      }
     
      existingGrade.grade = gradeVal;
      existingGrade.timestamp = now;
    }

    updateLocalStorage(null, updatedTeams);
    alert(`Grade (${gradeVal}) has been saved.`);
    setStudentNumber("");
  };

  
  const renderRandomTeamDetails = () => {
    if (!currentUser?.randomTeam) {
      return <p>No project available to display.</p>;
    }
    const teamObj = teams[currentUser.randomTeam];
    if (!teamObj) {
      return <p>Team {currentUser.randomTeam} not found.</p>;
    }

    return (
      <div>
        <h4>Details for {currentUser.randomTeam}</h4>
        
        
        <h5>Link Requirements:</h5>
        <ul>
          {teamObj.linkRequirements.length > 0 ? (
            teamObj.linkRequirements.map((req, idx) => (
              <li key={idx}>
                <strong>{req.description} ({req.type})</strong>
                <ul>
                  {req.links && req.links.length > 0 ? (
                    req.links.map((lk, i) => (
                      <li key={i}>
                        <a href={lk} target="_blank" rel="noreferrer">{lk}</a>
                      </li>
                    ))
                  ) : (
                    <li>No links uploaded yet.</li>
                  )}
                </ul>
              </li>
            ))
          ) : (
            <li>No link requirements yet.</li>
          )}
        </ul>

        
        
      </div>
    );
  };

 
  const renderGradingSection = () => {
    if (!currentUser?.randomTeam) {
      return <p>You have not been assigned to grade a team yet.</p>;
    }
    const gradingTeam = teams[currentUser.randomTeam];
    if (!gradingTeam) {
      return <p>The team you were assigned to grade does not exist anymore.</p>;
    }

    const existingGrade = gradingTeam.grades.find(
      (g) => g.grader === currentUser.username
    );
    if (existingGrade) {
      const stillCanEdit = canModifyGrade(gradingTeam, currentUser.username);
      const timeLeft = getRemainingTime(gradingTeam, currentUser.username);
      return (
        <div>
          <p>Your grade for {currentUser.randomTeam}: {existingGrade.grade}</p>
          {timeLeft ? (
            <p>Time left to modify: {timeLeft}</p>
          ) : (
            <p>The modification timeframe has expired.</p>
          )}
          {stillCanEdit && (
            <>
              <input
                type="number"
                placeholder="Submit/Update grade (0-10)"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
              />
              <button onClick={saveStudentNumber}>Submit/Update Grade</button>
            </>
          )}
        </div>
      );
    } else {
      return (
        <div>
          <p>You have not submitted a grade for {currentUser.randomTeam} yet.</p>
          <input
            type="number"
            placeholder="Submit a grade (0-10)"
            value={studentNumber}
            onChange={(e) => setStudentNumber(e.target.value)}
          />
          <button onClick={saveStudentNumber}>Submit Grade</button>
        </div>
      );
    }
  };

 
  if (!currentUser) {
    return <div>Loading...</div>;
  }
  const myTeamReqs = currentUser.team
    ? teams[currentUser.team]?.linkRequirements || []
    : [];

  return (
    <div id="studentPage">
      <h2>Welcome Student</h2>

      {currentUser.team ? (
        <p id="teamMessage">You are part of {currentUser.team}.</p>
      ) : (
        <p id="teamMessage">You have not chosen a team yet.</p>
      )}

      {/* Team Selection */}
      {!currentUser.team && (
        <div id="teamSelection">
          <h3>Select a Team</h3>
          {[
            "Team 1","Team 2","Team 3","Team 4","Team 5",
            "Team 6","Team 7","Team 8","Team 9","Team 10"
          ].map((t) => (
            <button key={t} onClick={() => chooseTeam(t)}>
              {t}
            </button>
          ))}
        </div>
      )}

      
      {currentUser.team && (
        <div id="linkRequirementsSection">
          <h3>Add Link Requirement</h3>
          <input
            id="requirementDescription"
            placeholder="Requirement description"
            value={requirementDescription}
            onChange={(e) => setRequirementDescription(e.target.value)}
          />
          <input
            id="requirementType"
            placeholder="Requirement type (e.g. 'PDF', 'Video')"
            value={requirementType}
            onChange={(e) => setRequirementType(e.target.value)}
          />
          <button onClick={addLinkRequirement}>Add Requirement</button>
          <h4>Current Link Requirements:</h4>
          <ul>
            {myTeamReqs.map((req, idx) => (
              <li key={idx}>
                <strong>{req.description} ({req.type})</strong>
                <ul>
                  {req.links && req.links.length>0 ? (
                    req.links.map((lk, i) => (
                      <li key={i}>
                        <a href={lk} target="_blank" rel="noreferrer">{lk}</a>
                      </li>
                    ))
                  ) : (
                    <li>No links uploaded yet.</li>
                  )}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

     
      {currentUser.team && (
        <div id="projectUploadSection">
          <h3>Upload Project Link</h3>
          <input
            id="projectLink"
            placeholder="Enter project link"
            value={projectLink}
            onChange={(e) => setProjectLink(e.target.value)}
          />
          <select
            id="linkRequirementSelector"
            value={selectedRequirementIndex}
            onChange={(e) => setSelectedRequirementIndex(e.target.value)}
          >
            <option value="">Select Link Requirement</option>
            {myTeamReqs.map((req, idx) => (
              <option key={idx} value={idx}>
                {req.description} ({req.type})
              </option>
            ))}
          </select>
          <button onClick={uploadProjectLink}>Upload Link</button>
        </div>
      )}

     
      {currentUser.team && (
        <div id="randomProjectSection" style={{ marginTop: "20px" }}>
          <h3>Random Project Display</h3>
          {currentUser.randomTeam ? (
            renderRandomTeamDetails()
          ) : (
            <p>No project available to display.</p>
          )}
          {!currentUser.randomTeam && (
            <button id="randomTeamButton" onClick={loadRandomProject}>
              Select a Random Team
            </button>
          )}
        </div>
      )}

      
      {currentUser.team && (
        <div id="studentNumberInput" style={{ marginTop: "20px" }}>
          <h3>Insert a Grade</h3>
          {renderGradingSection()}
        </div>
      )}
    </div>
  );
}

export default StudentPage;
