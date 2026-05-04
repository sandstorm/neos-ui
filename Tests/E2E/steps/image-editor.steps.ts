import {expect} from "@playwright/test";
import {createBdd} from "playwright-bdd";
import {NeosBackendPage} from "../helpers/general-pages";

const {Given, When, Then} = createBdd();

// Module-level capture state. Reset implicitly per scenario by being
// re-assigned in the Given steps; we rely on each scenario invoking the
// "capture" steps before the corresponding assertion step.
let initialContentImageSrc = "";
let initialPreviewTop = "";

Given(
    "I capture the initial src of the rendered {string} content image",
    async ({page}, className: string) => {
        const backend = new NeosBackendPage(page);
        const src = await backend.contentFrameImage(className).getAttribute("src");
        if (src === null) throw new Error(`No src attribute on .${className}`);
        initialContentImageSrc = src;
    },
);

Given(
    "I capture the initial top offset of the inspector {string} preview thumbnail",
    async ({page}, propertyId: string) => {
        const backend = new NeosBackendPage(page);
        initialPreviewTop = await backend
            .inspectorImagePreviewThumbnail(propertyId)
            .evaluate((el: HTMLElement) => el.style.top);
    },
);

When(
    "I open the crop tool in the {string} inspector editor",
    async ({page}, propertyId: string) => {
        const backend = new NeosBackendPage(page);
        await backend.inspectorImageCropButton(propertyId).click();
    },
);

// Drag the ReactCrop area by `dx,dy` pixels, starting at `ox,oy` relative to
// the element's top-left. The intermediate `mouse.move(..., {steps: N})` is
// what makes ReactCrop register the drag — a teleporting cursor without
// intermediate move events is sometimes ignored by the library.
When(
    "I drag the crop area by {int},{int} from offset {int},{int}",
    async ({page}, dx: number, dy: number, ox: number, oy: number) => {
        const backend = new NeosBackendPage(page);
        const box = await backend.reactCropArea().boundingBox();
        if (!box) throw new Error("ReactCrop area has no bounding box");
        await page.mouse.move(box.x + ox, box.y + oy);
        await page.mouse.down();
        await page.mouse.move(box.x + ox + dx, box.y + oy + dy, {steps: 10});
        await page.mouse.up();
    },
);

Then(
    "no unapplied-changes dialog should appear when I click on the secondary inspector",
    async ({page}) => {
        const backend = new NeosBackendPage(page);
        // Click a known-empty area of the secondary inspector wrapper. Anywhere
        // on the wrapper that isn't itself an interactive control will do; we
        // pick the top-left corner of the panel.
        await backend.secondaryInspector().click({position: {x: 1, y: 1}});
        await expect(page.locator("#neos-UnappliedChangesDialog")).toHaveCount(0);
    },
);

Then(
    "the inspector {string} preview top offset should differ from the initial offset",
    async ({page}, propertyId: string) => {
        const backend = new NeosBackendPage(page);
        await expect(async () => {
            const current = await backend
                .inspectorImagePreviewThumbnail(propertyId)
                .evaluate((el: HTMLElement) => el.style.top);
            expect(current).not.toBe(initialPreviewTop);
        }).toPass();
    },
);

Then(
    "the rendered {string} content image src should differ from the initial src",
    async ({page}, className: string) => {
        const backend = new NeosBackendPage(page);
        await expect(async () => {
            const current = await backend.contentFrameImage(className).getAttribute("src");
            expect(current).not.toBe(initialContentImageSrc);
        }).toPass();
    },
);
