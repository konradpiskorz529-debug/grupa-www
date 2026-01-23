require("dotenv").config();
const express = require("express");
const { initDb } = require("./db");

const projectsRoutes = require("./routes/projects.routes");
const tasksRoutes = require("./routes/tasks.routes");

const app = express();

// middleware
app.use(express.json());
app.use(express.static("public"));

// test endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// init database (tables + FK)
initDb()
  .then(() => console.log("DB ready"))
  .catch((e) => console.error("DB init error:", e));

// routes
app.use("/api/projects", projectsRoutes);
app.use("/api/tasks", tasksRoutes);

// 404 for API
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Server error" });
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
