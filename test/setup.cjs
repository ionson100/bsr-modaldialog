/**
 * Shared jsdom bootstrap for the tests.
 * Must be required before `react-dom`.
 */
const {JSDOM} = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    pretendToBeVisual: true,
    url: 'http://localhost/',
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.Event = dom.window.Event;
global.MouseEvent = dom.window.MouseEvent;
global.KeyboardEvent = dom.window.KeyboardEvent;
global.getComputedStyle = dom.window.getComputedStyle;
global.MutationObserver = dom.window.MutationObserver;
// React 19 "not wrapped in act(...)" noise is not interesting here
global.IS_REACT_ACT_ENVIRONMENT = false;

/** Waits until React flushed the pending work. */
async function tick(times = 6) {
    for (let i = 0; i < times; i++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
    }
}

function click(element) {
    element.dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true, cancelable: true}));
}

function pressEscape() {
    global.window.dispatchEvent(new dom.window.KeyboardEvent('keyup', {key: 'Escape', bubbles: true}));
}

function pressTab(shiftKey = false) {
    global.window.dispatchEvent(new dom.window.KeyboardEvent('keydown', {key: 'Tab', shiftKey, bubbles: true, cancelable: true}));
}

/** dialogs currently mounted in the document */
function roots() {
    return Array.from(document.querySelectorAll('[data-root-m-dialog]'));
}

function dialogs() {
    return Array.from(document.querySelectorAll('[role="dialog"]'));
}

module.exports = {dom, tick, click, pressEscape, pressTab, roots, dialogs};
