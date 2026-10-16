/**
 * List of elements that can hold the focus inside a dialog.
 * Evaluated on every Tab press (see ModalDialog.FocusTab), so dynamically
 * rendered buttons/inputs are taken into account.
 */
export const FOCUSABLE_SELECTOR = 'area[href]:not([tabindex=\'-1\']),' +
    'iframe:not([tabindex=\'-1\']),' +
    '[tabindex]:not([tabindex=\'-1\']),' +
    '[contentEditable=true]:not([tabindex=\'-1\']),' +
    'a[href]:not([disabled]):not([tabindex=\'-1\']),' +
    'button:not([disabled]):not([tabindex=\'-1\']),' +
    'textarea:not([disabled]):not([tabindex=\'-1\']),' +
    'input:not([disabled]):not([tabindex=\'-1\']),' +
    'select:not([disabled]):not([tabindex=\'-1\'])';
