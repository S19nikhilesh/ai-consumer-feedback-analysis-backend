const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    totalReviews: {
      type: Number,
      default: 0,
    },

    sentiment: {
      positive: {
        type: Number,
        default: 0,
      },

      negative: {
        type: Number,
        default: 0,
      },

      neutral: {
        type: Number,
        default: 0,
      },
    },

    categories: [
      {
        name: {
          type: String,
          required: true,
        },

        positive: {
          type: Number,
          default: 0,
        },

        negative: {
          type: Number,
          default: 0,
        },

        neutral: {
          type: Number,
          default: 0,
        },
      },
    ],

    insights: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Dataset", datasetSchema);