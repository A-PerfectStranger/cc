const { test, expect } = require("@playwright/test");
async function ready(page) {
  await page.goto("/");
  await expect(page.locator(".family")).toHaveCount(74);
}
async function createProject(page, name) {
  await page.locator("#projects-tab").click();
  const projects = page.locator("#project-area");
  await expect(
    projects.getByRole("heading", { name: "Projects", exact: true }),
  ).toBeVisible();
  await projects
    .getByRole("button", { name: "New project", exact: true })
    .click();
  await page.locator('[name="name"]').fill(name);
  await page.locator('[name="description"]').fill("Project description");
  await page.locator('[name="scope"]').fill("Application boundary");
  await page.locator('#project-form button[type="submit"]').click();
  await expect(page.locator(".section-heading h1")).toHaveText(name);
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
test("project checklist persists selections, supports unchecking and keeps projects isolated", async ({
  page,
}) => {
  await ready(page);
  await createProject(page, "Alpha");
  const choice = page.locator('[data-check-component="FAU_GEN.1"]');
  await expect(choice).not.toBeChecked();
  await choice.check();
  await expect(page.locator("#selection-count")).toHaveText(
    "1 components selected",
  );
  await expect(
    page.locator("[data-annotation], [data-review], .element-editor"),
  ).toHaveCount(0);
  await page.reload();
  await expect(choice).toBeChecked();
  await page.locator("#selected-only").check();
  await expect(page.locator("[data-check-component]")).toHaveCount(1);
  // In selected-only mode the row disappears immediately after unchecking.
  await choice.click();
  await expect(page.locator("[data-check-component]")).toHaveCount(0);
  await page.locator("#selected-only").uncheck();
  await choice.check();
  await createProject(page, "Beta");
  await expect(choice).not.toBeChecked();
  await page.locator("#projects-tab").click();
  await page
    .getByRole("heading", { name: "Alpha", exact: true })
    .getByRole("link")
    .click();
  await expect(choice).toBeChecked();
  await page.locator("[data-edit]").click();
  await page.locator('[name="name"]').fill("Alpha renamed");
  await page.locator('#project-form button[type="submit"]').click();
  await expect(page.locator(".section-heading h1")).toHaveText("Alpha renamed");
});
test("checklist details are optional, deprecated components disabled, and mobile fits", async ({
  page,
}) => {
  await ready(page);
  await createProject(page, "Scope");
  await expect(
    page.locator('[data-check-component="FCS_CKM.4"]'),
  ).toBeDisabled();
  await page.locator("#search").fill("FAU_GEN.1.1");
  await expect(page.locator("[data-check-component]")).toHaveCount(1);
  await page.locator(".checklist-details summary").click();
  await expect(page.locator(".checklist-details article")).toHaveCount(2);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#mobile-class")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("checklist export/import creates a copy and rejects malformed files", async ({
  page,
}) => {
  await ready(page);
  await createProject(page, "<img src=x onerror=alert(1)>");
  await page.locator('[data-check-component="FAU_GEN.1"]').check();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator('[data-export="json"]').click(),
  ]);
  const stream = await download.createReadStream(),
    chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);
  expect(JSON.parse(buffer).project.components).toEqual(["FAU_GEN.1"]);
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
  await expect(
    page.locator('[data-check-component="FAU_GEN.1"]'),
  ).toBeChecked();
  expect(await page.locator("#project-area img").count()).toBe(0);
  const [markdown] = await Promise.all([
    page.waitForEvent("download"),
    page.locator('[data-export="md"]').click(),
  ]);
  const mdStream = await markdown.createReadStream(),
    md = [];
  for await (const chunk of mdStream) md.push(chunk);
  expect(Buffer.concat(md).toString()).toContain("- [x] FAU_GEN.1");
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

test("project creation waits for delayed hash navigation", async ({ page }) => {
  await page.addInitScript(() => {
    let delayed = false;
    window.addEventListener("hashchange", (event) => {
      if (!delayed && location.hash === "#projects") {
        delayed = true;
        event.stopImmediatePropagation();
        setTimeout(
          () => window.dispatchEvent(new HashChangeEvent("hashchange")),
          200,
        );
      }
    });
  });
  await ready(page);
  // The catalogue toolbar already has a New project button. It becomes hidden
  // when hash navigation renders Projects; selectors must target the workspace.
  await expect(page.locator("#project-toolbar [data-new]")).toBeVisible();
  await createProject(page, "Delayed navigation project");
  await expect(page.locator("#project-dialog")).not.toBeVisible();
  await expect(page.locator(".section-heading h1")).toHaveText(
    "Delayed navigation project",
  );
});
