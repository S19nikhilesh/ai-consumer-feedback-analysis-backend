const Dataset = require("../models/Dataset");

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

module.exports = {
  getDatasets,
};