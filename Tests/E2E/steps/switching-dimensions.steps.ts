import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosBackendPage} from "../helpers/general-pages";

const {When, Then} = createBdd();

When("I open the dimension switcher", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.dimensionSwitcherToggle().click();
});

When(
    "I select {string} in the {string} dimension",
    async ({page}, optionLabel: string, dimensionLabel: string) => {
        const backend = new NeosBackendPage(page);
        await backend.dimensionSelectorHeader(dimensionLabel).click();
        await backend.dimensionSelectorOption(optionLabel).click();
    },
);

When("I apply the dimension change", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.dimensionSwitcherApplyButton().click();
});

When("I create an empty variant for the dimension change", async ({page}) => {
    const backend = new NeosBackendPage(page);
    await backend.nodeVariantCreationDialogCreateEmptyButton().click();
});

Then(
    "the {string} dimension should be set to {string}",
    async ({page}, dimensionLabel: string, optionLabel: string) => {
        const backend = new NeosBackendPage(page);
        await expect(backend.dimensionSelectorHeader(dimensionLabel)).toContainText(optionLabel);
    },
);
