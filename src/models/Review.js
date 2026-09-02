const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    datasetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dataset",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    sentiment: {
      type: String,
      enum: ["Positive", "Negative", "Neutral"],
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);