const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");

const uploadCSV = require("../controllers/uploadController");
const { getDatasets , getDatasetById,deleteDataset} = require("../controllers/datasetController");

const router = express.Router();

router.post("/upload", protect, upload.single("file"), uploadCSV);
router.get("/", protect, getDatasets);
router.delete("/:id", protect, deleteDataset);
router.get("/:id", protect, getDatasetById);

module.exports = router;