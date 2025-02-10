export default class LabelMapping {
  constructor(page, customLabelValue, standardLabelValue) {
    this.page = page;
    this.customLabelValue = customLabelValue;
    this.standardLabelValue = standardLabelValue;
    this.mappingCustomLabelsContainerTitle = page.locator('h3', { hasText: 'Custom Labels' });
    this.customLabelDropdown = page.locator('select[name="customLabel"]', { state: 'visible' });
    this.customLabelOptions = page.locator('select[name="customLabel"] option');
    this.standardLabelDropdown = page.locator('select[name="standardLabelId"]', { state: 'visible' });
    this.standardLabelOptions = page.locator('select[name="standardLabelId"] option');
    this.mappingBtn = page.locator('button', {hasText: 'Add Mapping'});
    this.mappingTableTitle = page.locator('h4', { hasText: 'Current Mappings' });
    this.removeBtn = page.locator('button', {hasText: 'Remove'}).first();
  }

  async createLabelMapping(customLabelValue, standardLabelValue) {
    await this.customLabelDropdown.click();
    await this.customLabelDropdown.selectOption({label: `${customLabelValue}`});
    // await this.customLabelOptions.filter({hasText: `${customLabelValue}`}).click();
    // const customLabelElement = this.customLabel(customLabelValue);
    // await customLabelElement.waitFor({ state: 'visible' });
    // await customLabelElement.click();
    await this.standardLabelDropdown.click();
    await this.standardLabelDropdown.selectOption({label: `${standardLabelValue}`});
    // await this.standardLabelOptions.filter({hasText: `${standardLabelValue}`}).click();
    // const standardLabelElement = this.standardLabel(standardLabelValue);
    // await standardLabelElement.waitFor({ state: 'visible' });
    // await standardLabelElement.click();
    await this.mappingBtn.click();
  }
}
