if (!process.env.JOB_NAMES?.trim()) {
  throw new Error("JOB_NAMES is not configured");
}

const JOB_NAMES = process.env.JOB_NAMES.split(",").map((job) => job.trim());

const INCLUDE_WORDS = [
  "telecall",
  "telesales",
  "customer service",
  "inside sales",
  "BPO",
  "call center",
  "sales executive",
];

const EXCLUDE_WORDS = ["fresher"];

module.exports = { JOB_NAMES, INCLUDE_WORDS, EXCLUDE_WORDS };
