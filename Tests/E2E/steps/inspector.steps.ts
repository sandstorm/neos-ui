import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosBackendPage} from "../helpers/general-pages";

const {When, Then} = createBdd();

// ── When ──────────────────────────────────────────────────────────────────────

When("I refresh the document tree", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.refreshDocumentTreeButton().click();
});

When("I set the inspector {string} field to {string}", async ({page}, propertyName: string, value: string) => {
    const backend = new NeosBackendPage(page);
    await backend.inspectorField(propertyName).fill(value);
});

When("I clear the inspector {string} field", async ({page}, propertyName: string) => {
    const backend = new NeosBackendPage(page);
    await backend.inspectorField(propertyName).fill("");
});

When("I apply the inspector changes", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.inspectorApplyButton().click();
});

When("I discard the inspector changes", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.inspectorDiscardButton().click();
});

When(
    "I append {string} to the inspector {string} field",
    async ({page}, text: string, propertyName: string) => {
        const backend = new NeosBackendPage(page);
        const field = backend.inspectorField(propertyName);
        await field.focus();
        await field.press("End");
        await field.pressSequentially(text);
    },
);

When("I sync the URL path segment from the title", async ({page}) => {
    const backend = new NeosBackendPage(page);
    // The URI sync reads options.title which the inspector resolves from the
    // ClientEval expression `node.properties.title` against transient state.
    // The inspector runs that resolution on a 250ms debounce (leading=true,
    // so the first edit fires immediately, but rapid edits are coalesced).
    // Mirror the 200ms wait the original testcafe suite used so we click
    // sync only after the resolved title has settled.
    await page.waitForTimeout(300);
    await backend.uriPathSegmentSyncButton().click();
});

When("I click outside the inspector to trigger the unapplied-changes overlay", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.unappliedChangesOverlay().click();
});

When("I resume editing in the unapplied-changes dialog", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.unappliedChangesResumeButton().click();
});

When("I discard the inspector changes from the unapplied-changes dialog", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.unappliedChangesDiscardButton().click();
});

Then("the unapplied-changes dialog should be visible", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await expect(backend.unappliedChangesDialog()).toBeVisible();
});

Then("the unapplied-changes dialog should not be visible", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await expect(backend.unappliedChangesDialog()).toHaveCount(0);
});

// ── Then ──────────────────────────────────────────────────────────────────────

Then("the inspector {string} field should show {string}", async ({page}, propertyName: string, expected: string) => {
    const backend = new NeosBackendPage(page);
    await expect(backend.inspectorField(propertyName)).toHaveValue(expected);
});

Then("the active inspector tab should show {int} validation error(s)", async ({page}, expected: number) => {
    const backend = new NeosBackendPage(page);
    await expect(backend.activeInspectorTabBadge()).toHaveText(String(expected));
});

Then("the active inspector tab should show no validation errors", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await expect(backend.activeInspectorTabBadge()).toHaveCount(0);
});
