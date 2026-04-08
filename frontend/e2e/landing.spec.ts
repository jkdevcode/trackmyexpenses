import { test, expect } from "@playwright/test";

test("landing hero renders", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("preferredLanguage", "en-US");
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await expect(
    page.getByAltText("Preview of the interface", { exact: true }),
  ).toBeVisible();
});
