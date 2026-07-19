import { test, expect } from '@playwright/test';

test.describe('Neural Manager – Smoke Tests', () => {

  test('Seite lädt ohne JS-Fehler', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/ai-manager/');
    await page.waitForLoadState('domcontentloaded');

    expect(errors).toHaveLength(0);
  });

  test('Startbildschirm ist sichtbar', async ({ page }) => {
    await page.goto('/ai-manager/');
    await expect(page.locator('#start-screen')).toBeVisible();
    await expect(page.locator('#inp-company')).toBeVisible();
    await expect(page.locator('#inp-manager')).toBeVisible();
  });

  test('Leere Eingabe → Startbildschirm bleibt offen', async ({ page }) => {
    await page.goto('/ai-manager/');
    await page.click('#btn-found');
    await expect(page.locator('#start-screen')).toBeVisible();
  });

  test('Agentur gründen startet das Spiel', async ({ page }) => {
    await page.goto('/ai-manager/');
    await page.fill('#inp-company', 'Test Labs');
    await page.fill('#inp-manager', 'Frank');
    await page.click('#btn-found');
    await expect(page.locator('#start-screen')).toBeHidden();
    await expect(page.locator('#h-credits')).toBeVisible();
    await expect(page.locator('#h-league')).toContainText('Garagen-Liga');
  });

  test('Kompletter Spielzug: zuweisen, simulieren, Report schließen', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/ai-manager/');
    await page.fill('#inp-company', 'Test Labs');
    await page.fill('#inp-manager', 'Frank');
    await page.click('#btn-found');

    // Aufträge-Tab: ersten Agenten dem ersten Auftrag zuweisen
    await page.click('nav button[data-tab="auftraege"]');
    await page.locator('.contract .chip:not([disabled])').first().click();
    await expect(page.locator('.chip.sel')).toHaveCount(1);

    // Woche simulieren → Wochenreport erscheint
    await page.click('#btn-sim');
    await expect(page.locator('#modal-wrap')).toBeVisible();
    await expect(page.locator('#modal-content')).toContainText('Wochenreport');

    // Report + ggf. Event-Modals durchklicken
    for (let i = 0; i < 5; i++) {
      const visible = await page.locator('#modal-wrap').isVisible();
      if (!visible) break;
      await page.locator('.modal-btns button').first().click();
      await page.waitForTimeout(150);
    }

    // Woche ist weitergezählt
    await expect(page.locator('#h-week')).toContainText('Woche');
    expect(errors).toHaveLength(0);
  });

  test('Alle Tabs rendern ohne Fehler', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/ai-manager/');
    await page.fill('#inp-company', 'Test Labs');
    await page.fill('#inp-manager', 'Frank');
    await page.click('#btn-found');

    for (const tab of ['auftraege', 'team', 'markt', 'liga', 'zentrale']) {
      await page.click(`nav button[data-tab="${tab}"]`);
      await expect(page.locator(`#tab-${tab}`)).toBeVisible();
    }
    expect(errors).toHaveLength(0);
  });

  test('Spielstand wird gespeichert (Weiterspielen-Button)', async ({ page }) => {
    await page.goto('/ai-manager/');
    await page.fill('#inp-company', 'Test Labs');
    await page.fill('#inp-manager', 'Frank');
    await page.click('#btn-found');

    await page.reload();
    await expect(page.locator('#btn-continue')).toBeVisible();
    await page.click('#btn-continue');
    await expect(page.locator('#start-screen')).toBeHidden();
  });
});
