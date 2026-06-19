const { test, expect } = require("@playwright/test");
const LoginPage = require("../pages/LoginPage");
const DashboardPage = require("../pages/DashboardPage");
const CandidatePage = require("../pages/CandidatePage");
const ExcelUtils = require("../utils/excelUtils");
const ReportStore = require("../utils/reportStore");
const FileUtils = require("../utils/fileUtils");
const path = require("path");
require("dotenv").config();

const { JOB_NAMES, INCLUDE_WORDS, EXCLUDE_WORDS } = require("../constants");

test.beforeAll(async () => {
  FileUtils.clearDownloadsFolder();
});

for (const jobName of JOB_NAMES) {
  ReportStore.addJob(jobName);
  test(`Verify ${jobName} page`, async ({ page }) => {
    try {
      console.log("====================================");
      console.log(`[DEBUG] Starting Job: ${jobName}`);
      console.log("====================================");
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);
      const candidatePage = new CandidatePage(page);

      await loginPage.openLoginPage();

      await loginPage.login(
        process.env.WORKINDIA_USERNAME,
        process.env.WORKINDIA_PASSWORD,
      );

      await dashboardPage.selectJobName(jobName);
      await dashboardPage.selectDataBase();
      await dashboardPage.selectPageLimit();

      console.log("[DEBUG] Candidate Active In: 7 Days");
      await dashboardPage.selectFilterRadioOptions(
        "Candidate Active In",
        "7 Days",
      );

      console.log("[DEBUG] Preferred Languages: Hindi, Kannada");
      await dashboardPage.selectFilterSelectOptions(
        "Preferred Languages",
        "Hindi,Kannada",
      );

      console.log("[DEBUG] Minimum Experience: 1 Year");
      await dashboardPage.selectFilterDropdownOption("Experience", "1 Year");

      console.log("[DEBUG] Maximum Salary: 25000");
      await dashboardPage.enterFilterOption("Salary", "25000");

      const DISTANCES = ["5 KM", "10 KM"];
      for (const distance of DISTANCES) {
        console.log(`[DEBUG] Location Distance: ${distance}`);
        await dashboardPage.selectFilterRadioOptions(
          "Location Distance",
          distance,
        );
        await candidatePage.processAllPages(
          jobName,
          INCLUDE_WORDS,
          EXCLUDE_WORDS,
        );
      }

      console.log("[DEBUG] Starting CSV merge");
      const excelFile = await ExcelUtils.mergeCsvToExcel(jobName);
      FileUtils.clearDownloadsFolder();

      if (excelFile) {
        console.log(`[DEBUG] Excel generated: ${excelFile}`);
        ReportStore.updateExcel(jobName, path.basename(excelFile));
      } else {
        ReportStore.updateExcel(jobName, "No Export");
      }

      ReportStore.updateStatus(jobName, "PASSED");
    } catch (e) {
      console.log("[DEBUG] Starting CSV merge");
      const excelFile = await ExcelUtils.mergeCsvToExcel(jobName);
      FileUtils.clearDownloadsFolder();
      if (excelFile) {
        console.log(`[DEBUG] Excel generated: ${excelFile}`);
        ReportStore.updateExcel(jobName, path.basename(excelFile));
      } else {
        ReportStore.updateExcel(jobName, "No Export");
      }
      ReportStore.updateStatus(jobName, "FAILED");
      console.error(`Job ${jobName} failed:`, e.message);
      throw e;
    }
  });
}

test.afterAll(async () => {
  // ReportStore.printReport();
  ReportStore.generateEmailReport();
  console.log("");
  console.log("====================================");
  console.log("[DEBUG] FINAL EXECUTION REPORT");
  console.log("====================================");
});
