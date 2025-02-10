export default class WebBase {
  constructor(page) {
    this.page = page;
  }

  async navigateTo(url) {
    await this.page.goto(url);
  }
  async waitForNumberOfSeconds(timeInSeconds) {
    await this.page.waitForTimeout(timeInSeconds * 1000);
  }
}
