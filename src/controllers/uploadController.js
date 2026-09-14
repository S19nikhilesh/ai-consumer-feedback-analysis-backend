const csv = require("csv-parser");
const { Readable } = require("stream");

const Dataset = require("../models/Dataset");
const Review = require("../models/Review");

const uploadCSV = (req, res) => {
  const rows = [];

  if (!req.file) {
    return res.status(400).json({
      message: "CSV file is required",
    });
  }

  Readable.from(req.file.buffer)
    .pipe(csv())
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", async () => {
      try {
        if (rows.length === 0) {
          return res.status(400).json({
            message: "CSV file is empty",
          });
        }

        if (!Object.prototype.hasOwnProperty.call(rows[0], "review")) {
          return res.status(400).json({
            message: 'CSV must contain a "review" column',
          });
        }

        const validRows = rows.filter(
          (row) => row.review && row.review.trim() !== ""
        );

        if (validRows.length === 0) {
          return res.status(400).json({
            message: "No valid reviews found in CSV",
          });
        }

        // Create dataset
        const dataset = await Dataset.create({
          userId: req.user,
          fileName: req.file.originalname,
          totalReviews: validRows.length,
        });

        // Create reviews
        const reviews = validRows.map((row) => ({
          datasetId: dataset._id,
          text: row.review.trim(),
          sentiment: "Neutral",
          category: "Uncategorized",
        }));

        await Review.insertMany(reviews);

        res.status(201).json({
          message: "CSV uploaded and saved successfully",
          datasetId: dataset._id,
          fileName: dataset.fileName,
          totalReviews: dataset.totalReviews,
        });
      } catch (error) {
        res.status(500).json({
          message: "Failed to save CSV data",
          error: error.message,
        });
      }
    })
    .on("error", (error) => {
      res.status(400).json({
        message: "Failed to parse CSV",
        error: error.message,
      });
    });
};

module.exports = uploadCSV;