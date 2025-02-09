# Pre-interview Assessment

## Introduction

Hi there! Thanks for taking the time to participate in this pre-interview assessment. It shouldn't take too much of your time but it'll go a long way in helping us understand your abilities and fit for the role.

This is a small, demo application that simulates a real feature within FlowPoint. This feature allows users to upload an Excel file with their company's financial statements and then map their data to a standardized format, summing their associated values as necessary.

## How it works

### Installation

You can run this app by first running `npm install` and then `npm run dev`. Don't worry about any errors you see about out-of-date packages since this is just a demo app and not actual production code. Once running, you can see the app by navigating to `http://localhost:3000`. If you run into any problems that you can't resolve, just email me (Mark Wadden) at `mwadden@flowpoint.co` for help.

### Using the app

In the UI, you'll be prompted to upload a file with financial data. Use the file that's been included in this project, called `SAMPLE_FINANCIAL_DATA.xlsx`.

After you upload the file, you'll see two columns of labels. The "Custom Labels" are the labels from the file. The "Standard Labels" are the target labels that the user wants to map their file data to. Scrolling down, you'll see an area to create a new mapping. Here the user will select a custom label from their file and then select the target standard label to map to. This process will typically be repeated for each custom label that was found, but for the purposes of this demo, you only need to select a few mappings in order to proceed to the next step.

Once the user has created a few mappings, they can click the `View Mapped Data` button to see the results of their mapping. This will show a table that mirrors the data in the uploaded file, but using the selected standard labels instead of the original custom labels.

For example, let's say that the user creates the following mappings:

- Non-Recurring Revenues (Income Statement) → Revenue (Income Statement)
- Total Revenues (Income Statement) → Revenue (Income Statement)
- General & Administrative Expenses (Income Statement) → Operating Expenses (Income Statement)
- Sales & Marketing Expenses (Income Statement) → Operating Expenses (Income Statement)

Given these mappings, the table will now show **two** rows of data because the four custom labels were mapped to **two** standard labels. For each date column, the source values were **added together** because of the mappings. For example:

| Label               | Jan 2024   | Feb 2024   | Mar 2024   | Apr 2024   |
|---------------------|------------|------------|------------|------------|
| Operating Expenses  | $473,844   | $288,071   | $361,956   | $439,227   |
| Revenue             | $1,465,419 | $1,111,765 | $1,403,181 | $1,208,401 |

## Instructions

We'd like to see how you'd approach creating automated tests for this demo application.

Using Playwright (or another tool of your choice), add several tests to cover the main functionality. You can adjust the code as necessary to help accomplish this (e.g. adding `data-testid` attributes, minor refactorings, etc.).

We want to get a sense of how you approach testing something like this, but we also don't want for this to take a lot of your time. While you're free to take this task as far as you'd like, we recommend limiting your time spent to just a few hours (we're not looking for perfect coverage, just a few examples).

Also, when we meet again, please be prepared to discuss this demo in-depth, as we'd like to further explore all of the ways we can ensure a feature like this would run smoothly every time.

Once you've added the tests, simply zip up the project and email it to `mwadden@flowpoint.co` or post it to a public Github repo and send us the link. Please be sure to send it back _before_ our in-person meeting so that we have time to review it.

Thanks again for your time,

--
Mark Wadden
Principal Engineer
