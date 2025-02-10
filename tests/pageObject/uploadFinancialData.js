export default class UploadFinacialData {
  constructor(page) {
    this.page = page;
    this.uploadSessionTitle = page.locator('h2', { hasText: 'Upload Financial Data' });
    this.fileInput = page.locator('input[type="file"]');
    this.uploadBtn = page.locator('button[type="submit"]');
  }

  async uploadTheFile(fileLocation) {
    await this.fileInput.setInputFiles(fileLocation);
    await this.uploadBtn.click();
  }
}




