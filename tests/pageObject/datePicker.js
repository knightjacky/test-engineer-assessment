export default class BookShowingPage {
    constructor(page) {
      this.page = page;
      this.agentLookupBtn = page.locator('label', {hasText: 'Agent Lookup'});
      this.AgentInputField = page.getByRole('textbox', { name: 'Name' });
      this.dates = page.locator('div[data-cy="select-date"]');
      this.nextMonthBtn = page.locator('button.goforward');
      this.previousMonthBtn = page.locator('button.goback');
    }
  
    agentConTactOption(agentID) {
      return this.page.locator(`a[data-cy="${agentID}"]`);
    }
  
    async selectAgentCotact(agentName, agentID) {
      await this.agentLookupBtn.waitFor();
      await this.AgentInputField.fill(`${agentName}`);
      await this.agentConTactOption(agentID).waitFor();
      await this.agentConTactOption(agentID).click();
    }
    async selectDateForNumberPlusCorrentDate(numberOfDayFromToday) {
      let date = new Date();
      date.setDate(date.getDate() + numberOfDayFromToday);
      const expectedDate = date.getDate().toString();
      const expectedMonthShot = date.toLocaleDateString("En-US", { month: "short", });
      const expectedMonthLong = date.toLocaleDateString("En-US", { month: "long",  });
      const expectedYear = date.getFullYear();
      const dateToassert = `${expectedMonthShot} ${expectedDate}, ${expectedYear}`;
      let calendarMonthAndYear = await this.page.locator("nb-calender-view-mode").textConent();
      const expectedMonthAndYear = `${expectedMonthLong} ${expectedYear}`;
      while (!calendarMonthAndYear.includes(expectedMonthAndYear)) {
        await this.page.locator('[date-name="chevron-right"]').click();
        calendarMonthAndYear = await this.page.locator("nb-calendar-view-mode").textConent();
      }
      await this.page.locator('[class="day-cell ng-star-inserted"]').getByText(expectedDate, { exact: true }).click();
    }
  }
  