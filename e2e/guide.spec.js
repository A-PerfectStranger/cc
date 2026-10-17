const { test, expect } = require("@playwright/test");
async function ready(page) {
  await page.goto("/");
  await expect(page.locator(".family")).toHaveCount(74);
}
async function createProject(page, name) {
  await page.locator("#projects-tab").click();
  await page.locator("[data-new]").first().click();
  await page.locator('[name="name"]').fill(name);
  await page.locator('[name="description"]').fill("Project description");
  await page.locator('[name="scope"]').fill("Application boundary");
  await page.locator('#project-form button[type="submit"]').click();
  await expect(page.locator(".section-heading h1")).toHaveText(name);
}
async function addElement(page) {
  await page.locator("#scope-toggle").click();
  await page.locator("#search").fill("FAU_GEN.1.1");
  await page.locator('[data-use="FAU_GEN.1"]').click();
  await page.locator("#search").fill("");
  await page.locator("#scope-toggle").click();
}
test("catalogue filters, stable keyboard focus, saved bookmarks, and reading state", async ({
  page,
}) => {
  await ready(page);
  const nav = page.locator('[data-class="FIA"]');
  await nav.focus();
  await page.keyboard.press("Enter");
  await expect(nav).toBeFocused();
  await expect(nav).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".family")).toHaveCount(7);
  await page.locator('[data-class="all"]').click();
  await page.locator(".family").first().locator(":scope > summary").click();
  await page.locator("#search").fill("FAU_GEN.1.1");
  await expect(page.locator(".element")).toHaveCount(1);
  await expect(page.locator("mark").first()).toBeVisible();
  await page.locator('[data-save="FAU_GEN.1.1"]').click();
  await page.locator("#search").fill("");
  await expect(page.locator(".family").first()).toHaveAttribute("open", "");
  await page.locator("#saved").click();
  await expect(page.locator(".element")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("#saved-count")).toHaveText("1");
});
test("whole-component scope, notes, progress, review, persistence, undo, and isolation", async ({
  page,
}) => {
  await ready(page);
  await createProject(page, "Alpha");
  await addElement(page);
  await expect(page.locator(".element")).toHaveCount(2);
  const notes = page.locator('[data-annotation="notes"]').first();
  await notes.fill("Keep this evidence");
  await page
    .locator('[data-annotation="status"]')
    .first()
    .selectOption("Verified");
  await page
    .locator('[data-annotation="operations"]')
    .first()
    .fill("Basic audit events");
  await page.locator('[data-annotation="operationsReviewed"]').first().check();
  await page
    .locator('[data-review="notes"]')
    .fill("Considered hierarchy and alternatives");
  await page.locator('[data-review="reviewed"]').check();
  await expect(page.locator("#project-metrics")).toContainText(
    "0 dependency reviews pending",
  );
  await page.reload();
  await expect(page.locator('[data-annotation="notes"]').first()).toHaveValue(
    "Keep this evidence",
  );
  await expect(
    page.locator('[data-annotation="operationsReviewed"]').first(),
  ).toBeChecked();
  await page.locator('[data-component="FAU_GEN.1"]').click();
  await expect(page.locator(".element")).toHaveCount(0);
  await page.locator("#undo-removal").click();
  await expect(page.locator('[data-annotation="notes"]').first()).toHaveValue(
    "Keep this evidence",
  );
  await createProject(page, "Beta");
  await expect(page.locator(".element")).toHaveCount(0);
  await page.selectOption("#active-project", { label: "Alpha" });
  await expect(page.locator('[data-annotation="notes"]').first()).toHaveValue(
    "Keep this evidence",
  );
  await page.locator("[data-edit]").click();
  await page.locator('[name="name"]').fill("Alpha renamed");
  await page.locator('#project-form button[type="submit"]').click();
  await expect(page.locator(".section-heading h1")).toHaveText("Alpha renamed");
});
test("family bulk selection, deprecation protection, and mobile layout", async ({
  page,
}) => {
  await ready(page);
  await createProject(page, "Scope");
  await page.locator("#scope-toggle").click();
  await page.locator("#search").fill("FCS_CKM");
  await expect(page.locator('[data-component="FCS_CKM.4"]')).toBeDisabled();
  await page.locator('[data-family="FCS_CKM"]').click();
  await expect(page.locator('[data-family="FCS_CKM"]')).toBeDisabled();
  await expect(page.locator("#project-metrics")).toContainText("5");
  await page.locator("#search").fill("");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#mobile-class")).toBeVisible();
  await expect(page.locator('#mobile-class option[value="FIA"]')).toHaveText(
    /Identification and authentication/,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.locator("#scope-toggle").click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("export/import round trip creates a copy, escapes content, and rejects bad files", async ({
  page,
}) => {
  await ready(page);
  await createProject(page, "<img src=x onerror=alert(1)>");
  await addElement(page);
  await page
    .locator('[data-annotation="notes"]')
    .first()
    .fill("<script>unsafe()</script>");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator('[data-export="json"]').click(),
  ]);
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);
  const parsed = JSON.parse(buffer);
  expect(parsed.requirements[0].elements[0].text).toContain("shall");
  await page
    .locator("#import-file")
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer,
    });
  await expect(page.locator("#import-dialog")).toBeVisible();
  await page.locator("#confirm-import").click();
  await expect(page.locator(".section-heading h1")).toContainText("(imported)");
  await expect(page.locator('[data-annotation="notes"]').first()).toHaveValue(
    "<script>unsafe()</script>",
  );
  expect(await page.locator("#project-area img").count()).toBe(0);
  await page.locator("#projects-tab").click();
  await expect(page.locator(".project-card")).toHaveCount(2);
  await page
    .locator("#import-file")
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from("{bad"),
    });
  await expect(page.locator("#toast")).toContainText("Import rejected");
  await expect(page.locator(".project-card")).toHaveCount(2);
});
test("storage failures are visible and corrupt records remain untouched", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("cc-projects-v1", "corrupt-original");
    localStorage.setItem("cc-saved", "{}");
  });
  await ready(page);
  await expect(page.locator("#storage-error")).toBeVisible();
  await createProject(page, "In-memory project");
  await expect(page.locator("#storage-error")).toContainText("export a backup");
  expect(
    await page.evaluate(() => localStorage.getItem("cc-projects-v1")),
  ).toBe("corrupt-original");
  await expect(page.locator('[data-export="json"]')).toBeVisible();
});
test("quota failures are visible and the in-memory project remains exportable", async ({
  page,
}) => {
  await ready(page);
  await page.evaluate(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Quota", "QuotaExceededError");
    };
  });
  await createProject(page, "Unsaved");
  await expect(page.locator("#storage-error")).toContainText("could not save");
  await expect(page.locator('[data-export="json"]')).toBeVisible();
});
test("sampled normal-text contrast meets WCAG AA", async ({ page }) => {
  await ready(page);
  const ratios = await page.evaluate(() => {
    function lum(c) {
      return c
        .match(/[\d.]+/g)
        .slice(0, 3)
        .map(Number)
        .map((x) => {
          x /= 255;
          return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
        })
        .reduce((a, x, i) => a + x * [0.2126, 0.7152, 0.0722][i], 0);
    }
    return [".family-title p", ".family-title .code", ".intro p"].map((s) => {
      const e = document.querySelector(s);
      let bg = e;
      while (bg && getComputedStyle(bg).backgroundColor === "rgba(0, 0, 0, 0)")
        bg = bg.parentElement;
      const a = lum(getComputedStyle(e).color),
        b = lum(getComputedStyle(bg).backgroundColor);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
  });
  for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
});
