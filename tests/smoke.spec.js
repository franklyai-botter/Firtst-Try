import { test, expect } from '@playwright/test';

test.describe('Kaiser – Smoke Tests', () => {

  test('Seite lädt ohne JS-Fehler', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    expect(errors).toHaveLength(0);
  });

  test('Startbildschirm ist sichtbar', async ({ page }) => {
    await page.goto('/');
    const startScreen = page.locator('#start-screen');
    await expect(startScreen).toBeVisible();
  });

  test('Namensfeld und Buttons vorhanden', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#player-name-input')).toBeVisible();
    await expect(page.locator('#gender-m-btn')).toBeVisible();
    await expect(page.locator('#gender-f-btn')).toBeVisible();
  });

  test('Leerer Name → Startbildschirm bleibt offen', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Herrschaft beginnen")');
    await expect(page.locator('#start-screen')).toBeVisible();
  });

  test('Spiel startet nach Namenseingabe', async ({ page }) => {
    await page.goto('/');
    await page.fill('#player-name-input', 'Frank');
    await page.click('button:has-text("Herrschaft beginnen")');
    await expect(page.locator('#start-screen')).not.toBeVisible();
    // Hauptspiel-UI sichtbar
    await expect(page.locator('#round-display')).toBeVisible();
    await expect(page.locator('#gold-val')).toBeVisible();
  });

  test('Runde beenden funktioniert', async ({ page }) => {
    await page.goto('/');
    await page.fill('#player-name-input', 'Frank');
    await page.click('button:has-text("Herrschaft beginnen")');

    const roundBefore = await page.locator('#round-display').textContent();
    await page.click('button:has-text("Runde beenden")');
    // Modal oder neue Runde
    const roundAfter = await page.locator('#round-display').textContent();
    // Entweder Runde hat sich erhöht oder Modal erscheint
    const modalVisible = await page.locator('#event-modal').isVisible();
    const roundChanged = roundBefore !== roundAfter;
    expect(roundChanged || modalVisible).toBeTruthy();
  });

});
