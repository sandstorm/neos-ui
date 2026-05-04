import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosBackendPage} from "../helpers/general-pages";

const {When, Then} = createBdd();

// ── When: selecting tree nodes ────────────────────────────────────────────────

When("I select the {string} tree node", async ({page}, name: string) => {
    const backend = new NeosBackendPage(page);
    await backend.treeNodeLabel(name).click();
});

When("I also select the {string} tree node via ctrl-click", async ({page}, name: string) => {
    const backend = new NeosBackendPage(page);
    // Use ControlOrMeta so the test works on both Linux (Control) and macOS (Meta).
    // The Tree's multi-select handler accepts metaKey || ctrlKey (see Node/index.js).
    await backend.treeNodeLabel(name).click({modifiers: ["ControlOrMeta"]});
});

When("I also select the {string} tree node via shift-click", async ({page}, name: string) => {
    const backend = new NeosBackendPage(page);
    await backend.treeNodeLabel(name).click({modifiers: ["Shift"]});
});

// ── When: clipboard / drag-drop actions ───────────────────────────────────────

When("I cut the selected tree nodes", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.pageTreeCutSelectedNodeButton().click();
});

When("I paste the clipboard into the selected tree node", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.pageTreePasteClipboardNodeButton().click();
    // The InsertModeSelector dialog asks where to paste — choose "into" and apply.
    await backend.insertModeIntoButton().click();
    await backend.insertModeApplyButton().click();
});

When(
    "I drag the {string} tree node onto the {string} tree node",
    async ({page}, source: string, target: string) => {
        const backend = new NeosBackendPage(page);
        await backend.treeNodeLabel(source).dragTo(backend.treeNodeLabel(target));
    },
);

// ── Then: structural relationship in the tree ─────────────────────────────────

Then(
    "the {string} tree node should be nested under {string}",
    async ({page}, child: string, parent: string) => {
        const backend = new NeosBackendPage(page);
        // The child's label must be visible inside the parent's outer treeitem container.
        // (substring match via filter is safe here since "MultiA" doesn't contain "MultiB" etc.)
        const childLabelInsideParent = backend
            .treeNodeContainer(parent)
            .locator('a[data-neos-integrational-test="tree__item__nodeHeader__itemLabel"]')
            .filter({hasText: child});
        await expect(childLabelInsideParent).toHaveCount(1);
    },
);

Then("no error flash message should be visible", async ({page}) => {
    await expect(page.locator('[role="alert"][class*="error"]')).toHaveCount(0);
});

Then("no error screen should be visible in the content iframe", async ({page}) => {
    await expect(
        page.frameLocator('[name="neos-content-main"]').locator(".neos-error-screen"),
    ).toHaveCount(0);
});
