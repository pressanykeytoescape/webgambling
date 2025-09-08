import { test, expect } from '@playwright/test';

test('lobby to slots spin adjusts balance', async ({ page }) => {
  // Navigate to lobby
  await page.goto('/');
  // Click Einzahlen to reset balance
  const depositButton = page.getByRole('button', { name: /Einzahlen/i });
  await depositButton.click();
  // Read starting balance
  const balanceElement = page.locator('[aria-live="polite"]').first();
  const balanceText = await balanceElement.innerText();
  const startingBalance = parseInt(balanceText.trim(), 10);
  // Navigate to slots
  await page.getByRole('link', { name: /Slots/i }).click();
  // Input bet amount 10
  const betInput = page.locator('#bet');
  await betInput.fill('10');
  // Click spin
  await page.getByRole('button', { name: /Spin/i }).click();
  // Wait for spin animation
  await page.waitForTimeout(1200);
  // Get balance after spin (navigate back to lobby)
  await page.getByRole('link', { name: /Zurück zur Lobby/i }).click();
  const newBalanceText = await page.locator('[aria-live="polite"]').first().innerText();
  const newBalance = parseInt(newBalanceText.trim(), 10);
  // Ensure balance changed from starting (either decreased by bet or increased on win)
  expect(newBalance).not.toBe(startingBalance);
});