const XLSX = require("xlsx");

class JobConfigReader {
  static parseFilter(cellValue) {
    if (!cellValue) return null;

    const [action, ...rest] = cellValue.split(":");

    const value = rest.join(":").trim();

    if (!value) return null;

    return {
      action: action.trim().toLowerCase(),
      values: value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    };
  }

  static getConfigs() {
    const workbook = XLSX.readFile("job-filters.xlsx");

    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet);

    return rows.map((row) => {
      const filters = [];

      Object.keys(row).forEach((column) => {
        if (["Job Name", "Include Words", "Exclude Words"].includes(column)) {
          return;
        }

        const parsed = JobConfigReader.parseFilter(row[column]);

        if (!parsed) return;

        filters.push({
          name: column,
          action: parsed.action,
          values: parsed.values,
        });
      });

      return {
        jobName: row["Job Name"],

        filters,

        includeWords: (row["Include Words"] || "")
          .split(/\r?\n/)
          .map((x) => x.trim().toLowerCase())
          .filter(Boolean),

        excludeWords: (row["Exclude Words"] || "")
          .split(/\r?\n/)
          .map((x) => x.trim().toLowerCase())
          .filter(Boolean),
      };
    });
  }
}

module.exports = JobConfigReader;
