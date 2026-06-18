const { expect } = require("@playwright/test");
const DownloadUtils = require("../utils/downloadUtils");
const ReportStore = require("../utils/reportStore");
const path = require("path");

class CandidatePage {
  constructor(page) {
    this.page = page;

    // Candidate cards
    this.cards = page.locator(
      "//div[contains(text(),'Relevant Experience')]/ancestor::div[contains(@class,'profile')]",
    );

    this.nextButton = page.locator("//li/a[text()='Next']");

    this.bulkSMSBtn = page.locator(
      "//button//div[contains(text(),'Bulk SMS')]",
    );

    this.exportBtn = page.locator(
      "//button//img[contains(@src,'excel')]/../..",
    );

    this.sendSMSBtn = page.locator(
      "//h2[text()='Send Message']/..//button//span[contains(text(),'Send SMS')]",
    );

    // Relative locators
    this.getRelExp = (card) =>
      card.locator(
        "xpath=.//div[contains(text(),'Relevant Experience')]/following-sibling::div",
      );

    this.getCurrJob = (card) =>
      card.locator(
        "xpath=.//div[contains(text(),'Current/ Latest Job')]/following-sibling::div",
      );

    this.getCheckbox = (card) => card.locator("xpath=.//input");
  }

  //
  async verifyRelevantApplication(jobName, includeWords, excludeWords) {
    await this.page.waitForLoadState("networkidle");

    await this.cards.first().waitFor({
      state: "visible",
      timeout: 10000,
    });

    const count = await this.cards.count();

    for (let i = 0; i < count; i++) {
      const card = this.cards.nth(i);

      const relExpLocator = this.getRelExp(card);

      let relExp = "";

      if (await relExpLocator.count()) {
        relExp = (
          (await relExpLocator.first().textContent()) || ""
        ).toLowerCase();
      }

      const currJobLocator = this.getCurrJob(card);

      let currJob = "";

      if (await currJobLocator.count()) {
        currJob = (
          (await currJobLocator.first().textContent()) || ""
        ).toLowerCase();
      }

      const combinedText = `${relExp} ${currJob}`;

      const hasExcludeWord = excludeWords.some((word) =>
        combinedText.includes(word.toLowerCase()),
      );

      const hasIncludeWord = includeWords.some((word) =>
        combinedText.includes(word.toLowerCase()),
      );

      if (hasExcludeWord) {
        continue;
      }

      const checkbox = this.getCheckbox(card);
      await checkbox.scrollIntoViewIfNeeded();
      await checkbox.click();
      await this.page.waitForTimeout(300);
    }
  }

  async processAllPages(jobName, includeWords, excludeWords) {
    let pageNo = 1;
    const maxPages = 4;

    while (pageNo <= maxPages) {
      await this.verifyRelevantApplication(jobName, includeWords, excludeWords);
      await this.sendBulkSMS(false);
      await this.exportData();

      if (
        (await this.nextButton.count()) === 0 ||
        !(await this.nextButton.isEnabled())
      ) {
        break;
      }
      if (pageNo === maxPages) {
        break;
      }

      await this.nextButton.click();
      await this.page.waitForLoadState("networkidle");

      pageNo++;
    }
  }

  async sendBulkSMS(send) {
    if (send) {
      await this.page.waitForTimeout(500);
      if (await this.bulkSMSBtn.isEnabled()) {
        await this.bulkSMSBtn.click({ timeout: 10000 });
        await this.sendSMSBtn.click({ timeout: 10000 });
      }
    }
  }

  async exportData() {
    await this.page.waitForTimeout(500);
    if (await this.exportBtn.isEnabled()) {
      const filePath = await DownloadUtils.downloadFile(this.page, async () => {
        await this.exportBtn.click({ timeout: 10000 });
      });
      return filePath;
    }
  }
}

module.exports = CandidatePage;
