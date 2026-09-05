const express = require("express");
const cors = require("cors");
require("dotenv").config();

const enquiryRoutes = require("./routes/enquiryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "Tour Enquiry API is running",
  });
});

// Enquiry routes
app.use("/api/enquiries", enquiryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});