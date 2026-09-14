const csv = require("csv-parser");
const { Readable } = require("stream");

const uploadCSV = (req, res) => {
  const rows = [];

  Readable.from(req.file.buffer)
    .pipe(csv())
    .on("data", (row) => {
      rows.push(row);
    })
    .on("end", () => {
      res.json({
        message: "CSV parsed successfully",
        totalRows: rows.length,
        data: rows,
      });
    })
    .on("error", (error) => {
      res.status(400).json({
        message: "Failed to parse CSV",
        error: error.message,
      });
    });
};

module.exports = uploadCSV;