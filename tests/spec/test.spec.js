import { test, expect } from "@playwright/test";
import PageObjectManager from "../pageObject/pageObjectManager";
let poManager;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  poManager = new PageObjectManager(page);
});

test("Upload Financial Data", async ({ page }) => {
  const fileLocation = "/Users/lei.yu/Downloads/test-engineer-assessment/SAMPLE_FINANCIAL_DATA.xlsx";
  await poManager.getWebBase().navigateTo("http://localhost:3000/");
  await expect(poManager.getUploadFinacialData().uploadSessionTitle).toBeVisible();
  await poManager.getUploadFinacialData().uploadTheFile(fileLocation);
  await expect(poManager.getLabelMapping().mappingCustomLabelsContainerTitle).toBeVisible();
});
test("Label Mapping", async ({ page }) => {
  const customLabelValue = 'Non-Recurring Revenues (Income statement)';
  const standardLabelValue = 'Revenue (Income Statement)';
  await poManager.getLabelMapping().createLabelMapping(customLabelValue, standardLabelValue);
  await expect(poManager.getLabelMapping().mappingTableTitle).toBeVisible();
  await expect(poManager.getLabelMapping().removeBtn).toBeVisible();

});
test("Financial Data Visualization", async ({ page }) => {
  await poManager.getFinancialDataVisualization().viewMappedData();
  await poManager.getFinancialDataVisualization().verifyMappedData("Revenue", ["Revenue", "$532,757", "$437,315", "$538,135", "$482,849"]);
});
test.afterAll(async () => {
  await poManager.page.close();
});
