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

  normalizeJobText(text) {
    if (!text) return "";

    return text
      .toLowerCase()
      .split(/\s+(?:at|in)\s+/)[0]
      .replace(/\([^)]*\)/g, "")
      .trim();
  }

  //
  async verifyRelevantApplication(jobName, includeWords, excludeWords) {
    await this.page.waitForLoadState("networkidle");

    try {
      await this.cards.first().waitFor({
        state: "visible",
        timeout: 20000,
      });
    } catch {
      console.log("[DEBUG] 🚫 No candidates found on current page");
      return;
    }

    const count = await this.cards.count();
    console.log(`[DEBUG] 🔍 Total cards found: ${count}`);

    for (let i = 0; i < count; i++) {
      const card = this.cards.nth(i);

      const relExpLocator = this.getRelExp(card);

      let relExp = "";

      if (await relExpLocator.count()) {
        relExp = this.normalizeJobText(
          (await relExpLocator.first().textContent()) || "",
        );
      }

      const currJobLocator = this.getCurrJob(card);

      let currJob = "";

      if (await currJobLocator.count()) {
        currJob = this.normalizeJobText(
          (await currJobLocator.first().textContent()) || "",
        );
      }

      const combinedText = `${relExp} - ${currJob}`; //
      console.log(`[DEBUG] 🔗 Card ${i + 1} Text: ${combinedText}`);

      const hasExcludeWord = excludeWords.some((word) =>
        combinedText.includes(word.toLowerCase()),
      );

      if (hasExcludeWord) {
        console.log(`[DEBUG] ⏭️  Card ${i + 1} skipped (exclude word found)`);
        continue;
      }

      const hasIncludeWord = includeWords.some((word) =>
        combinedText.includes(word.toLowerCase()),
      );

      if (!hasIncludeWord) {
        console.log(`[DEBUG] ⏭️  Card ${i + 1} skipped (no include word found)`);
        continue;
      }

      const checkbox = this.getCheckbox(card);
      console.log(`[DEBUG] ✅ Card ${i + 1} selected`);
      await checkbox.scrollIntoViewIfNeeded();
      await checkbox.click();
      await this.page.waitForTimeout(300);
    }
  }

  async processAllPages(jobName, includeWords, excludeWords) {
    let pageNo = 1;
    const maxPages = 4;

    while (pageNo <= maxPages) {
      console.log(`[DEBUG] ⚙️  Processing page ${pageNo}`);
      await this.verifyRelevantApplication(jobName, includeWords, excludeWords);
      await this.sendBulkSMS(true);
      await this.exportData();

      if (
        (await this.nextButton.count()) === 0 ||
        !(await this.nextButton.isEnabled())
      ) {
        console.log("[DEBUG] 🚫 No more pages available");
        break;
      }
      if (pageNo === maxPages) {
        console.log("[DEBUG] 🛑 Max Page limit reached");
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
        console.log("[DEBUG] 📲 Clicking Bulk SMS");
        await this.bulkSMSBtn.click({ timeout: 10000 });
        console.log("[DEBUG] 💬 Opening Bulk SMS dialog");
        await this.sendSMSBtn.click({ timeout: 10000 });
        console.log("[DEBUG] 📨 Sending Bulk SMS");
      }
    }
  }

  async exportData() {
    await this.page.waitForTimeout(500);
    if (await this.exportBtn.isEnabled()) {
      console.log("[DEBUG] 📤 Exporting candidate data");
      const filePath = await DownloadUtils.downloadFile(this.page, async () => {
        await this.exportBtn.click({ timeout: 10000 });
      });
      console.log(`[DEBUG] ⬇️ CSV download completed - ${filePath}`);
      return filePath;
    }
    console.log("[DEBUG] 🚫 No data to export");
  }
}

module.exports = CandidatePage;
