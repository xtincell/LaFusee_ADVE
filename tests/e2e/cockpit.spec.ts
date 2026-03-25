import { test, expect } from "@playwright/test";

test.describe("Cockpit Portal", () => {
  test("displays the cult dashboard", async ({ page }) => {
    await page.goto("/cockpit");
    await expect(page.getByText("Cult Dashboard")).toBeVisible();
  });

  test("has sidebar navigation", async ({ page }) => {
    await page.goto("/cockpit");
    await expect(page.getByText("Brand OS")).toBeVisible();
    await expect(page.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Opérationnel" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Marque" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Insights" })).toBeVisible();
  });

  test("shows ADVE radar chart area", async ({ page }) => {
    await page.goto("/cockpit");
    await expect(page.getByText("Radar ADVE-RTIS")).toBeVisible();
  });

  test("shows Devotion Ladder", async ({ page }) => {
    await page.goto("/cockpit");
    await expect(page.getByText("Devotion Ladder")).toBeVisible();
  });

  test("navigates to missions page", async ({ page }) => {
    await page.goto("/cockpit");
    await page.getByRole("link", { name: "Opérationnel" }).click();
    await expect(page.getByText("Missions")).toBeVisible();
  });
});
