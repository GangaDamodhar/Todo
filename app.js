const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = process.env.PORT || 3000;

// Create a new SQLite database and connect to it
const db = new sqlite3.Database("todoApplication.db");

// Create the 'todo' table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      todo TEXT,
      priority TEXT,
      status TEXT
    )
  `);
});

app.use(express.json());

// API 1: GET /todos/
app.get("/todos/", (req, res) => {
  const { status, priority, search_q } = req.query;
  let query = "SELECT * FROM todo WHERE 1";

  if (status) {
    query += ` AND status='${status}'`;
  }

  if (priority) {
    query += ` AND priority='${priority}'`;
  }

  if (search_q) {
    query += ` AND todo LIKE '%${search_q}%'`;
  }

  db.all(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API 2: GET /todos/:todoId/
app.get("/todos/:todoId/", (req, res) => {
  const todoId = req.params.todoId;
  db.get(`SELECT * FROM todo WHERE id=${todoId}`, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(row);
  });
});

// API 3: POST /todos/
app.post("/todos/", (req, res) => {
  const { id, todo, priority, status } = req.body;
  db.run(
    `INSERT INTO todo (id, todo, priority, status) VALUES (?, ?, ?, ?)`,
    [id, todo, priority, status],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Todo Successfully Added" });
    }
  );
});

// API 4: PUT /todos/:todoId/
app.put("/todos/:todoId/", (req, res) => {
  const todoId = req.params.todoId;
  const { todo, priority, status } = req.body;

  if (todo !== undefined) {
    db.run(`UPDATE todo SET todo=? WHERE id=?`, [todo, todoId], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: "Todo Updated" });
    });
  } else if (priority !== undefined) {
    db.run(
      `UPDATE todo SET priority=? WHERE id=?`,
      [priority, todoId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Priority Updated" });
      }
    );
  } else if (status !== undefined) {
    db.run(
      `UPDATE todo SET status=? WHERE id=?`,
      [status, todoId],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Status Updated" });
      }
    );
  } else {
    res.status(400).json({ error: "Invalid request body" });
  }
});

// API 5: DELETE /todos/:todoId/
app.delete("/todos/:todoId/", (req, res) => {
  const todoId = req.params.todoId;
  db.run(`DELETE FROM todo WHERE id=?`, [todoId], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "Todo Deleted" });
  });
});

module.exports = app;
