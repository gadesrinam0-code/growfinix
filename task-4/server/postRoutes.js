const express = require("express");
const { InferenceClient } = require("@huggingface/inference");
const pool = require("../db");

const router = express.Router();

const hf = new InferenceClient({
  apiKey: process.env.HF_TOKEN,
});

// CREATE BLOG POST + AI AUTO-TAGS
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    let tags = "General";

    try {
      const aiResponse = await hf.chatCompletion({
        model: "HuggingFaceH4/zephyr-7b-beta",
        messages: [
          {
            role: "system",
            content:
              "Generate 3 to 5 short, relevant tags for this blog post. Return only comma-separated tags. No explanation.",
          },
          {
            role: "user",
            content: `Title: ${title}\n\nContent: ${content}`,
          },
        ],
        max_tokens: 50,
      });

      const generatedTags =
        aiResponse?.choices?.[0]?.message?.content?.trim();

      if (generatedTags) {
        tags = generatedTags;
      }
    } catch (aiError) {
      console.error("AI tagging error:", aiError.message);
      tags = "General";
    }

    const result = await pool.query(
      `INSERT INTO posts
       (title, content, tags)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title.trim(), content.trim(), tags]
    );

    res.status(201).json({
      message: "Blog post created successfully",
      post: result.rows[0],
    });
  } catch (error) {
    console.error("Create post error:", error);

    res.status(500).json({
      message: "Failed to create blog post",
      error: error.message,
    });
  }
});

// GET ALL BLOG POSTS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM posts ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get posts error:", error);

    res.status(500).json({
      message: "Failed to fetch blog posts",
      error: error.message,
    });
  }
});

// GET SINGLE BLOG POST
router.get("/:id", async (req, res) => {
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
    console.error("Get single post error:", error);

    res.status(500).json({
      message: "Failed to fetch blog post",
      error: error.message,
    });
  }
});

// DELETE BLOG POST
router.delete("/:id", async (req, res) => {
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
    console.error("Delete post error:", error);

    res.status(500).json({
      message: "Failed to delete blog post",
      error: error.message,
    });
  }
});

module.exports = router;