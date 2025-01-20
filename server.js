const express = require("express");
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");

// Initialize SQLite with Sequelize
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "database.sqlite", // SQLite file location
});

// Define Models
const User = sequelize.define("user", {
    username: { type: Sequelize.STRING, unique: true },
    password: Sequelize.STRING,
    type: Sequelize.STRING, // 'student' or 'teacher'
});

const Team = sequelize.define("team", {
    name: { type: Sequelize.STRING, unique: true },
});

const Grade = sequelize.define("grade", {
    grade: Sequelize.INTEGER,
    timestamp: Sequelize.DATE,
});

// Define Relationships
Grade.belongsTo(User, { as: "grader", foreignKey: "grader_id" });
Grade.belongsTo(Team, { foreignKey: "team_id" });

const app = express();
app.use(bodyParser.json());

// Sync database
app.post("/sync", async (req, res) => {
    try {
        await sequelize.sync({ force: true }); // Recreate tables
        res.status(201).json({ message: "Database synchronized!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to the API! Use appropriate endpoints to interact with the server.");
});

// User routes
app.post("/users", async (req, res) => {
    const { username, password, type } = req.body;
    try {
        const user = await User.create({ username, password, type });
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Team routes
app.post("/teams", async (req, res) => {
    const { name } = req.body;
    try {
        const team = await Team.create({ name });
        res.status(201).json(team);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get("/teams", async (req, res) => {
    try {
        const teams = await Team.findAll();
        res.status(200).json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Grade routes
app.post("/grades", async (req, res) => {
    const { grader_id, team_id, grade } = req.body;
    try {
        const timestamp = new Date();
        const gradeEntry = await Grade.create({ grader_id, team_id, grade, timestamp });
        res.status(201).json(gradeEntry);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get("/teams/:teamId/grades", async (req, res) => {
    const { teamId } = req.params;
    try {
        const grades = await Grade.findAll({ where: { team_id: teamId } });
        res.status(200).json(grades);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.put("/grades/:id", async (req, res) => {
    const { id } = req.params; // Grade ID
    const { grade } = req.body; // New grade

    try {
        const gradeEntry = await Grade.findByPk(id); // Find the grade by its ID

        if (!gradeEntry) {
            return res.status(404).json({ error: "Grade not found" });
        }

        // Update only the grade field, leaving timestamp and others unchanged
        await gradeEntry.update({ grade });

        res.status(200).json(gradeEntry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Start server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
