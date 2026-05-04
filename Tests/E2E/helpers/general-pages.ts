import type {Page} from "@playwright/test";
import {contentFrame} from "./content-iframe";

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

    inspectorDiscardButton() {
        return this.page.locator("#neos-Inspector-Discard");
    }

    /** "Sync from title" button next to the URI path segment property. */
    uriPathSegmentSyncButton() {
        return this.page.locator("#neos-UriPathSegmentEditor-sync");
    }

    /**
     * The unapplied-changes overlay. When the inspector has dirty fields and
     * is not currently prompting, the Inspector container portals a div with
     * `unappliedChangesOverlay` class to `document.body`. Clicking it opens
     * the UnappliedChangesDialog.
     */
    unappliedChangesOverlay() {
        return this.page.locator('[class*="unappliedChangesOverlay"]');
    }

    unappliedChangesDialog() {
        return this.page.locator("#neos-UnappliedChangesDialog");
    }

    unappliedChangesResumeButton() {
        return this.page.locator("#neos-UnappliedChangesDialog-resume");
    }

    unappliedChangesDiscardButton() {
        return this.page.locator("#neos-UnappliedChangesDialog-discard");
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

    /**
     * The OUTER container <div role="treeitem"> for a tree node, identified by the unique
     * label inside it. The inner label <a> also carries role="treeitem"; we restrict to <div>
     * so we get the parent container that holds both the header and any nested children.
     *
     * See packages/react-ui-components/src/Tree/node.js — the outer <div role="treeitem">
     * wraps the header (with the label <a>) and the nested children container.
     */
    treeNodeContainer(name: string) {
        return this.treeNodeLabel(name).locator(
            'xpath=ancestor::div[@role="treeitem"][1]',
        );
    }

    pageTreeCutSelectedNodeButton() {
        return this.page.locator("#neos-PageTree-CutSelectedNode");
    }

    pageTreePasteClipboardNodeButton() {
        return this.page.locator("#neos-PageTree-PasteClipBoardNode");
    }

    pageTreeDeleteSelectedNodeButton() {
        return this.page.locator("#neos-PageTree-DeleteSelectedNode");
    }

    contentTreeCopySelectedNodeButton() {
        return this.page.locator("#neos-ContentTree-CopySelectedNode");
    }

    contentTreePasteClipboardNodeButton() {
        return this.page.locator("#neos-ContentTree-PasteClipBoardNode");
    }

    contentTreeDeleteSelectedNodeButton() {
        return this.page.locator("#neos-ContentTree-DeleteSelectedNode");
    }

    /** Delete-node confirmation modal — id="neos-DeleteNodeModal-Confirm". */
    deleteNodeModalConfirmButton() {
        return this.page.locator("#neos-DeleteNodeModal-Confirm");
    }

    // ── PublishDropDown ───────────────────────────────────────────────────────
    //
    // The DropDown.Header from react-ui-components renders a `<div role="button"
    // aria-haspopup="true">` rather than an HTML <button>. We anchor on those
    // attributes inside the #neos-PublishDropDown wrapper.

    publishDropDownToggle() {
        return this.page.locator(
            '#neos-PublishDropDown [role="button"][aria-haspopup="true"]',
        );
    }

    publishDropDownPublishButton() {
        return this.page.locator("#neos-PublishDropDown-Publish");
    }

    publishDropDownDiscardAllButton() {
        return this.page.locator("#neos-PublishDropDown-DiscardAll");
    }

    discardDialogConfirmButton() {
        return this.page.locator("#neos-DiscardDialog-Confirm");
    }

    discardDialogAcknowledgeButton() {
        return this.page.locator("#neos-DiscardDialog-Acknowledge");
    }

    /**
     * Insert-mode buttons in the InsertModeSelector dialog (after paste / drop).
     * The dialog is committed via #neos-InsertModeModal-apply.
     */
    insertModeIntoButton() {
        return this.page.locator("#into");
    }

    insertModeAfterButton() {
        return this.page.locator("#after");
    }

    insertModeBeforeButton() {
        return this.page.locator("#before");
    }

    insertModeApplyButton() {
        return this.page.locator("#neos-InsertModeModal-apply");
    }

    // ── Node creation flow ────────────────────────────────────────────────────

    pageTreeAddNodeButton() {
        return this.page.locator("#neos-PageTree-AddNode");
    }

    contentTreeToggleButton() {
        return this.page.locator("#neos-ContentTree-ToggleContentTree");
    }

    contentTreeAddNodeButton() {
        return this.page.locator("#neos-ContentTree-AddNode");
    }

    /** Inline UI's "Add new" button — rendered inside the content iframe by neos-ui-guest-frame. */
    inlineToolbarAddNodeButton() {
        return this.contentFrame().locator("#neos-InlineToolbar-AddNode");
    }

    /**
     * Pick a NodeType from the SelectNodeType dialog by visible label.
     * The dialog is identified by id "neos-SelectNodeTypeDialog"; node-type items render
     * a button containing the localized label text.
     */
    selectNodeTypeItem(label: string) {
        return this.page
            .locator("#neos-SelectNodeTypeDialog button")
            .filter({ hasText: new RegExp(`^${label}$`) })
            .first();
    }

    nodeCreationDialogTitleInput() {
        return this.page.locator("#neos-NodeCreationDialog-Body input").first();
    }

    nodeCreationDialogConfirmButton() {
        return this.page.locator("#neos-NodeCreationDialog-CreateNew");
    }

    nodeCreationDialogBackButton() {
        return this.page.locator("#neos-NodeCreationDialog-Back");
    }

    /** The "Insert mode" dialog has plain id="into" / id="before" / id="after" buttons. */
    insertModeIntoButtonInline() {
        return this.page.locator("button#into");
    }

    /** Returns a FrameLocator for the Neos content iframe (delegates to the helper). */
    contentFrame() {
        return contentFrame(this.page);
    }

    // ── Editor wrappers (anchor via the Label's htmlFor) ──────────────────────
    //
    // EditorEnvelope renders a Fragment with <Label htmlFor="__neos__editor__property---X">
    // followed by the editor component. The ID is forwarded via `id` prop, but only some
    // editors (TextInput) actually put it on the DOM — SelectBox and ImageEditor drop it.
    //
    // The wrapping div is added by the parent (NodeCreationDialog or InspectorEditorEnvelope).
    // We anchor on the stable Label[for=...] and walk up to that wrapping div, which gives
    // us a scope for finding buttons / select boxes belonging to that property.

    inspectorEditorWrapper(propertyId: string) {
        return this.page
            .locator(`label[for="__neos__editor__property---${propertyId}"]`)
            .locator("xpath=ancestor::div[1]");
    }

    creationDialogEditorWrapper(propertyId: string) {
        return this.page
            .locator(`label[for="__neos__editor__property---${propertyId}--creation-dialog"]`)
            .locator("xpath=ancestor::div[1]");
    }

    /** Tree node label by partial text (substring match). */
    treeNodeLabelContaining(name: string) {
        return this.page
            .locator('a[data-neos-integrational-test="tree__item__nodeHeader__itemLabel"]')
            .filter({hasText: name});
    }

    // ── Main menu drawer ──────────────────────────────────────────────────────

    /** Toggle for the main drawer (PrimaryToolbar). */
    menuToggle() {
        return this.page.locator("#neos-MenuToggler");
    }

    /**
     * Switch-site link inside the main drawer. Each site renders an anchor with
     * a relative href like "/neos/switch/to/neos.test.twodimensions"; we anchor
     * on that path prefix plus the hostname's leading label so the locator does
     * not accidentally match other anchors that happen to contain the hostname
     * (e.g. the "Show preview" link).
     */
    drawerSiteLink(hostname: string) {
        const slug = hostname.split(".")[0];
        return this.page.locator(`a[href^="/neos/switch/to/"][href*="${slug}"]`);
    }

    // ── DimensionSwitcher (multi-dimension toolbar dropdown) ──────────────────

    /**
     * Toolbar toggle that opens the multi-dimension switcher dropdown. The
     * DropDown.Header renders one SelectedPreset span per active dimension —
     * we anchor on the role/aria pair plus that distinctive child class so we
     * don't collide with the PublishDropDown or other toolbar dropdowns.
     */
    dimensionSwitcherToggle() {
        return this.page
            .locator('[role="button"][aria-haspopup="true"]')
            .filter({has: this.page.locator('[class*="selectPreset"]')});
    }

    /**
     * Wrapper <li class="dimensionCategory"> for one dimension inside the open
     * switcher dropdown. We scope by an exact match on the dimension's label
     * (e.g. "Language", "Country") so the language and country sections are
     * unambiguously distinguishable.
     */
    dimensionCategory(dimensionLabel: string) {
        return this.page
            .locator('[class*="dimensionCategory"]')
            .filter({has: this.page.getByText(dimensionLabel, {exact: true})});
    }

    /** Header (click target) of one dimension's SelectBox. */
    dimensionSelectorHeader(dimensionLabel: string) {
        return this.dimensionCategory(dimensionLabel)
            .locator('[role="button"][aria-haspopup="true"]');
    }

    /**
     * The toolbar dimension SelectBox on a single-dimension site. The
     * DimensionSwitcher renders this case directly (no outer DropDown.Stateless
     * wrapper, no `dimensionCategory` listitem) — just the SelectBox inside a
     * `singleDimensionDropdown` div. Selecting an option here commits
     * immediately; there is no Apply button.
     */
    singleDimensionSwitcherHeader() {
        return this.page.locator(
            '[class*="singleDimensionDropdown"] [role="button"][aria-haspopup="true"]',
        );
    }

    /**
     * Option inside the currently-open dimension SelectBox, matched by exact
     * label. SelectBox's DropDown.Contents uses scrollable={true} which
     * portals the <ul role="listbox"> to document.body, so we cannot scope
     * the option lookup to the dimensionCategory; we anchor on the portaled
     * listbox instead. Only one dimension SelectBox is expected to be open
     * at a time.
     */
    dimensionSelectorOption(optionLabel: string) {
        return this.page
            .locator('body > [role="listbox"][aria-label="dropdown"]')
            .getByText(optionLabel, {exact: true});
    }

    /** Apply button in the dimension switcher — commits transient presets. */
    dimensionSwitcherApplyButton() {
        return this.page.locator("#neos-DimensionSwitcher-Apply");
    }

    /** "Create Empty" button on the NodeVariantCreationDialog. */
    nodeVariantCreationDialogCreateEmptyButton() {
        return this.page.locator("#neos-NodeVariantCreationDialog-CreateEmpty");
    }

    // ── SelectBox positioning ────────────────────────────────────────────────
    //
    // SelectBox renders the open option list via ReactDOM.createPortal to
    // document.body (DropDown.Contents with scrollable={true}). The portal <ul>
    // receives inline styles computed in `getCalculatedStyleFromProps` —
    // `top` when the dropdown opens below, `bottom` when it opens above, and
    // `display: none` when the SelectBox header is scrolled out of the
    // user's view.
    //
    // We assert against those inline styles (what the implementation
    // *decides*) rather than computed pixel positions (what the layout
    // *resolves to*). That keeps the tests independent of viewport, scroll
    // offset, and CSS-module class renames.

    /** Header (clickable trigger) of the SelectBox inside the open NodeCreationDialog, by property id. */
    creationDialogSelectBoxHeader(propertyId: string) {
        return this.creationDialogEditorWrapper(propertyId)
            .locator('[role="button"][aria-haspopup="true"]');
    }

    /** Header of the SelectBox inside the inspector, by property id. */
    inspectorSelectBoxHeader(propertyId: string) {
        return this.inspectorEditorWrapper(propertyId)
            .locator('[role="button"][aria-haspopup="true"]');
    }

    /** Label DOM element for a creation-dialog property — usable as a hover target to scroll the dialog. */
    creationDialogPropertyLabel(propertyId: string) {
        return this.page.locator(
            `label[for="__neos__editor__property---${propertyId}--creation-dialog"]`,
        );
    }

    /** Label DOM element for an inspector property — usable as a hover target to scroll the inspector. */
    inspectorPropertyLabel(propertyId: string) {
        return this.page.locator(
            `label[for="__neos__editor__property---${propertyId}"]`,
        );
    }

    /**
     * The portaled SelectBox option list (a direct child of <body> per
     * DropDown.Contents with scrollable={true}). Returns inline styles that
     * the positioning logic sets — callers assert which property is present.
     */
    async openSelectBoxInlineStyle(): Promise<{top: string; bottom: string; display: string}> {
        return this.page
            .locator('body > [role="listbox"][aria-label="dropdown"]')
            .evaluate((el: HTMLElement) => ({
                top: el.style.top,
                bottom: el.style.bottom,
                display: el.style.display,
            }));
    }

    // ── Image editor (inspector image property + secondary-inspector cropper) ──

    /**
     * The crop IconButton inside an image inspector editor — class
     * `cropButton` is set on the IconButton in
     * `Editors/Image/Components/Controls/index.js`.
     */
    inspectorImageCropButton(propertyId: string) {
        return this.inspectorEditorWrapper(propertyId).locator('[class*="cropButton"]');
    }

    /**
     * The small preview <img> in the property editor's PreviewScreen (class
     * `cropArea__image`). Its inline `top` style is recomputed from the
     * configured crop area, so we use it as the change indicator.
     */
    inspectorImagePreviewThumbnail(propertyId: string) {
        return this.inspectorEditorWrapper(propertyId).locator('img[class*="cropArea__image"]');
    }

    /** ReactCrop's outer drag area — the rectangle the user drags to define a crop. */
    reactCropArea() {
        return this.page.locator('.ReactCrop');
    }

    /** SecondaryInspector wrapper portal (class `secondaryInspector` in CSS-module form). */
    secondaryInspector() {
        return this.page.locator('[class*="secondaryInspector"]');
    }

    /** Visible content image in the rendered iframe — anchored on a class set in test fixture's Page.fusion. */
    contentFrameImage(className: string) {
        return contentFrame(this.page).locator(`.${className}`);
    }

    // ── Inspector RichTextEditor (CKEditor in secondary inspector) ────────────

    /**
     * The "Toggle the editor" Button rendered by the inspector CKEditor
     * component (Neos.Neos/Inspector/Editors/RichTextEditor maps to CKEditor).
     * Clicking opens the secondary inspector with a full CKEditor instance.
     *
     * The CKEditor inspector editor sets `hasOwnLabel: true`, so EditorEnvelope
     * renders no `label[for="__neos__editor__property---<id>"]` we can scope by;
     * the editor's outer div carries no unique identifier either. We anchor on
     * the property's configured label text, which the editor renders verbatim
     * inside the toggle button via `<I18n id={label}/>` (no translation needed
     * for unknown keys — they fall back to the literal).
     */
    inspectorRteToggleButton(label: string) {
        return this.page.getByRole("button", {name: label});
    }

    /**
     * The CKEditor editable area rendered inside the secondary inspector's
     * CKEditorWrap. CKEditor decorates the host div with `.ck-content` /
     * `.ck-editor__editable` at runtime.
     */
    secondaryInspectorCkEditorEditable() {
        return this.secondaryInspector().locator(".ck-content");
    }
}
