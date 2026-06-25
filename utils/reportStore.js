const fs = require("fs");

class ReportStore {
  static jobs = [];

  static addJob(jobName) {
    this.jobs.push({
      jobName,
      excelReport: "",
      status: "IN_PROGRESS",
    });
  }

  static updateExcel(jobName, fileName) {
    const job = this.jobs.find((j) => j.jobName === jobName);
    if (job) {
      job.excelReport = fileName;
    }
  }

  static updateStatus(jobName, status) {
    const job = this.jobs.find((j) => j.jobName === jobName);
    if (job) {
      job.status = status;
    }
    console.log(`[DEBUG] ✅ Status updated for ${jobName}: PASSED`);
  }

  static getReport() {
    return this.jobs;
  }

  static printReport() {
    console.table(this.jobs);
  }

  static generateEmailReport() {
    const runUrl =
      process.env.GITHUB_RUN_URL || "GitHub Actions Run Link Not Available";

    const rows = this.jobs
      .map((job) => {
        const report =
          job.excelReport && job.excelReport !== "No Export"
            ? job.excelReport
            : "No relevant applications";

        const statusColor = job.status === "PASSED" ? "#16a34a" : "#dc2626";

        return `
          <tr>
            <td style="padding:10px;border:1px solid #ddd;">
              ${job.jobName}
            </td>

            <td style="padding:10px;border:1px solid #ddd;">
              ${report}
            </td>

            <td
              style="
                padding:10px;
                border:1px solid #ddd;
                color:${statusColor};
                font-weight:bold;
              "
            >
              ${job.status}
            </td>
          </tr>`;
      })
      .join("");

    const html = `
        <!DOCTYPE html>

        <html>
        <head>
        <meta charset="UTF-8">
        </head>
        <body style="
          font-family: Arial, sans-serif;
          background:#f4f6f8;
          padding:20px;
        ">

        <div style="
          max-width:900px;
          margin:auto;
          background:#ffffff;
          border-radius:8px;
          padding:24px;
          box-shadow:0 2px 10px rgba(0,0,0,0.08);
        ">

          <h2 style="margin-top:0;color:#1f2937;">
            WorkIndia Playwright Report
          </h2>

          <p>
            Hello,
          </p>

          <p>
            The scheduled WorkIndia candidate extraction and filtering
            process has completed successfully.
          </p>

          <table style="
            width:100%;
            border-collapse:collapse;
            margin-top:20px;
          ">
            <thead>
              <tr style="background:#2563eb;color:white;">
                <th style="padding:10px;border:1px solid #ddd;">Job Name</th>
                <th style="padding:10px;border:1px solid #ddd;">Report</th>
                <th style="padding:10px;border:1px solid #ddd;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div style="
            margin-top:24px;
            padding:16px;
            background:#f9fafb;
            border-left:4px solid #2563eb;
          ">
            <strong>Notes</strong>
            <ul>
              <li>Report file names indicate successful candidate exports.</li>
              <li>
                "No relevant applications" indicates that no candidates matched the configured filters.
              </li>
              <li>
                Candidate duplicates are removed using Mobile Number.
              </li>
            </ul>
          </div>

          <p style="margin-top:24px;">
            <a href="${runUrl}"
              style="
                background:#2563eb;
                color:white;
                padding:10px 16px;
                text-decoration:none;
                border-radius:4px;
              ">
              View GitHub Action Run
            </a>
          </p>

          <p style="color:#6b7280;margin-top:30px;">
            Generated automatically by GitHub Actions.
          </p>

        </div>

        </body>
        </html>
        `;

    fs.writeFileSync("email-report.html", html);

    return html;
  }
}

module.exports = ReportStore;
