import { test, expect } from "@playwright/test";

test("Should open page", async ({ page }) => {
  await page.goto("https://stability.farm/");
});
