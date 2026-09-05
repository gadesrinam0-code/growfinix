const express = require("express");
const pool = require("../db");

const router = express.Router();

/*
  GET ALL ENQUIRIES
  GET /api/enquiries
*/
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM enquiries ORDER BY created_at DESC"
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching enquiries:", error.message);

    res.status(500).json({
      message: "Failed to fetch enquiries",
    });
  }
});

/*
  GET ONE ENQUIRY
  GET /api/enquiries/:id
*/
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM enquiries WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching enquiry:", error.message);

    res.status(500).json({
      message: "Failed to fetch enquiry",
    });
  }
});

/*
  CREATE ENQUIRY
  POST /api/enquiries
*/
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      destination,
      travel_date,
      number_of_people,
      message,
    } = req.body;

    // Required fields
    if (!name || !email || !destination) {
      return res.status(400).json({
        message: "Name, email and destination are required",
      });
    }

    // Clean input
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone ? phone.trim() : null;
    const cleanDestination = destination.trim();
    const cleanMessage = message ? message.trim() : null;

    // Check empty values after trimming
    if (!cleanName || !cleanEmail || !cleanDestination) {
      return res.status(400).json({
        message: "Name, email and destination cannot be empty",
      });
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Number of people validation
    let people = null;

    if (
      number_of_people !== null &&
      number_of_people !== undefined &&
      number_of_people !== ""
    ) {
      people = Number(number_of_people);

      if (!Number.isInteger(people) || people < 1) {
        return res.status(400).json({
          message: "Number of people must be a positive whole number",
        });
      }
    }

    // Insert enquiry
    const result = await pool.query(
      `INSERT INTO enquiries
      (
        name,
        email,
        phone,
        destination,
        travel_date,
        number_of_people,
        message
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        cleanName,
        cleanEmail,
        cleanPhone,
        cleanDestination,
        travel_date || null,
        people,
        cleanMessage,
      ]
    );

    res.status(201).json({
      message: "Enquiry created successfully",
      enquiry: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating enquiry:", error.message);

    res.status(500).json({
      message: "Failed to create enquiry",
    });
  }
});

/*
  UPDATE ENQUIRY
  PUT /api/enquiries/:id
*/
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      destination,
      travel_date,
      number_of_people,
      message,
      status,
    } = req.body;

    // Required fields
    if (!name || !email || !destination) {
      return res.status(400).json({
        message: "Name, email and destination are required",
      });
    }

    // Clean input
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone ? phone.trim() : null;
    const cleanDestination = destination.trim();
    const cleanMessage = message ? message.trim() : null;
    const cleanStatus = status ? status.trim() : "Pending";

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Number of people validation
    let people = null;

    if (
      number_of_people !== null &&
      number_of_people !== undefined &&
      number_of_people !== ""
    ) {
      people = Number(number_of_people);

      if (!Number.isInteger(people) || people < 1) {
        return res.status(400).json({
          message: "Number of people must be a positive whole number",
        });
      }
    }

    // Update
    const result = await pool.query(
      `UPDATE enquiries
       SET
         name = $1,
         email = $2,
         phone = $3,
         destination = $4,
         travel_date = $5,
         number_of_people = $6,
         message = $7,
         status = $8
       WHERE id = $9
       RETURNING *`,
      [
        cleanName,
        cleanEmail,
        cleanPhone,
        cleanDestination,
        travel_date || null,
        people,
        cleanMessage,
        cleanStatus,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      message: "Enquiry updated successfully",
      enquiry: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating enquiry:", error.message);

    res.status(500).json({
      message: "Failed to update enquiry",
    });
  }
});

/*
  DELETE ENQUIRY
  DELETE /api/enquiries/:id
*/
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM enquiries WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }

    res.status(200).json({
      message: "Enquiry deleted successfully",
      enquiry: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting enquiry:", error.message);

    res.status(500).json({
      message: "Failed to delete enquiry",
    });
  }
});

module.exports = router;