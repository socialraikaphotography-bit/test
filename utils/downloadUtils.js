const fs = require("fs");
const path = require("path");

class DownloadUtils {
  static async downloadFile(page, triggerAction) {
    const downloadDir = path.join(process.cwd(), "downloads");

    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    const downloadPromise = page.waitForEvent("download", {
      timeout: 120000,
    });

    await triggerAction();

    const download = await downloadPromise;

    const filePath = path.join(downloadDir, download.suggestedFilename());

    await download.saveAs(filePath);

    return filePath;
  }
}

module.exports = DownloadUtils;
