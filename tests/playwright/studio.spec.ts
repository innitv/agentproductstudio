import { expect, test } from "@playwright/test";

test("renders the AgentFlow SaaS Console dashboard", async ({ page }) => {
  await page.goto("/#console");

  await expect(
    page.getByRole("heading", { name: "SaaS-платформа для создания и продажи ИИ-агентов" }),
  ).toBeVisible();

  await expect(page.locator(".console-sidebar")).toBeVisible();
  await expect(page.locator(".console-sidebar").getByRole("button", { name: "Панель управления" })).toBeVisible();
  await expect(page.locator(".console-sidebar").getByRole("button", { name: "Создать ИИ-агента" })).toBeVisible();
  await expect(page.locator(".console-sidebar").getByRole("button", { name: "Тарифы и биллинг" })).toBeVisible();
  await expect(page.locator(".console-sidebar").getByRole("button", { name: "Частые вопросы" })).toBeVisible();

  await expect(page.locator(".metric-card")).toHaveCount(3);
  await expect(page.getByText("Лидов обработано")).toBeVisible();
  await expect(page.getByText("Конверсия в Демо")).toBeVisible();
  await expect(page.getByText("Сэкономлено костов")).toBeVisible();

  await expect(page.locator(".agents-table")).toBeVisible();
  await expect(page.locator(".agent-row")).toHaveCount(3);
  await expect(page.locator(".chat-messages-box")).toBeVisible();
});

test("supports interacting with chat simulator and switching tabs", async ({ page }) => {
  await page.goto("/#console");

  const chatInput = page.getByPlaceholder("Спросите агента про тарифы, ошибки или регламент...");
  await expect(chatInput).toBeVisible();
  await chatInput.fill("Привет! Какая цена?");

  const submitBtn = page.locator(".chat-submit-btn");
  await submitBtn.click({ force: true });

  await expect(page.getByText("Привет! Какая цена?")).toBeVisible();

  await page.locator(".console-sidebar").getByRole("button", { name: "Создать ИИ-агента" }).click();
  await expect(page.getByRole("heading", { name: "No-code конструктор нового ИИ-агента" })).toBeVisible();

  await expect(page.getByLabel("Имя ИИ-агента")).toBeVisible();
  await expect(page.getByLabel("Роль ИИ-агента")).toBeVisible();
  await expect(page.getByLabel("Регламент ИИ-агента и база знаний")).toBeVisible();

  await page.locator(".console-sidebar").getByRole("button", { name: "Тарифы и биллинг" }).click();
  await expect(page.getByRole("heading", { name: "Гибкие SaaS тарифы под любой масштаб" })).toBeVisible();
  await expect(page.locator(".tariff-card")).toHaveCount(3);

  await page.locator(".console-sidebar").getByRole("button", { name: "Частые вопросы" }).click();
  await expect(page.getByRole("heading", { name: "Часто задаваемые вопросы" })).toBeVisible();
  await expect(page.locator(".faq-item")).toHaveCount(3);
});
