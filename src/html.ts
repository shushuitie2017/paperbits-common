/**
 * Returns closest element that satisfies the predicate, going from child to parent.
 * @param node {Node} Node from which the search starts.
 * @param predicate {(node: Node) => boolean} Search predicate
 */
export function closest(node: Node, predicate: (node: Node) => boolean): Node {
    do {
        if (predicate(node)) {
            return node;
        }

        node = node.parentNode;
    }
    while (node);
}

export enum AriaAttributes {
    /**
     * Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed.
     */
    expanded = "aria-expanded",

    /**
     * Defines a string value that labels the current element.
     */
    label = "aria-label",

    /**
     * Identifies the element (or elements) whose contents or presence are controlled by the current element.
     */
    controls = "aria-controls",

    /**
     * Indicates whether the element is exposed to an accessibility API.
     */
    hidden = "aria-hidden",

    /**
     * Indicates the current “selected” state of various widgets. See related aria-checked and aria-pressed.
     */
    selected = "aria-selected",

    /**
     * Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element.
     */
    hasPopup = "aria-haspopup",
}

export enum Attributes {
    Href = "href",
    Target = "target",
    Download = "download",
    TabIndex = "tabindex",
    Role = "role",
    Rel = "rel"
}

export enum DataAttributes {
    Toggle = "data-toggle",
    TriggerEvent = "data-trigger-event",
    Target = "data-target",
    Dismiss = "data-dismiss"
}

export enum AriaRoles {
    Listbox = "listbox",
    Option = "option"
}

/**
 * Hyperlink relationship between a linked resource and the current page.
 */
export enum HyperlinkRels {
    /**
     * Instructs the browser not to set `window.opener` property when opening a new window.
     */
    NoOpener = "noopener",

    /**
     * Instructs the browser not to send `Referrer` HTTP header when opening navigating to linked page.
     */
    NoReferrer = "noreferrer",
    
    /**
     * Indicates that the linked resource is not endorsed by the author.
     */
    NoFollow = "nofollow"
}