import { test, expect } from "@playwright/test";

test.describe("Console Portal", () => {
  test("displays ecosystem dashboard", async ({ page }) => {
    await page.goto("/console");
    await expect(page.getByText("Ecosystem Dashboard")).toBeVisible();
  });

  test("has 5-division sidebar", async ({ page }) => {
    await page.goto("/console");
    await expect(page.getByText("Fixer Console")).toBeVisible();
    await expect(page.getByText("Oracle")).toBeVisible();
    await expect(page.getByText("Signal")).toBeVisible();
    await expect(page.getByText("Arène")).toBeVisible();
    await expect(page.getByText("Fusée")).toBeVisible();
    await expect(page.getByText("Socle")).toBeVisible();
  });

  test("navigates to clients page", async ({ page }) => {
    await page.goto("/console");
    await page.getByRole("link", { name: "Clients" }).click();
    await expect(page.getByText("Clients")).toBeVisible();
  });
});
