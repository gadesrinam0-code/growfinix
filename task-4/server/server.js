const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// HOME
// ==========================================
app.get("/", (req, res) => {
  res.json({
    message: "Growfinix Task 4 Blog API is running",
  });
});

// ==========================================
// TEST DATABASE
// ==========================================
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected successfully",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// ==========================================
// GET ALL BLOG POSTS
// ==========================================
app.get("/api/posts", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM posts ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get posts error:", error.message);

    res.status(500).json({
      message: "Failed to fetch blog posts",
      error: error.message,
    });
  }
});

// ==========================================
// GET SINGLE BLOG POST
// ==========================================
app.get("/api/posts/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM posts WHERE id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Blog post not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get single post error:", error.message);

    res.status(500).json({
      message: "Failed to fetch blog post",
      error: error.message,
    });
  }
});

// ==========================================
// CREATE BLOG POST + AI TAGGING
// ==========================================
app.post("/api/posts", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    let tags = "General";

    // ------------------------------
    // AI TAG GENERATION
    // ------------------------------
    if (process.env.HF_TOKEN) {
      try {
        const aiResponse = await fetch(
          "https://router.huggingface.co/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "HuggingFaceH4/zephyr-7b-beta",
              messages: [
                {
                  role: "system",
                  content:
                    "Generate 3 to 5 short and relevant tags for the blog post. Return only comma-separated tags.",
                },
                {
                  role: "user",
                  content: `Title: ${title}\n\nContent: ${content}`,
                },
              ],
              max_tokens: 50,
            }),
          }
        );

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();

          const generatedTags =
            aiData?.choices?.[0]?.message?.content?.trim();

          if (generatedTags) {
            tags = generatedTags;
          }
        } else {
          console.log(
            "AI request failed:",
            aiResponse.status,
            await aiResponse.text()
          );
        }
      } catch (aiError) {
        console.error("AI tagging error:", aiError.message);
      }
    }

    // ------------------------------
    // SAVE POST TO DATABASE
    // ------------------------------
    const result = await pool.query(
      `INSERT INTO posts (title, content, tags)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title.trim(), content.trim(), tags]
    );

    res.status(201).json({
      message: "Blog post created successfully",
      post: result.rows[0],
    });
  } catch (error) {
    console.error("Create post error:", error.message);

    res.status(500).json({
      message: "Failed to create blog post",
      error: error.message,
    });
  }
});

// ==========================================
// DELETE BLOG POST
// ==========================================
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM posts WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Blog post not found",
      });
    }

    res.json({
      message: "Blog post deleted successfully",
      post: result.rows[0],
    });
  } catch (error) {
    console.error("Delete post error:", error.message);

    res.status(500).json({
      message: "Failed to delete blog post",
      error: error.message,
    });
  }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});