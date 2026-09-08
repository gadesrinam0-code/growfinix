const express = require("express");
const multer = require("multer");
const cloudinary = require("../cloudinary");
const pool = require("../db");

const router = express.Router();

// Store uploaded images temporarily in memory
const upload = multer({
  storage: multer.memoryStorage(),
});

// =====================================================
// CREATE PROPERTY
// =====================================================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      property_name,
      location,
      price,
      property_type,
      bedrooms,
      bathrooms,
      area,
      description,
    } = req.body;

    if (!property_name || !location || !price || !property_type) {
      return res.status(400).json({
        message:
          "Property name, location, price and property type are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Property image is required",
      });
    }

    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "growfinix-properties",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.end(req.file.buffer);
      });
    };

    const cloudinaryResult = await uploadToCloudinary();

    const result = await pool.query(
      `INSERT INTO properties
      (
        property_name,
        location,
        price,
        property_type,
        bedrooms,
        bathrooms,
        area,
        description,
        image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        property_name.trim(),
        location.trim(),
        Number(price),
        property_type.trim(),
        bedrooms ? Number(bedrooms) : null,
        bathrooms ? Number(bathrooms) : null,
        area ? Number(area) : null,
        description ? description.trim() : null,
        cloudinaryResult.secure_url,
      ]
    );

    res.status(201).json({
      message: "Property created successfully",
      property: result.rows[0],
    });
  } catch (error) {
    console.error("Property creation error:", error);

    res.status(500).json({
      message: "Failed to create property",
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL PROPERTIES
// =====================================================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM properties ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Property fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
});

// =====================================================
// GET SINGLE PROPERTY
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM properties WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Property fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch property",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE PROPERTY
// =====================================================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    const {
      property_name,
      location,
      price,
      property_type,
      bedrooms,
      bathrooms,
      area,
      description,
    } = req.body;

    // Check whether property exists
    const existingProperty = await pool.query(
      "SELECT * FROM properties WHERE id = $1",
      [id]
    );

    if (existingProperty.rows.length === 0) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    let imageUrl = existingProperty.rows[0].image_url;

    // Upload new image only when user selected one
    if (req.file) {
      const uploadToCloudinary = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "growfinix-properties",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

          stream.end(req.file.buffer);
        });
      };

      const cloudinaryResult = await uploadToCloudinary();
      imageUrl = cloudinaryResult.secure_url;
    }

    const result = await pool.query(
      `UPDATE properties
       SET
         property_name = $1,
         location = $2,
         price = $3,
         property_type = $4,
         bedrooms = $5,
         bathrooms = $6,
         area = $7,
         description = $8,
         image_url = $9
       WHERE id = $10
       RETURNING *`,
      [
        property_name?.trim() || existingProperty.rows[0].property_name,
        location?.trim() || existingProperty.rows[0].location,
        price !== undefined && price !== ""
          ? Number(price)
          : existingProperty.rows[0].price,
        property_type?.trim() ||
          existingProperty.rows[0].property_type,
        bedrooms !== undefined && bedrooms !== ""
          ? Number(bedrooms)
          : null,
        bathrooms !== undefined && bathrooms !== ""
          ? Number(bathrooms)
          : null,
        area !== undefined && area !== ""
          ? Number(area)
          : null,
        description !== undefined
          ? description.trim()
          : existingProperty.rows[0].description,
        imageUrl,
        id,
      ]
    );

    res.json({
      message: "Property updated successfully",
      property: result.rows[0],
    });
  } catch (error) {
    console.error("Property update error:", error);

    res.status(500).json({
      message: "Failed to update property",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE PROPERTY
// =====================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM properties WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    res.json({
      message: "Property deleted successfully",
      property: result.rows[0],
    });
  } catch (error) {
    console.error("Property delete error:", error);

    res.status(500).json({
      message: "Failed to delete property",
      error: error.message,
    });
  }
});

module.exports = router;