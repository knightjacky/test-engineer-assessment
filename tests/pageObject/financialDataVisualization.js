import {expect } from "@playwright/test";


export default class FinancialDataVisualization {
  constructor(page) {
    this.page = page;
    this.visualizationTableTitle = page.locator('h3', { hasText: 'Income Statement'});
    this.viewMappedDataBtn = page.locator('button', { hasText: 'View Mapped Data'});
  }

  allValues(rowValue){
    return this.page.locator(`//td[contains(text(), "${rowValue}")]/parent::tr/td`);
  }
  async getNormalizedText(locator) {
    await locator.last().waitFor();
    const text = await locator.allTextContents();
    return text.map(value => value.replace(/\s+/g, ' ').trim());
  }
  async viewMappedData() {
    await this.viewMappedDataBtn.click();
  }
  async verifyMappedData(rowValue, array) {
    await expect(this.visualizationTableTitle).toBeVisible();
    await this.page.waitForLoadState('networkidle');
    const values = await this.getNormalizedText(this.allValues(rowValue)); 
    await expect.soft(values).toEqual(array);
  }
}
