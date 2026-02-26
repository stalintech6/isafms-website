const express = require("express");
const multer = require("multer");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const db = new sqlite3.Database("./database.db");

// Create table
db.run(`CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studentName TEXT,
    title TEXT,
    filename TEXT,
    deadline TEXT,
    submittedAt TEXT
)`);

// File storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Submit assignment
app.post("/submit", upload.single("file"), (req, res) => {
  const { studentName, title, deadline } = req.body;
  const submittedAt = new Date().toISOString();

  db.run(
    `INSERT INTO assignments (studentName, title, filename, deadline, submittedAt)
     VALUES (?, ?, ?, ?, ?)`,
    [studentName, title, req.file.filename, deadline, submittedAt],
    () => {
      res.send("Assignment Submitted Successfully!");
    }
  );
});

// Get all assignments
app.get("/assignments", (req, res) => {
  db.all("SELECT * FROM assignments", (err, rows) => {
    res.json(rows);
  });
});

// Dashboard count
app.get("/dashboard", (req, res) => {
  db.all("SELECT * FROM assignments", (err, rows) => {
    const total = rows.length;
    const late = rows.filter(r => new Date(r.submittedAt) > new Date(r.deadline)).length;
    res.json({
      total,
      onTime: total - late,
      late
    });
  });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
