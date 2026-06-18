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
  }

  static getReport() {
    return this.jobs;
  }

  static printReport() {
    console.table(this.jobs);
  }
}

module.exports = ReportStore;
