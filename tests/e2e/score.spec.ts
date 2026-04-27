import { test, expect } from "@playwright/test";

test.describe("Public Score Page", () => {
  test("displays the ADVE-RTIS scoring standard", async ({ page }) => {
    await page.goto("/score");
    await expect(page.getByText("Score ADVE-RTIS /200")).toBeVisible();
  });

  test("shows all 5 classification tiers", async ({ page }) => {
    await page.goto("/score");
    await expect(page.getByText("Zombie")).toBeVisible();
    await expect(page.getByText("Ordinaire")).toBeVisible();
    await expect(page.getByText("Forte")).toBeVisible();
    await expect(page.getByText("Culte")).toBeVisible();
    await expect(page.getByText("Icône")).toBeVisible();
  });

  test("shows all 8 pillars", async ({ page }) => {
    await page.goto("/score");
    await expect(page.getByText("Authenticité")).toBeVisible();
    await expect(page.getByText("Distinction")).toBeVisible();
    await expect(page.getByText("Engagement")).toBeVisible();
  });

  test("has CTA to quick intake", async ({ page }) => {
    await page.goto("/score");
    const cta = page.getByRole("link", { name: "Mesurer votre marque gratuitement" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/intake");
  });
});
