import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("renders sign-in page with correct elements", async ({ page }) => {
    await page.goto("/auth");
    await expect(page.locator("h1")).toContainText("CloudPilot AI");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("shows error for empty form submission", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: "Sign In" }).click();
    await expect(page.getByText("Email and password are required")).toBeVisible();
  });

  test("can toggle between sign-in and sign-up modes", async ({ page }) => {
    await page.goto("/auth");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page.getByRole("button", { name: /Create Account/i }).last()).toBeVisible();
    await page.getByRole("button", { name: "Sign In" }).first().click();
    await expect(page.getByRole("button", { name: /Sign In/i }).last()).toBeVisible();
  });

  test("can toggle password visibility", async ({ page }) => {
    await page.goto("/auth");
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    // Click the eye icon button (adjacent to password input)
    await page.locator('input[type="password"]').locator("..").locator("button").click();
    await expect(page.locator('input[type="text"]').last()).toBeVisible();
  });

  test("redirects unauthenticated users to /auth", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("**/auth");
    expect(page.url()).toContain("/auth");
  });
});

test.describe("Protected Routes", () => {
  test("operations page redirects to auth when not logged in", async ({ page }) => {
    await page.goto("/operations");
    await page.waitForURL("**/auth");
    expect(page.url()).toContain("/auth");
  });

  test("reports page redirects to auth when not logged in", async ({ page }) => {
    await page.goto("/reports");
    await page.waitForURL("**/auth");
    expect(page.url()).toContain("/auth");
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-route");
    await expect(page.getByText("404")).toBeVisible();
  });
});
