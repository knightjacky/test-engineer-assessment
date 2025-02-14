import { test, expect, request } from "@playwright/test";
import tags from "../test-data/tags.json" assert { type: "json" };
test.beforeEach(async ({ page }) => {
  await page.route(
    //mock the server response
    "https://conduit-api.bondaracademy.com/api/tags",
    async (route) => {
      await route.fulfill({
        body: JSON.stringify(tags),
      });
    }
  );

  await page.goto("https://conduit.bondaracademy.com/");
  await page.getByText("Sign in").click();
  await page.getByRole("textbox", { name: "Email" }).fill("knight@jacky.com");
  await page.getByRole("textbox", { name: "Password" }).fill("Test123!");
  await page.getByRole("button").click();
});
test("mock api", async ({ page }) => {
  await page.route(
    // modify some of the response values
    "https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0",
    async (route) => {
      const response = await route.fetch();
      const responseBody = await response.json();
      responseBody.articles[0].title =
        "this is a test for modify the first article MOCK title";
      responseBody.articles[0].description =
        "modify the first ariticle MOCK description";
      await route.fulfill({
        body: JSON.stringify(responseBody),
      });
    }
  );
  await page.getByText("Global Feed").click();
  await expect(page.locator(".navbar-brand")).toHaveText("conduit");
  // because we interact with API we have to wait for 500 ms or set a assertion to make sure API reload properl
  await expect(page.locator("app-article-list h1").first()).toContainText(
    "this is a test for modify the first article MOCK title"
  );
  await expect(page.locator("app-article-list p").first()).toContainText(
    "modify the first ariticle MOCK description"
  );
  // await page.waitForTimeout(3000);
});

test("perform API call", async ({ page, request }) => {
  const response = await request.post("https://conduit-api.bondaracademy.com/api/users/login",{
      data: {
        "user": { "email": "knight@jacky.com", "password": "Test123!" }
      }
    });
  const responseBody = await response.json();
  const accessToken = responseBody.user.accessToken;
  const ariticleResponse = await request.post("https://conduit-api.bondaracademy.com/api/articles/",{
      data: {
        "article": {"title": "API title","description": "API description","body": "API body"}
      },
      headers: {
        Authorization: `Token ${accessToken}`
      }
    });
  // expect(ariticleResponse.status()).toEqual(201);
  await page.getByText("Global Feed").click();
  await page.getByText("API title").click();
  await page.getByRole("button", { name: "Delete Article" }).first().click();
  await page.getByText("Global Feed").click();
});

test('interact with browser API call', async ({ page, request }) => {
  await page.getByText('New Article').click();
  await page.getByRole('textbox', { name: 'Article Title' }).fill('Playwright is awesome');
  await page.getByRole('textbox', { name: "What's this article about?" }).fill('About the Playwright');
  await page.getByRole('textbox', { name: 'Write your article (in markdown)' }).fill('We like to use playwright for automation');
  await page.getByRole('button', { name: 'Publish Article' }).click();

  const articleResponse = await page.waitForResponse('https://conduit-api.bondaracademy.com/api/articles/');
  const articleResponseBody = await articleResponse.json();
  const slugId = articleResponseBody.article.slug;

  await expect(page.locator('.article-page h1')).toContainText('Playwright is awesome');
  await page.getByText('Home').click();
  await page.getByText('Global Feed').click();

  await expect(page.locator('app-article-list h1').first()).toContainText('Playwright is awesome');

  const response = await request.post("https://conduit-api.bondaracademy.com/api/users/login",{
    data: {
      user: {
        email: "knight@jacky.com",
        password: "Test123!"
      }
    }
  });
  const responseBody = await response.json();
  const accessToken = responseBody.user.token;
  process.env['ACCESS_TOKEN'] = accessToken;   // make accessToken to be global evironment varible 

  const deleteArticleResponse = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${slugId}`, {
    headers: {
      Authorization: `Token ${accessToken}`
    }
  });
  expect(deleteArticleResponse.status()).toEqual(204);
});
