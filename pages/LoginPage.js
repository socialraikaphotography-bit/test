class LoginPage {
  constructor(page) {
    this.page = page;

    // Locators
    this.phoneNumber = page.locator("//input[@placeholder='Phone Number']");
    this.password = page.locator("//input[@placeholder='Password']");
    this.loginBtn = page.locator("//button//span[text()='Log In']");
    this.enterPasswordRadio = this.page
      .locator("label.radio-button-v2:has(span)")
      .last();
  }

  async openLoginPage() {
    console.log("[DEBUG] 🌐 Opening WorkIndia login page");
    await this.page.goto("", {
      timeout: 30000,
    });
  }

  async login(number, password) {
    console.log("[DEBUG] 🔐 Attempting login");
    await this.phoneNumber.fill(number);
    await this.loginBtn.click();
    await this.page.waitForTimeout(1500);

    await this.enterPasswordRadio.last().click({
      timeout: 10000,
    });
    await this.page.waitForTimeout(500);
    await this.password.fill(password);
    await this.page.waitForTimeout(500);
    await this.loginBtn.click();

    await this.page.waitForURL("**/dashboard", {
      timeout: 30000,
    });
    console.log("[DEBUG] ✅ Login successful");
  }
}

module.exports = LoginPage;
