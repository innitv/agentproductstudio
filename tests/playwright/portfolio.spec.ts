import { expect, test } from "@playwright/test";

const basePath = process.env.PORTFOLIO_BASE_PATH ?? "/portfolio";
const portfolioUrl = (path = "") => `${basePath.replace(/\/$/, "")}${path}` || "/";

test("renders the site portfolio home route", async ({ page }) => {
  await page.goto(portfolioUrl());

  await expect(page.getByRole("heading", { name: "Дизайнер сложных продуктов" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Открыть компанию А3/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Открыть компанию РТК/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Открыть компанию Самолет/ })).toBeVisible();
});

test("supports portfolio company and case routes", async ({ page }) => {
  await page.goto(portfolioUrl("/a3"));

  await expect(page.getByRole("heading", { name: "А3" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Открыть кейс Редизайн главной" })).toBeVisible();

  await page.goto(portfolioUrl("/a3/case/dashboard-redesign"));

  await expect(page.getByRole("heading", { name: "Редизайн главной. Из промо-блока в рабочий B2B-dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Контекст/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "А3", exact: true })).toBeVisible();
});
