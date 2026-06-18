const fs = require("fs");
const path = require("path");

class FileUtils {
  static clearDownloadsFolder() {
    const downloadDir = path.join(process.cwd(), "downloads");

    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
      return;
    }

    const files = fs.readdirSync(downloadDir);

    for (const file of files) {
      fs.unlinkSync(path.join(downloadDir, file));
    }

  }
}

module.exports = FileUtils;
