# WorkIndia Candidate Automation - User Guide

## Overview

This automation automatically:

- Logs into WorkIndia
- Filters candidates based on predefined criteria
- Selects relevant candidates
- Exports candidate data
- Creates Excel reports
- Emails the final report automatically

No software installation is required on your computer.

Everything runs automatically using GitHub Actions in the cloud.

---

# One-Time Setup

## Step 1 - Configure WorkIndia Credentials

These credentials are used by the automation to log into WorkIndia.

### Open GitHub Repository

1. Open the GitHub repository.
2. Click **Settings**.
3. Click **Secrets and Variables**.
4. Click **Actions**.
5. Click **New Repository Secret**.

Create the following secrets:

| Secret Name        | Value                        |
| ------------------ | ---------------------------- |
| WORKINDIA_USERNAME | Your WorkIndia mobile number |
| WORKINDIA_PASSWORD | Your WorkIndia password      |

Example:

WORKINDIA_USERNAME = 9876543210

WORKINDIA_PASSWORD = MyPassword123

---

# Step 2 - Configure Email Sending

The automation sends reports using Gmail SMTP.

You may use:

- Existing Gmail account
- New Gmail account dedicated for automation

Recommended:

Create a dedicated Gmail account for automation.

Example:

[workindia.automation@gmail.com](mailto:workindia.automation@gmail.com)

---

# Step 3 - Enable Google 2-Step Verification

1. Open Google Account.
2. Click Security.
3. Open: 2-Step Verification
4. Enable it.

This is required before App Passwords can be created.

---

# Step 4 - Create Gmail App Password

1. Open: - https://myaccount.google.com/apppasswords
2. Sign in if required.
3. Select: Mail
4. Select: Other (Custom Name)
5. Enter: GitHub Actions
6. Click Generate.

Google will display a password similar to:

`abcd efgh ijkl mnop`

Copy it immediately.

Important:
 - Do NOT use your normal Gmail password.
 - Use the generated App Password.

---

# Step 5 - Configure Email Secrets

Go back to:

GitHub Repository
→ Settings
→ Secrets and Variables
→ Actions

Create:

| Secret Name    | Value                   |
| -------------- | ----------------------- |
| EMAIL_USERNAME | Gmail address           |
| EMAIL_PASSWORD | Gmail App Password      |
| TO_EMAIL       | Recipient email address |

Example:

EMAIL_USERNAME = [workindia.automation@gmail.com](mailto:workindia.automation@gmail.com)

EMAIL_PASSWORD = abcd efgh ijkl mnop

TO_EMAIL = [manager@company.com](mailto:manager@company.com)

---

# Running the Automation

## Manual Execution

1. Open GitHub repository.
2. Click Actions.
3. Select: WorkIndia Scheduled Trigger
4. Click: Run Workflow
5. Enter Job Name. `Example: Telesales Executive`
6. Click: `Run Workflow` - The automation will start.

---

# Email Report

After execution completes:

An email will be sent automatically.

The email contains:

- Job Name
- Report Name
- Status
- GitHub Run Link

Excel files are attached when relevant candidates are found.

If no matching candidates are found:

No relevant applications

will be displayed.

---

# Updating Job Names

The automation processes jobs configured in the GitHub Secret:

JOB_NAMES

---

## Where to Update

Go back to:

GitHub Repository
→ Settings
→ Secrets and Variables
→ Actions

Create:

| Secret Name | Value               |
| ----------- | ------------------- |
| JOB_NAMES   | `job_1,job_2,job_3` |

---

## Format

Enter one or more job names separated by commas.

Example:

```text
Telesales Executive,photographer assistant
```

Another example:

```text
Customer Support Executive,Telecaller,Inside Sales Executive
```

---

## Single Job

To process only one job:

```text
Telesales Executive
```

---

## Multiple Jobs

To process multiple jobs:

```text
Telesales Executive,photographer assistant,Customer Support Executive
```

---

## Important Notes

- Use exact job names as available in WorkIndia.
- Separate multiple job names using commas.
- Do not use line breaks.
- Do not add quotes around job names.

Correct:

```text
Telesales Executive,Customer Support Executive
```

Incorrect:

```text
"Telesales Executive"
"Customer Support Executive"
```

---

## Manual Workflow Override

When manually running the workflow:

1. Open **Actions**.
2. Select the workflow.
3. Click **Run Workflow**.
4. Enter a Job Name.

The manually entered value will be used only for that execution.

The JOB_NAMES secret remains unchanged.

---

## Example

Configured Secret:

```text
Telesales Executive,photographer assistant
```

Scheduled Execution:

Processes both jobs.

Manual Execution Input:

```text
Customer Support Executive
```

Result:

Only Customer Support Executive is processed for that run.

The configured JOB_NAMES secret is not modified.

---

# Updating Candidate Matching Keywords

The automation identifies relevant candidates using two keyword lists:

- INCLUDE_WORDS
- EXCLUDE_WORDS

These are configured in file: - `constants.js`

---

## INCLUDE_WORDS

A candidate is selected only if their profile contains at least one keyword from this list.

Example:

```javascript
const INCLUDE_WORDS = [
  "telecall",
  "telesales",
  "customer service",
  "inside sales",
  "bpo",
  "call center",
  "sales executive",
];
```

### When to update

Add new keywords if candidates use different job titles.

Example:

```javascript
const INCLUDE_WORDS = [
  "telecall",
  "telesales",
  "customer service",
  "inside sales",
  "bpo",
  "call center",
  "sales executive",
  "telecaller",
  "customer support",
  "sales associate",
];
```

---

## EXCLUDE_WORDS

A candidate is skipped if any keyword from this list is found.

Example:

```javascript
const EXCLUDE_WORDS = ["fresher"];
```

### When to update

Add keywords for candidate profiles that should never be selected.

Example:

```javascript
const EXCLUDE_WORDS = [
  "fresher",
  "photographer",
  "video editor",
  "graphic designer",
];
```

---

# Common Issues

## Email Not Received

Check:

- Spam folder
- EMAIL_USERNAME secret
- EMAIL_PASSWORD secret
- TO_EMAIL secret

---

## WorkIndia Login Failed

Verify:

WORKINDIA_USERNAME

WORKINDIA_PASSWORD

are correct.

---

## App Password Option Missing

Ensure:

Google Account
→ Security
→ 2-Step Verification

is enabled.

Without 2-Step Verification, App Passwords cannot be generated.

---

# Recommendations

1. Use a dedicated Gmail account for automation.
2. Do not share GitHub secrets with other users.
3. Review exported Excel reports periodically.
4. Change WorkIndia password periodically.
5. Keep GitHub repository private.
6. Use only authorized recipient email addresses.
7. Review GitHub Action logs after any failed execution.

---

# Support

If the automation fails:

1. Open GitHub Actions.
2. Open the failed workflow.
3. Download logs.
4. Share the logs with the automation developer for troubleshooting.
