import { expect, test } from "@playwright/test";

/**
 * Дымовая проверка приложения студии.
 *
 * До удаления демо здесь лежали тесты консоли AgentFlow. Экрана больше нет, но
 * сам прогон нужен: `yarn vr:test` и `yarn test-storybook` проверяют витрину, а
 * не собранное приложение, и «сборка поднимается, но роутер отдаёт пустой
 * экран» на них не ловится. Поэтому проверяются ровно две вещи: корневой
 * указатель маршрутов и переход по нему на пилотный экран.
 */

test("корневой маршрут показывает указатель живых экранов", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Маршруты приложения" })).toBeVisible();

  // Четыре темы пилотного экрана. Число, а не список: состав маршрутов —
  // предмет правок, а вот «указатель пустой» это поломка роутера.
  await expect(page.locator('[data-testid^="studio-route-"]')).toHaveCount(4);
});

test("с указателя открывается пилотный экран заявки", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("studio-route-card-request-shadcn-branded").click();

  await expect(page).toHaveURL(/#card-request-shadcn-branded$/);
  await expect(page.getByTestId("card-request-shadcn-title")).toBeVisible();
  await expect(page.getByTestId("card-request-shadcn-actionbar")).toBeVisible();
});

test("прямой переход по хешу отдаёт пилотный экран", async ({ page }) => {
  await page.goto("/#card-request-shadcn");

  await expect(page.getByTestId("card-request-shadcn-title")).toBeVisible();
  await expect(page.getByTestId("card-request-shadcn-submit")).toBeVisible();
});
