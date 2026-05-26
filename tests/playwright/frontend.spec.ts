import { expect, test } from "@playwright/test";

test("renders the A3 payment reference landing page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Приём платежей в топ-банках страны" }),
  ).toBeVisible();
  await expect(page.locator("#top").getByRole("link", { name: "Оставить заявку" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Попробовать бесплатно" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Платёжный сервис с уникальной и умной технологией" })).toBeVisible();
});

test("keeps the payment service flow readable", async ({ page }) => {
  await page.goto("/");

  await expect(page.locator(".operator-row span")).toHaveCount(7);
  await expect(page.locator(".route-row")).toHaveCount(5);
  await expect(page.locator(".module-card")).toHaveCount(6);
  await expect(page.locator(".tariff-card")).toHaveCount(3);
  await expect(page.locator(".faq-item")).toHaveCount(3);
  await expect(page.locator(".request-form")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Остались вопросы?" })).toBeVisible();
});
