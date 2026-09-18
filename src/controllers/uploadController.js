const csv = require("csv-parser");
const { Readable } = require("stream");

const Dataset = require("../models/Dataset");
const Review = require("../models/Review");

const {
  analyzeReviews,
  generateInsights,
} = require("../services/geminiService");

const BATCH_SIZE = 30;

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

        const savedReviews = await Review.insertMany(reviews);

        // Analyze reviews in batches
        for (let i = 0; i < savedReviews.length; i += BATCH_SIZE) {
          const batch = savedReviews.slice(i, i + BATCH_SIZE);

          console.log(
            `Analyzing reviews ${i + 1} to ${i + batch.length}...`
          );

          const results = await analyzeReviews(batch);

          console.log("AI RESULTS:", results);

          // Update reviews with AI results
          for (const result of results) {
            const review = batch[result.reviewIndex - 1];

            if (!review) {
              throw new Error(
                `Invalid reviewIndex: ${result.reviewIndex}`
              );
            }

            await Review.findByIdAndUpdate(review._id, {
              sentiment: result.sentiment,
              category: result.category,
            });
          }
        }

        // Get all analyzed reviews
        const analyzedReviews = await Review.find({
          datasetId: dataset._id,
        });

        // Sentiment counts
        const sentiment = {
          positive: 0,
          negative: 0,
          neutral: 0,
        };

        // Category-wise sentiment counts
        const categoryMap = {};

        analyzedReviews.forEach((review) => {
          // Sentiment count
          if (review.sentiment === "Positive") {
            sentiment.positive++;
          } else if (review.sentiment === "Negative") {
            sentiment.negative++;
          } else if (review.sentiment === "Neutral") {
            sentiment.neutral++;
          }

          // Create category
          if (!categoryMap[review.category]) {
            categoryMap[review.category] = {
              name: review.category,
              positive: 0,
              negative: 0,
              neutral: 0,
            };
          }

          // Category sentiment count
          if (review.sentiment === "Positive") {
            categoryMap[review.category].positive++;
          } else if (review.sentiment === "Negative") {
            categoryMap[review.category].negative++;
          } else if (review.sentiment === "Neutral") {
            categoryMap[review.category].neutral++;
          }
        });

        const categories = Object.values(categoryMap);

        // Generate AI insights
        console.log("Generating AI insights...");

        const insights = await generateInsights(
          sentiment,
          categories
        );

        console.log("AI INSIGHTS:", insights);

        // Update dataset
        dataset.sentiment = sentiment;
        dataset.categories = categories;
        dataset.insights = insights;

        await dataset.save();

        console.log("Dataset processing completed successfully.");

        res.status(201).json({
          message: "CSV uploaded and analyzed successfully",
          datasetId: dataset._id,
          fileName: dataset.fileName,
          totalReviews: dataset.totalReviews,
          sentiment: dataset.sentiment,
          categories: dataset.categories,
          insights: dataset.insights,
        });
      } catch (error) {
        console.error("Upload/AI error:", error);

        res.status(500).json({
          message: "Failed to process CSV",
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