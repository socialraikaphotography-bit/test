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

      await dashboardPage.selectFilterRadioOptions(
        "Candidate Active In",
        "1 Month",
      );
      await dashboardPage.selectFilterSelectOptions(
        "Preferred Languages",
        "Hindi,Kannada",
      );
      await dashboardPage.selectFilterDropdownOption("Experience", "1 Year");
      await dashboardPage.enterFilterOption("Salary", "25000");

      const DISTANCES = ["5 KM", "10 KM"];
      for (const distance of DISTANCES) {
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

      const excelFile = await ExcelUtils.mergeCsvToExcel(jobName);
      FileUtils.clearDownloadsFolder();

      if (excelFile) {
        ReportStore.updateExcel(jobName, path.basename(excelFile));
      } else {
        ReportStore.updateExcel(jobName, "No Export");
      }

      ReportStore.updateStatus(jobName, "PASSED");
    } catch (e) {
      ReportStore.updateStatus(jobName, "FAILED");
      console.error(`Job ${jobName} failed:`, e.message);
      throw e;
    }
  });
}

test.afterAll(async () => {
  ReportStore.printReport();
});
