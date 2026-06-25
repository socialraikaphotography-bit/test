const { expect } = require("@playwright/test");
const DownloadUtils = require("../utils/downloadUtils");

class DashboardPage {
  constructor(page) {
    this.page = page;

    // Locators
    this.dashboardText = page.locator(
      "//p[contains(text(),'Candidates will start calling')]",
    );

    this.jobPageHeader = page.locator(".job-detail-header");

    this.dataBaseBtn = page.locator(
      "//div[@class='tabs-wrapper']/div[contains(text(),'Database')]",
    );

    this.pageLimitBtn = page.locator(
      "//div[@class='limit-per-page-selection']//button",
    );

    this.pageLimit50 = page
      .locator("//div[@class='dropdown-content open']//span")
      .last();

    // Dynamic Locators
    this.getActiveJob = (jobName) => {
      return this.page.locator(
        `//div[@class='job-title flex'][.//div[normalize-space()='Active']]//a[normalize-space()='${jobName}']`,
      );
    };

    this.getFilterSection = (sectionName) => {
      return this.page.locator(
        `//span[normalize-space()='${sectionName}']/ancestor::div[contains(@class,'accordion-title-wrapper')]`,
      );
    };

    this.getFilterRadioOptions = (sectionName, option) => {
      return this.page.locator(
        `//span[normalize-space()='${sectionName}']/ancestor::div[contains(@class,'accordion-title-wrapper')]/following-sibling::div//label[normalize-space()='${option}']`,
      );
    };

    this.getFilterDropdownBtn = (sectionName) => {
      return this.page.locator(
        `//span[normalize-space()='${sectionName}']/ancestor::div[contains(@class,'accordion-title-wrapper')]/following-sibling::div//button`,
      );
    };

    this.getFilterDropdownOption = (value) => {
      return this.page.locator(
        `//div[@class='dropdown-content open']/span[text()='${value}']`,
      );
    };

    this.getFilterTextFieldMaximum = (sectionName) => {
      return this.page.locator(
        `//span[normalize-space()='${sectionName}']/ancestor::div[contains(@class,'accordion-title-wrapper')]/following-sibling::div//input[@placeholder='Maximum']`,
      );
    };

    this.getFilterSelectOptions = (sectionName, option) => {
      return this.page.locator(
        `//span[normalize-space()='${sectionName}']/ancestor::div[contains(@class,'accordion-title-wrapper')]/following-sibling::div//input[@value='${option}']`,
      );
    };
  }

  async selectJobName(jobName) {
    console.log(`[DEBUG] 💼 Selecting Job: ${jobName}`);
    await this.getActiveJob(jobName).click({ timeout: 10000 });

    await expect(this.jobPageHeader).toHaveText(
      new RegExp(`^${jobName}$`, "i"),
    );
  }

  async selectDataBase() {
    await this.dataBaseBtn.click({ timeout: 10000 });
    console.log("[DEBUG] 🗄️  Database selected");
  }

  async selectPageLimit() {
    await this.pageLimitBtn.click();
    await this.pageLimit50.click({ timeout: 10000 });
    console.log("[DEBUG] 🔢 Page limit set to 50");
  }

  async openFilterOption(section) {
    await this.page.waitForTimeout(1000);
    const is_open = await this.getFilterSection(section).getAttribute("class");
    if (!is_open?.includes("open")) {
      await this.getFilterSection(section).click({ timeout: 5000 });
    }
  }

  async selectFilterRadioOptions(section, option) {
    await this.openFilterOption(section);
    await this.getFilterRadioOptions(section, option).click({ timeout: 5000 });
  }

  async selectFilterDropdownOption(section, value) {
    await this.openFilterOption(section);
    await this.getFilterDropdownBtn(section).first().click({ timeout: 5000 });
    await this.getFilterDropdownOption(value).click({ timeout: 5000 });
  }

  async enterFilterOption(section, text) {
    await this.openFilterOption(section);
    await this.getFilterTextFieldMaximum(section).waitFor({
      state: "visible",
      timeout: 10000,
    });

    await this.getFilterTextFieldMaximum(section).fill(String(text));
  }

  async selectFilterSelectOptions(section, values) {
    await this.openFilterOption(section);
    const options = values
      .split(",")
      .map((v) => v.trim().toLowerCase().replaceAll(" ", "_"));

    for (const option of options) {
      await this.page.waitForTimeout(500);
      const locator = this.getFilterSelectOptions(section, option);

      if (!(await locator.isChecked())) {
        await locator.click({ timeout: 5000 });
      }
    }
  }

  async forDebug() {
    await this.page.pause();
  }
}

module.exports = DashboardPage;
