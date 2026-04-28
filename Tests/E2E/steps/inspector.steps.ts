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
