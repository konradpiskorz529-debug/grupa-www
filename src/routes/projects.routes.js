// IMPORTY
const express = require("express");
const { body, param, validationResult } = require("express-validator");
const { all, run } = require("../db");

// ROUTER
const router = express.Router();

// WALIDACJA
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
}

// GET: LISTA
router.get("/", async (req, res, next) => {
  try {
    const projects = await all("SELECT * FROM projects ORDER BY id DESC;");
    res.json(projects);
  } catch (e) {
    next(e);
  }
});

// POST: DODAJ
router.post(
  "/",
  body("name").trim().isLength({ min: 2 }).withMessage("Name min 2 znaki"),
  async (req, res, next) => {
    try {
      if (handleValidation(req, res)) return;
      const { name } = req.body;

      const result = await run("INSERT INTO projects(name) VALUES (?);", [name]);
      const rows = await all("SELECT * FROM projects WHERE id = ?;", [result.lastID]);

      res.status(201).json(rows[0]);
    } catch (e) {
      next(e);
    }
  }
);

// DELETE: USUŃ
router.delete(
  "/:id",
  param("id").isInt().withMessage("id musi być liczbą"),
  async (req, res, next) => {
    try {
      if (handleValidation(req, res)) return;
      const id = Number(req.params.id);

      const exists = await all("SELECT id FROM projects WHERE id = ?;", [id]);
      if (exists.length === 0) return res.status(404).json({ error: "Not found" });

      await run("DELETE FROM projects WHERE id = ?;", [id]);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

// EXPORT
module.exports = router;
