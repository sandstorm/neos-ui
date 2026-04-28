import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosBackendPage} from "../helpers/general-pages";

const {When, Then} = createBdd();

type SideBarSide = "left" | "right";

function assertSide(side: string): asserts side is SideBarSide {
    if (side !== "left" && side !== "right") {
        throw new Error(`Unsupported sidebar side "${side}" (expected "left" or "right")`);
    }
}

// ── When ──────────────────────────────────────────────────────────────────────

When("I toggle the {string} sidebar", async ({page}, side: string) => {
    assertSide(side);
    const backend = new NeosBackendPage(page);
    await backend.sideBarToggler(side).click();
});

// ── Then ──────────────────────────────────────────────────────────────────────

Then("the {string} sidebar should be visible", async ({page}, side: string) => {
    assertSide(side);
    const backend = new NeosBackendPage(page);
    await expect(backend.sideBar(side)).toHaveAttribute("aria-hidden", "false");
});

Then("the {string} sidebar should be hidden", async ({page}, side: string) => {
    assertSide(side);
    const backend = new NeosBackendPage(page);
    await expect(backend.sideBar(side)).toHaveAttribute("aria-hidden", "true");
});
