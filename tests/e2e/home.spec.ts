import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("displays the LaFusée title and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("LaFusée Industry OS")).toBeVisible();
    await expect(page.getByText("De la Poussière à l'Étoile")).toBeVisible();
  });

  test("has navigation links to all portals", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Cockpit" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Creator" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Console" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Quick Intake" })).toBeVisible();
  });

  test("navigates to cockpit", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Cockpit" }).click();
    await expect(page).toHaveURL("/cockpit");
    await expect(page.getByText("Cult Dashboard")).toBeVisible();
  });

  test("navigates to creator", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Creator" }).click();
    await expect(page).toHaveURL("/creator");
    await expect(page.getByText("Creator Dashboard")).toBeVisible();
  });

  test("navigates to console", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Console" }).click();
    await expect(page).toHaveURL("/console");
    await expect(page.getByText("Ecosystem Dashboard")).toBeVisible();
  });
});
