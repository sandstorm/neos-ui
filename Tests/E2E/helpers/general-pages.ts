import type {Page} from "@playwright/test";

export class NeosLoginPage {
    constructor(private readonly page: Page) {
    }

    async goto() {
        await this.page.goto("/neos/login");
    }

    async login(username: string, password: string) {
        await this.page.locator('input[type="text"]').fill(username);
        await this.page.locator('input[type="password"]').fill(password);
        await this.page.locator(".neos-login-btn:not(.neos-disabled):not(.neos-hidden)").click();
    }
}

export class NeosContentPage {
    public readonly URL_REGEX = /neos\/content/;

    constructor(private readonly page: Page) {
    }

    async goto() {
        await this.page.goto("/neos/content");
    }
}

type SideBarSide = "left" | "right";

export class NeosBackendPage {
    constructor(private readonly page: Page) {
    }

    /**
     * Locator for a sidebar's outermost rendered element (the one carrying aria-hidden).
     *  - left sidebar: <SideBar position="left"> renders a div whose CSS class contains "sideBar--left"
     *  - right sidebar: rendered with role="form"
     */
    sideBar(side: SideBarSide) {
        if (side === "left") {
            return this.page.locator('[class*="sideBar--left"][aria-hidden]');
        }
        return this.page.locator('[role="form"][aria-hidden]');
    }

    /**
     * Click target that toggles the sidebar visibility.
     *  - left: the IconButton (#neos-LeftSideBarToggler) inside the toggle header.
     *    When the sidebar is collapsed, only this IconButton stays visible; clicks
     *    bubble up to the header div which carries the onClick handler.
     *  - right: the toggle button (#neos-ToggleInspector) sits inside the sidebar itself.
     */
    sideBarToggler(side: SideBarSide) {
        if (side === "left") {
            return this.page.locator("#neos-LeftSideBarToggler");
        }
        return this.page.locator("#neos-ToggleInspector");
    }

    /**
     * Inspector property field by NodeType property name.
     * Renders as e.g. <input id="__neos__editor__property---title" />.
     */
    inspectorField(propertyName: string) {
        return this.page.locator(`#__neos__editor__property---${propertyName}`);
    }

    inspectorApplyButton() {
        return this.page.locator("#neos-Inspector-Apply");
    }

    refreshDocumentTreeButton() {
        return this.page.locator("#neos-PageTree-RefreshPageTree");
    }

    /**
     * Badge rendered inside the currently active inspector tab when validation errors are present.
     * The Badge component renders <div class="...badge..."> wrapping its label.
     */
    activeInspectorTabBadge() {
        return this.page.locator('[role="tab"][aria-selected="true"] [class*="badge"]');
    }

    /**
     * Tree node label by exact text. The tree__item__nodeHeader__itemLabel attribute is rendered
     * by the react-ui-components Tree component on the <a> wrapping the label.
     */
    treeNodeLabel(name: string) {
        return this.page
            .locator('a[data-neos-integrational-test="tree__item__nodeHeader__itemLabel"]')
            .getByText(name, {exact: true});
    }

    documentTreeSearchToggle() {
        return this.page.locator("#btn-ToggleDocumentTreeFilter");
    }

    documentTreeSearchWrapper() {
        return this.page.locator("#neos-NodeTreeSearchInput");
    }

    documentTreeSearchInput() {
        return this.page.locator('#neos-NodeTreeSearchInput input[type="search"]');
    }

    documentTreeSearchClearButton() {
        return this.page.locator("#neos-NodeTreeSearchInput-btn-reset");
    }

    documentTreeFilter() {
        return this.page.locator("#neos-NodeTreeFilter-SelectBox");
    }
}
