import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosBackendPage} from "../helpers/general-pages";
import {
    ChangeRequestTracker,
    clearInlineEditorContent,
    contentFrame,
    setInlineEditorContent,
} from "../helpers/content-iframe";

const {Given, When, Then} = createBdd();

// AJAX content-change requests are debounced 500 ms by the inline editor.
// The original TestCafe suite waited 1600 ms; keep that to stay clear of race conditions.
const CHANGE_REQUEST_DEBOUNCE_SETTLE_MS = 1600;

// One tracker per worker/page is sufficient — only one scenario runs at a time per worker
// and the route handler is registered on the active page.
const changeRequests = new ChangeRequestTracker();

// ── Page creation flow ────────────────────────────────────────────────────────

When('I click the "add new page" toolbar button', async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.pageTreeAddNodeButton().click();
});

When("I select the {string} node type", async ({page}, label: string) => {
    const backend = new NeosBackendPage(page);
    await backend.selectNodeTypeItem(label).click();
});

When("I go back from the node creation dialog", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.nodeCreationDialogBackButton().click();
});

When("I enter {string} as the new node title", async ({page}, title: string) => {
    const backend = new NeosBackendPage(page);
    await backend.nodeCreationDialogTitleInput().fill(title);
});

When("I confirm the node creation dialog", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.nodeCreationDialogConfirmButton().click();
});

Then(
    "the rendered page should contain {string} in its navigation",
    async ({page}, text: string) => {
        // The Home page's Fusion template renders an <li> per child page in its navigation.
        await expect(contentFrame(page).locator("li").filter({hasText: text}).first()).toBeVisible();
    },
);

// ── Inline content node creation + CKEditor ──────────────────────────────────

When("I add a {string} node via the content tree", async ({page}, label: string) => {
    const backend = new NeosBackendPage(page);
    // Open the content tree and explicitly focus the "Content Collection (main)" node —
    // clicking the iframe collection directly is unreliable because the click typically
    // lands on an existing child instead of the collection itself, which leaves
    // `into` mode disabled in the SelectNodeType dialog.
    await backend.contentTreeToggleButton().click();
    await backend.treeNodeLabel("Content Collection (main)").click();
    await backend.contentTreeAddNodeButton().click();
    // The SelectNodeType dialog renders an InsertModeSelector with the `into` button
    // enabled because the collection accepts content children.
    await backend.insertModeIntoButtonInline().click();
    await backend.selectNodeTypeItem(label).click();
});

When(
    "I set the last headline's text to {string} as a {string}",
    async ({page}, text: string, textType: string) => {
        // The new headline is appended to the content collection; pick the last one.
        await setInlineEditorContent(
            page,
            '.test-headline:last-child [contenteditable="true"]',
            text,
            textType as "heading1" | "heading2" | "heading3" | "heading4" | "paragraph",
        );
    },
);

When("I clear the last headline's text", async ({page}) => {
    await clearInlineEditorContent(
        page,
        '.test-headline:last-child [contenteditable="true"]',
    );
});

Then(
    "the rendered content collection should contain {string}",
    async ({page}, text: string) => {
        await expect(
            contentFrame(page).locator(".neos-contentcollection").filter({hasText: text}),
        ).toBeVisible();
    },
);

// ── Change-request tracking + validation tooltip ─────────────────────────────

Given("I track content-change requests", async ({page}) => {
    changeRequests.reset();
    await changeRequests.start(page);
});

When("I reset the content-change request counter", () => {
    changeRequests.reset();
});

When("I wait for the change-request debounce to settle", async ({page}) => {
    await page.waitForTimeout(CHANGE_REQUEST_DEBOUNCE_SETTLE_MS);
});

Then("a content-validation tooltip should be visible", async ({page}) => {
    // InlineValidationTooltips lives in neos-ui-guest-frame and renders ITS DOM
    // INSIDE the content iframe (see InlineValidationErrors/index.js). The error
    // text shows up as <ul><li>This property is required.</li></ul> inside a
    // Tooltip-classed wrapper — match the wrapper by its hashed class fragment.
    await expect(
        contentFrame(page).locator('[class*="tooltip--asError"]').first(),
    ).toBeVisible();
});

Then("no content-change request should have been sent", () => {
    expect(changeRequests.value).toBe(0);
});

Then("a content-change request should have been sent", () => {
    expect(changeRequests.value).toBeGreaterThan(0);
});
