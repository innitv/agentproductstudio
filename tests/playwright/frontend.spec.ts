import { expect, test } from "@playwright/test";

test("renders the SIM/eSIM landing page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Подключение SIM и eSIM без похода в салон" }),
  ).toBeVisible();
  await expect(page.locator("#top").getByRole("link", { name: "Оставить заявку" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Попробовать подбор" })).toBeVisible();
  await expect(page.getByText("SIM Line")).toBeVisible();
});

test("keeps the SIM selection flow readable", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".operator-row span")).toHaveCount(6);
  await expect(page.locator(".route-row")).toHaveCount(4);
  await expect(page.locator(".module-card")).toHaveCount(6);
  await expect(page.locator(".tariff-card")).toHaveCount(3);
  await expect(page.locator(".request-form")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Оставьте заявку на подбор SIM" })).toBeVisible();
});
