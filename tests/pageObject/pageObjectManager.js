import WebBase from "./webBase";
import UploadFinacialData from "./uploadFinancialData";
import LabelMapping from "./labelMapping";
import FinancialDataVisualization from "./financialDataVisualization";
export default class pageObjectManager {
  constructor(page) {
    this.page = page;
    this.webBase = new WebBase(page);
    this.uploadFinacialData = new UploadFinacialData(page);
    this.labelMapping = new LabelMapping(page);
    this.financialDataVisualization = new FinancialDataVisualization(page);
  }

  getWebBase() {
    return this.webBase;
  }
  getUploadFinacialData() {
    return this.uploadFinacialData;
  }
  getLabelMapping() {
    return this.labelMapping;
  }
  getFinancialDataVisualization() {
    return this.financialDataVisualization;
  }
}
