import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {JSDOM} = require('jsdom');

const dom = new JSDOM('<!doctype html><html><body></body></html>', {pretendToBeVisual: true, url: 'http://localhost/'});
global.window = dom.window;
global.document = dom.window.document;
// node >= 21 exposes a read only global navigator
Object.defineProperty(global, 'navigator', {value: dom.window.navigator, configurable: true});
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.getComputedStyle = dom.window.getComputedStyle;
global.MutationObserver = dom.window.MutationObserver;
global.IS_REACT_ACT_ENVIRONMENT = false;

test('the "import" entry is real esm, resolvable by node and by the consumer', async () => {
    // self reference through the exports map - exactly what a bundler / node esm does
    const mod = await import('bsr-modaldialog');

    assert.equal(typeof mod.ShowBsrDialog, 'function');
    assert.equal(typeof mod.BaseBodyDialog, 'function');
    assert.equal(typeof mod.ModalDialog, 'function');

    const React = (await import('react')).default;
    const promise = mod.ShowBsrDialog({header: 'h', body: React.createElement('div', null, 'esm body')});
    for (let i = 0; i < 6; i++) {
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    assert.equal(document.querySelector('.m-body').textContent, 'esm body');
    document.querySelector('.btn-close-modal').dispatchEvent(new dom.window.MouseEvent('click', {bubbles: true}));

    const result = await promise;
    assert.equal(result.mode, '-1');
    dom.window.close();
});
