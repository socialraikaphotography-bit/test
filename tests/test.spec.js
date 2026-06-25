const { test, expect } = require("@playwright/test");
const LoginPage = require("../pages/LoginPage");
const DashboardPage = require("../pages/DashboardPage");
const CandidatePage = require("../pages/CandidatePage");
const ExcelUtils = require("../utils/excelUtils");
const ReportStore = require("../utils/reportStore");
const FileUtils = require("../utils/fileUtils");
const path = require("path");
require("dotenv").config();

const JobConfigReader = require("../utils/jobConfigReader");
const ALL_JOB_CONFIGS = JobConfigReader.getConfigs();

const selectedJobs =
  process.env.JOB_NAMES?.split(",").map((job) => job.trim().toLowerCase()) ||
  [];

const JOB_CONFIGS =
  selectedJobs.length === 0
    ? ALL_JOB_CONFIGS
    : ALL_JOB_CONFIGS.filter((config) =>
        selectedJobs.includes(config.jobName.toLowerCase()),
      );

if (JOB_CONFIGS.length === 0) {
  throw new Error(
    `No matching job configuration found for: ${
      process.env.JOB_NAME || process.env.JOB_NAMES
    }`,
  );
}

test.beforeAll(async () => {
  FileUtils.clearDownloadsFolder();
});

for (const config of JOB_CONFIGS) {
  ReportStore.addJob(config.jobName);
  test(`Verify ${config.jobName} page`, async ({ page }) => {
    try {
      console.log("====================================");
      console.log(`[DEBUG] 🚀 Starting Job: ${config.jobName}`);
      console.log("====================================");
      const loginPage = new LoginPage(page);
      const dashboardPage = new DashboardPage(page);
      const candidatePage = new CandidatePage(page);

      await loginPage.openLoginPage();

      await loginPage.login(
        process.env.WORKINDIA_USERNAME,
        process.env.WORKINDIA_PASSWORD,
      );

      await dashboardPage.selectJobName(config.jobName);
      await dashboardPage.selectDataBase();
      await dashboardPage.selectPageLimit();

      const locationFilter = config.filters.find(
        (f) => f.name === "Location Distance",
      );

      const commonFilters = config.filters.filter(
        (f) => f.name !== "Location Distance",
      );

      for (const filter of commonFilters) {
        switch (filter.action.toLowerCase()) {
          case "radio":
            console.log(
              `[DEBUG] 🎯 Applying RADIO filter -> ${filter.name}: ${filter.values[0]}`,
            );

            await dashboardPage.selectFilterRadioOptions(
              filter.name,
              filter.values[0],
            );
            break;

          case "checkbox":
            console.log(
              `[DEBUG] 🎯 Applying CHECKBOX filter -> ${filter.name}: ${filter.values.join(",")}`,
            );

            await dashboardPage.selectFilterSelectOptions(
              filter.name,
              filter.values.join(","),
            );
            break;

          case "dropdown":
            console.log(
              `[DEBUG] 🎯 Applying DROPDOWN filter -> ${filter.name}: ${filter.values[0]}`,
            );

            await dashboardPage.selectFilterDropdownOption(
              filter.name,
              filter.values[0],
            );
            break;

          case "fill":
            console.log(
              `[DEBUG] 🎯 Applying TEXT filter -> ${filter.name}: ${filter.values[0]}`,
            );

            await dashboardPage.enterFilterOption(
              filter.name,
              filter.values[0],
            );
            break;

          default:
            console.log(
              `[DEBUG] 🎯 Unknown filter action '${filter.action}' for '${filter.name}'`,
            );
        }
      }

      for (const distance of locationFilter.values) {
        console.log(`[DEBUG] 🎯 Processing Location Distance: ${distance}`);
        await page.pause();

        await dashboardPage.selectFilterRadioOptions(
          "Location Distance",
          distance,
        );

        await candidatePage.processAllPages(
          config.jobName,
          config.includeWords,
          config.excludeWords,
        );
      }

      console.log("[DEBUG] 🧩 Starting CSV merge");
      const excelFile = await ExcelUtils.mergeCsvToExcel(config.jobName);
      FileUtils.clearDownloadsFolder();

      if (excelFile) {
        console.log(`[DEBUG] 📊 Excel generated: ${excelFile}`);
        ReportStore.updateExcel(config.jobName, path.basename(excelFile));
      } else {
        ReportStore.updateExcel(config.jobName, "No Export");
      }

      ReportStore.updateStatus(config.jobName, "PASSED");
    } catch (e) {
      console.log("[DEBUG] 🧩 Starting CSV merge");
      const excelFile = await ExcelUtils.mergeCsvToExcel(config.jobName);
      FileUtils.clearDownloadsFolder();
      if (excelFile) {
        console.log(`[DEBUG] 📊 Excel generated: ${excelFile}`);
        ReportStore.updateExcel(config.jobName, path.basename(excelFile));
      } else {
        ReportStore.updateExcel(config.jobName, "No Export");
      }
      ReportStore.updateStatus(config.jobName, "FAILED");
      console.error(`❌ Job ${config.jobName} failed:`, e.message);
      throw e;
    }
  });
}

test.afterAll(async () => {
  // ReportStore.printReport();
  ReportStore.generateEmailReport();
  console.log("");
  console.log("====================================");
  console.log("[DEBUG] 📑 FINAL EXECUTION REPORT");
  console.log("====================================");
});
