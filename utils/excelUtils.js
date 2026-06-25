const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const ExcelJS = require("exceljs");

class ExcelUtils {
  static async mergeCsvToExcel(jobName) {
    const downloadDir = path.join(process.cwd(), "downloads");

    const csvFiles = fs
      .readdirSync(downloadDir)
      .filter((file) => file.endsWith(".csv"));

    if (csvFiles.length === 0) {
      console.log("[DEBUG] 🚫 No CSV files found");

      return null;
    }

    const uniqueCandidates = new Map();
    let headers = [];

    for (const file of csvFiles) {
      const filePath = path.join(downloadDir, file);

      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("headers", (csvHeaders) => {
            if (headers.length === 0) {
              headers = csvHeaders;
            }
          })
          .on("data", (row) => {
            const mobile = row["Mobile No."]?.trim();

            if (mobile && !uniqueCandidates.has(mobile)) {
              uniqueCandidates.set(mobile, row);
            }
          })
          .on("end", resolve)
          .on("error", reject);
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Candidates");

    worksheet.addRow(headers);

    for (const row of uniqueCandidates.values()) {
      worksheet.addRow(headers.map((header) => row[header] || ""));
    }

    const today = new Date();
    const formattedJobName = jobName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");

    const fileName =
      formattedJobName +
      "-" +
      String(today.getDate()).padStart(2, "0") +
      String(today.getMonth() + 1).padStart(2, "0") +
      today.getFullYear() +
      ".xlsx";

    const excelPath = path.join(process.cwd(), fileName);

    await workbook.xlsx.writeFile(excelPath);

    return excelPath;
  }
}

module.exports = ExcelUtils;
