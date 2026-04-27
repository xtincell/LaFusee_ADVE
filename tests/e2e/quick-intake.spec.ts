import { test, expect } from "@playwright/test";

test.describe("Quick Intake Flow", () => {
  test("displays the landing page", async ({ page }) => {
    await page.goto("/intake");
    await expect(page.getByText("Mesurez la force de votre marque en 15 minutes")).toBeVisible();
    await expect(page.getByText("Commencer le diagnostic")).toBeVisible();
  });

  test("shows required fields", async ({ page }) => {
    await page.goto("/intake");
    // Check form fields exist
    await expect(page.getByPlaceholder("Votre nom")).toBeVisible();
    await expect(page.getByPlaceholder("Email professionnel")).toBeVisible();
    await expect(page.getByPlaceholder("Nom de votre entreprise / marque")).toBeVisible();
  });

  test("has sector and country selectors", async ({ page }) => {
    await page.goto("/intake");
    const sectorSelect = page.locator("select").first();
    await expect(sectorSelect).toBeVisible();
    // Verify options exist
    const options = await sectorSelect.locator("option").count();
    expect(options).toBeGreaterThan(5);
  });
});
