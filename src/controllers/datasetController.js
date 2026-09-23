const Dataset = require("../models/Dataset");
const Review = require("../models/Review");
const getDatasets = async (req, res) => {
  try {
    const datasets = await Dataset.find({ userId: req.user })
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      totalDatasets: datasets.length,
      datasets,
    });
  } catch (error) {
    console.error("Get datasets error:", error);

    res.status(500).json({
      message: "Failed to fetch datasets",
      error: error.message,
    });
  }
};


const getDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      userId: req.user,
    });

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    const reviews = await Review.find({
      datasetId: dataset._id,
    }).sort({ createdAt: 1 });

    res.status(200).json({
      dataset,
      reviews,
    });
  } catch (error) {
    console.error("Get dataset error:", error);

    res.status(500).json({
      message: "Failed to fetch dataset",
      error: error.message,
    });
  }
};

const deleteDataset = async (req, res) => {
  try {
    const dataset = await Dataset.findOne({
      _id: req.params.id,
      userId: req.user,
    });

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found",
      });
    }

    // Delete all reviews belonging to this dataset
    await Review.deleteMany({
      datasetId: dataset._id,
    });

    // Delete the dataset
    await Dataset.deleteOne({
      _id: dataset._id,
    });

    res.status(200).json({
      message: "Dataset deleted successfully",
    });
  } catch (error) {
    console.error("Delete dataset error:", error);

    res.status(500).json({
      message: "Failed to delete dataset",
      error: error.message,
    });
  }
};
module.exports = {
  getDatasets,
  getDatasetById,
  deleteDataset
};