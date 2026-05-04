import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosBackendPage} from "../helpers/general-pages";
import {contentFrame} from "../helpers/content-iframe";

const {When, Then} = createBdd();

// ── Page creation variants ────────────────────────────────────────────────────
//
// When a page-tree node is currently focused, clicking AddNode opens the
// SelectNodeType dialog with an InsertModeSelector — the user must choose
// "into" before picking a NodeType. With no focused node (e.g. directly after
// login) the InsertModeSelector is skipped, so we expose two phrasings.

When(
    "I add a {string} child page named {string}",
    async ({page}, nodeType: string, title: string) => {
        const backend = new NeosBackendPage(page);
        await backend.pageTreeAddNodeButton().click();
        await backend.insertModeIntoButton().click();
        await backend.selectNodeTypeItem(nodeType).click();
        await backend.nodeCreationDialogTitleInput().fill(title);
        await backend.nodeCreationDialogConfirmButton().click();
    },
);

When(
    "I add a {string} page named {string}",
    async ({page}, nodeType: string, title: string) => {
        const backend = new NeosBackendPage(page);
        await backend.pageTreeAddNodeButton().click();
        await backend.selectNodeTypeItem(nodeType).click();
        await backend.nodeCreationDialogTitleInput().fill(title);
        await backend.nodeCreationDialogConfirmButton().click();
    },
);

// ── Deletion ─────────────────────────────────────────────────────────────────

When("I delete the selected page tree node", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.pageTreeDeleteSelectedNodeButton().click();
    await backend.deleteNodeModalConfirmButton().click();
});

When("I open the content tree and select {string}", async ({page}, name: string) => {
    const backend = new NeosBackendPage(page);
    await backend.contentTreeToggleButton().click();
    await backend.treeNodeLabel(name).click();
});

When("I delete the selected content tree node", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.contentTreeDeleteSelectedNodeButton().click();
    await backend.deleteNodeModalConfirmButton().click();
});

// ── Discard all ──────────────────────────────────────────────────────────────

When("I discard all changes", async ({page}) => {
    const backend = new NeosBackendPage(page);
    // While `isSaving` is true PublishDropDown renders the DropDown.Header with
    // no onClick handler — the toggle becomes a no-op. Wait for the main publish
    // button label to flip back from "saving" before opening the dropdown.
    await expect(backend.publishDropDownPublishButton()).not.toHaveText(/saving/i);
    // Re-fetch the toggle each time the dropdown is interacted with — the
    // saving / non-saving branches in PublishDropDown render different
    // DropDown.Header instances, and stale references can race the React commit.
    await openPublishDropDown(backend);
    await backend.publishDropDownDiscardAllButton().click();
    await backend.discardDialogConfirmButton().click();
    // Discarding many changes can take a while — the original TestCafe suite
    // also waited up to 30 s for the result dialog.
    await expect(backend.discardDialogAcknowledgeButton()).toBeVisible({timeout: 30_000});
    await backend.discardDialogAcknowledgeButton().click();
});

async function openPublishDropDown(backend: NeosBackendPage): Promise<void> {
    // The DiscardAll button only mounts when DropDown.Contents is open. Click the
    // toggle, then verify the panel actually opened — retry once if the click
    // was swallowed by a concurrent React rerender.
    await backend.publishDropDownToggle().click();
    try {
        await expect(backend.publishDropDownDiscardAllButton()).toBeVisible({timeout: 2_000});
    } catch {
        await backend.publishDropDownToggle().click();
        await expect(backend.publishDropDownDiscardAllButton()).toBeVisible();
    }
}

// ── Tree visibility ──────────────────────────────────────────────────────────

Then("the {string} tree node should be visible", async ({page}, name: string) => {
    const backend = new NeosBackendPage(page);
    await expect(backend.treeNodeLabel(name)).toBeVisible();
});

Then("no tree node {string} should be visible", async ({page}, name: string) => {
    const backend = new NeosBackendPage(page);
    await expect(backend.treeNodeLabel(name)).toHaveCount(0);
});

Then("the focused tree node should be {string}", async ({page}, name: string) => {
    await expect(
        page.locator('[role="treeitem"] [role="button"][class*="isFocused"]'),
    ).toHaveText(name);
});

// ── Workspace state via the PublishDropDown (no Redux) ───────────────────────
//
// "Discard All" is enabled iff there are publishable nodes anywhere in the
// site. Toggling the dropdown open is enough to inspect the button's disabled
// attribute; we close it again afterwards to leave a clean UI state.

Then("there should be unpublished changes", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await expect(backend.publishDropDownPublishButton()).not.toHaveText(/saving/i);
    await openPublishDropDown(backend);
    await expect(backend.publishDropDownDiscardAllButton()).toBeEnabled();
    await backend.publishDropDownToggle().click();
});

Then("there should be no unpublished changes", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await expect(backend.publishDropDownPublishButton()).not.toHaveText(/saving/i);
    await openPublishDropDown(backend);
    await expect(backend.publishDropDownDiscardAllButton()).toBeDisabled();
    await backend.publishDropDownToggle().click();
});

// ── Content iframe assertions ────────────────────────────────────────────────

Then("the rendered iframe should not show a Page Not Found page", async ({page}) => {
    await expect(
        contentFrame(page)
            .locator(".neos-message-header")
            .filter({hasText: "Page Not Found"}),
    ).toHaveCount(0);
});

Then(
    "the rendered content collection should not contain {string}",
    async ({page}, text: string) => {
        await expect(
            contentFrame(page).locator(".neos-contentcollection").filter({hasText: text}),
        ).toHaveCount(0);
    },
);

Then(
    "the rendered iframe should contain a content property with text {string}",
    async ({page}, text: string) => {
        await expect(
            contentFrame(page).locator("[data-__neos-property]").filter({hasText: text}).first(),
        ).toBeVisible();
    },
);

Then(
    "the rendered iframe should not contain a content property with text {string}",
    async ({page}, text: string) => {
        await expect(
            contentFrame(page).locator("[data-__neos-property]").filter({hasText: text}),
        ).toHaveCount(0);
    },
);
