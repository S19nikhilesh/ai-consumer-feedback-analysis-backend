const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");
const uploadCSV = require("../controllers/uploadController");

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadCSV);

module.exports = router;