const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const { all, run } = require("../db");

const router = express.Router();

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

async function projectExists(projectId) {
  const rows = await all("SELECT id FROM projects WHERE id = ?;", [projectId]);
  return rows.length > 0;
}

const ALLOWED_STATUS = ["todo", "doing", "done"];

// GET /api/tasks?projectId=1
router.get(
  "/",
  query("projectId").isInt().withMessage("projectId musi być liczbą"),
  async (req, res, next) => {
    try {
      if (handleValidation(req, res)) return;

      const projectId = Number(req.query.projectId);
      const tasks = await all(
        "SELECT * FROM tasks WHERE project_id = ? ORDER BY id DESC;",
        [projectId]
      );
      res.json(tasks);
    } catch (e) {
      next(e);
    }
  }
);

// POST /api/tasks
router.post(
  "/",
  body("project_id").isInt().withMessage("project_id musi być liczbą"),
  body("title").trim().isLength({ min: 2 }).withMessage("title min 2 znaki"),
  body("status")
    .optional()
    .isIn(ALLOWED_STATUS)
    .withMessage("status: todo/doing/done"),
  body("description").optional().isString(),
  body("due_date").optional().isString(),
  async (req, res, next) => {
    try {
      if (handleValidation(req, res)) return;

      const { project_id, title, description = "", status = "todo", due_date = null } =
        req.body;

      const pid = Number(project_id);
      if (!(await projectExists(pid))) {
        return res.status(400).json({ error: "project_id nie istnieje" });
      }

      const result = await run(
        "INSERT INTO tasks(project_id, title, description, status, due_date) VALUES (?, ?, ?, ?, ?);",
        [pid, title, description, status, due_date]
      );

      const rows = await all("SELECT * FROM tasks WHERE id = ?;", [result.lastID]);
      res.status(201).json(rows[0]);
    } catch (e) {
      next(e);
    }
  }
);

// PUT /api/tasks/:id
router.put(
  "/:id",
  param("id").isInt().withMessage("id musi być liczbą"),
  body("title").trim().isLength({ min: 2 }).withMessage("title min 2 znaki"),
  body("status").isIn(ALLOWED_STATUS).withMessage("status: todo/doing/done"),
  body("description").optional().isString(),
  body("due_date").optional().isString(),
  async (req, res, next) => {
    try {
      if (handleValidation(req, res)) return;

      const id = Number(req.params.id);
      const exists = await all("SELECT id FROM tasks WHERE id = ?;", [id]);
      if (exists.length === 0) return res.status(404).json({ error: "Not found" });

      const { title, description = "", status, due_date = null } = req.body;

      await run(
        "UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE id = ?;",
        [title, description, status, due_date, id]
      );

      const rows = await all("SELECT * FROM tasks WHERE id = ?;", [id]);
      res.json(rows[0]);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE /api/tasks/:id
router.delete(
  "/:id",
  param("id").isInt().withMessage("id musi być liczbą"),
  async (req, res, next) => {
    try {
      if (handleValidation(req, res)) return;

      const id = Number(req.params.id);
      const exists = await all("SELECT id FROM tasks WHERE id = ?;", [id]);
      if (exists.length === 0) return res.status(404).json({ error: "Not found" });

      await run("DELETE FROM tasks WHERE id = ?;", [id]);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
