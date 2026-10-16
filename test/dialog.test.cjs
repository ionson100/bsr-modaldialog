const test = require('node:test');
const assert = require('node:assert/strict');
const {tick, click, pressEscape, pressTab, roots, dialogs, dom} = require('./setup.cjs');
const React = require('react');
const {ShowBsrDialog, BaseBodyDialog, ModalDialog} = require('../dist/cjs/index.js');

const h = React.createElement;

/** closes everything left open, so tests do not influence each other */
async function cleanup() {
    for (let i = 0; i < 10 && dialogs().length > 0; i++) {
        const close = document.querySelector('.btn-close-modal');
        if (close) {
            click(close);
        } else {
            // the header (and with it the close button) is removed when the
            // dialog has neither header nor icon
            pressEscape();
        }
        await tick();
    }
}

test.afterEach(cleanup);
test.after(() => {
    // let the process exit: jsdom keeps timers otherwise
    dom.window.close();
});

test('exports are available', () => {
    assert.equal(typeof ShowBsrDialog, 'function');
    assert.equal(typeof BaseBodyDialog, 'function');
    assert.equal(typeof ModalDialog, 'function');
});

test('dialog is mounted into its own container and removed after close', async () => {
    const promise = ShowBsrDialog({
        header: 'h',
        body: h('div', null, 'body'),
        buttons: [h('button', {'data-mode': 2}, 'Ok')],
    });
    await tick();

    assert.equal(roots().length, 1);
    assert.equal(dialogs().length, 1);
    assert.equal(dialogs()[0].querySelector('.m-body').textContent, 'body');

    click(dialogs()[0].querySelector('button[data-mode="2"]'));
    const result = await promise;
    await tick();

    assert.deepEqual(result, {ok: true, mode: '2', dataBody: undefined});
    assert.equal(roots().length, 0, 'the container must be removed from the document');
});

test('mode -1 and -2 produce ok: false', async () => {
    const promise = ShowBsrDialog({
        body: h('div', null, 'x'),
        buttons: [h('button', {'data-mode': -1}, 'Cancel')],
    });
    await tick();
    click(dialogs()[0].querySelector('button[data-mode="-1"]'));

    const result = await promise;
    assert.equal(result.mode, '-1');
    assert.equal(result.ok, false);
});

test('Escape closes the dialog with mode -2', async () => {
    const promise = ShowBsrDialog({body: h('div', null, 'x')});
    await tick();

    pressEscape();
    const result = await promise;
    assert.equal(result.mode, '-2');
    assert.equal(result.ok, false);
});

test('onCancel prevents closing with Escape', async () => {
    let called = 0;
    let allowClose = false;
    const promise = ShowBsrDialog({
        body: h('div', null, 'x'),
        onCancel: () => {
            called++;
            return allowClose;
        },
    });
    await tick();

    pressEscape();
    await tick();
    assert.equal(called, 1);
    assert.equal(roots().length, 1, 'the dialog must stay open');

    // ... and the second Escape with a positive answer closes it
    allowClose = true;
    pressEscape();
    await tick();
    assert.equal(called, 2);
    assert.equal(roots().length, 0, 'the onCancel veto must not stick');
    assert.equal((await promise).mode, '-2');
});

test('overlay click closes only with closeModalDialogClickForeignArea', async () => {
    const promise = ShowBsrDialog({header: 'h', body: h('div', null, 'x')});
    await tick();

    const overlayWithoutFlag = document.querySelector('.ass-dialog');
    click(overlayWithoutFlag);
    await tick();
    assert.equal(roots().length, 1, 'click on the foreign area must be ignored by default');

    click(document.querySelector('.btn-close-modal'));
    assert.equal((await promise).mode, '-1');
    await tick();

    const promise2 = ShowBsrDialog({
        header: 'h',
        body: h('div', null, 'x'),
        closeModalDialogClickForeignArea: true,
    });
    await tick();
    click(document.querySelector('.ass-dialog'));
    const result = await promise2;
    assert.equal(result.mode, '-2');
    assert.equal(result.ok, false);
});

test('the close button closes with mode -1', async () => {
    const promise = ShowBsrDialog({header: 'h', body: h('div', null, 'x')});
    await tick();
    click(document.querySelector('.btn-close-modal'));
    assert.equal((await promise).mode, '-1');
});

test('timeOut closes the dialog with mode -1', async () => {
    const promise = ShowBsrDialog({body: h('div', null, 'x'), timeOut: 500});
    await tick();
    assert.equal(roots().length, 1);

    const result = await promise;
    assert.equal(result.mode, '-1');
    assert.equal(result.ok, false);
    await tick();
    assert.equal(roots().length, 0);
});

test('timeOut does not settle the dialog twice after a manual close', async () => {
    let onCloseCalls = 0;
    const promise = ShowBsrDialog({
        header: 'h',
        body: h('div', null, 'x'),
        timeOut: 500,
        onClose: () => {
            onCloseCalls++;
        },
    });
    await tick();
    click(document.querySelector('.btn-close-modal'));
    const result = await promise;
    assert.equal(result.mode, '-1');

    await new Promise((resolve) => setTimeout(resolve, 600));
    await tick();
    assert.equal(onCloseCalls, 1, 'onClose must fire exactly once');
    assert.equal(roots().length, 0);
});

test('onShow and onClose are called', async () => {
    const events = [];
    const promise = ShowBsrDialog({
        header: 'h',
        body: h('div', null, 'x'),
        onShow: () => events.push('show'),
        onClose: () => events.push('close'),
    });
    await tick();
    assert.deepEqual(events, ['show']);

    click(document.querySelector('.btn-close-modal'));
    await promise;
    assert.deepEqual(events, ['show', 'close']);
});

test('the focusable button is focused and the previous focus is restored', async () => {
    const opener = document.createElement('input');
    document.body.appendChild(opener);
    opener.focus();
    assert.equal(document.activeElement, opener);

    const promise = ShowBsrDialog({
        body: h('div', null, 'x'),
        buttons: [
            h('button', {'data-mode': 2}, 'Ok'),
            h('button', {'data-mode': -1, 'data-focus': true}, 'Cancel'),
        ],
    });
    await tick();
    assert.equal(document.activeElement.getAttribute('data-mode'), '-1', 'the data-focus button gets the focus');

    click(document.querySelector('button[data-mode="-1"]'));
    await promise;
    await tick();
    assert.equal(document.activeElement, opener, 'the focus must be restored');

    opener.remove();
});

test('Tab keeps the focus inside the dialog, also for dynamically added buttons', async () => {
    function Body() {
        const [shown, setShown] = React.useState(false);
        return h('div', null,
            h('button', {id: 'show-more', onClick: () => setShown(true)}, 'more'),
            shown ? h('button', {id: 'late-button'}, 'late') : null,
        );
    }

    const promise = ShowBsrDialog({
        header: 'h',
        body: h(Body),
        buttons: [h('button', {'data-mode': -1}, 'Cancel')],
    });
    await tick();

    click(document.getElementById('show-more'));
    await tick();
    const late = document.getElementById('late-button');
    assert.ok(late, 'the dynamically rendered button must be in the dom');

    // the last focusable element is the footer button - Tab must wrap to the first one
    const cancel = document.querySelector('button[data-mode="-1"]');
    cancel.focus();
    pressTab();
    assert.equal(document.activeElement, document.querySelector('.btn-close-modal'));
    assert.ok(dialogs()[0].contains(late), 'the dynamically added button must still be inside the dialog');

    // focus outside of the dialog and press shift+Tab: the focus must be pulled back in
    document.body.focus();
    pressTab(true);
    assert.ok(dialogs()[0].contains(document.activeElement), 'shift+tab must not leave the dialog');

    click(cancel);
    await promise;
});

test('body components may use hooks (no duplicated React in the bundle)', async () => {
    const errors = [];
    const originalError = console.error;
    console.error = (...args) => errors.push(args.map(String).join(' '));
    try {
        function HookBody() {
            const [count, setCount] = React.useState(0);
            return h('button', {id: 'counter', onClick: () => setCount(count + 1)}, 'count:' + count);
        }

        const promise = ShowBsrDialog({header: 'h', body: h(HookBody)});
        await tick();

        const counter = document.getElementById('counter');
        assert.ok(counter, 'the hook body must be rendered');
        click(counter);
        await tick();
        assert.equal(document.getElementById('counter').textContent, 'count:1');

        click(document.querySelector('.btn-close-modal'));
        await promise;
    } finally {
        console.error = originalError;
    }
    assert.deepEqual(errors.filter((e) => e.includes('Invalid hook call')), []);
});

test('getData result is returned as dataBody', async () => {
    class Body extends BaseBodyDialog {
        validate() {
            return true;
        }

        getData(mode) {
            return {from: 'body', mode};
        }

        render() {
            return h('div', null, 'body');
        }
    }

    const promise = ShowBsrDialog({
        body: h(Body),
        buttons: [h('button', {'data-mode': 5}, 'Save')],
    });
    await tick();
    click(document.querySelector('button[data-mode="5"]'));

    const result = await promise;
    assert.equal(result.mode, '5');
    assert.equal(result.ok, true);
    assert.deepEqual(result.dataBody, {from: 'body', mode: '5'});
});

test('validate() returning false keeps the dialog open', async () => {
    class Body extends BaseBodyDialog {
        validate(mode) {
            return mode !== '2';
        }

        getData() {
            return undefined;
        }

        render() {
            return h('div', null, 'body');
        }
    }

    const promise = ShowBsrDialog({
        body: h(Body),
        buttons: [
            h('button', {'data-mode': 2}, 'vetoed'),
            h('button', {'data-mode': 1}, 'ok'),
        ],
    });
    await tick();

    click(dialogButton(2));
    await tick();
    assert.equal(roots().length, 1, 'the vetoed button must not close the dialog');

    click(dialogButton(1));
    const result = await promise;
    assert.equal(result.mode, '1');
    assert.equal(result.ok, true);
});

function dialogButton(mode) {
    return document.querySelector(`button[data-mode="${mode}"]`);
}

test('selfClose() from the body closes the dialog', async () => {
    class Body extends BaseBodyDialog {
        validate() {
            return true;
        }

        getData() {
            return undefined;
        }

        render() {
            return h('button', {id: 'self-close', onClick: () => this.selfClose('200')}, 'close me');
        }
    }

    const promise = ShowBsrDialog({body: h(Body)});
    await tick();
    assert.ok(document.getElementById('self-close'), 'selfCloseCore must be wired');

    click(document.getElementById('self-close'));
    const result = await promise;
    assert.equal(result.mode, '200');
    assert.equal(result.ok, true);
});

test('a nested dialog works and the outer one stays the current dialog afterwards', async () => {
    class Body extends BaseBodyDialog {
        validate(mode) {
            if (mode === '2') {
                const nested = ShowBsrDialog({
                    body: h('div', null, 'nested'),
                    buttons: [h('button', {'data-mode': -1}, 'Close nested')],
                });
                nested.then((result) => {
                    this.setState({nestedResult: result.mode});
                });
                return false;
            }
            return true;
        }

        getData() {
            return {nested: this.state && this.state.nestedResult};
        }

        render() {
            return h('div', null, 'outer');
        }
    }

    const outer = ShowBsrDialog({
        body: h(Body),
        buttons: [
            h('button', {'data-mode': 2}, 'Open nested'),
            h('button', {'data-mode': -1}, 'Cancel'),
        ],
    });
    await tick();

    click(dialogButton(2));
    await tick();
    assert.equal(roots().length, 2, 'both dialogs must be mounted');
    assert.equal(document.querySelectorAll('[role="dialog"]')[1].textContent.includes('nested'), true);

    // Escape must be handled by the nested (topmost) dialog only
    pressEscape();
    await tick();
    assert.equal(roots().length, 1, 'only the nested dialog is closed by Escape');

    click(dialogButton(-1));
    const result = await outer;
    assert.equal(result.mode, '-1');
    assert.deepEqual(result.dataBody, {nested: '-2'});
});

test('an error in the dialog content rejects the promise instead of hanging', async () => {
    function Broken() {
        throw new Error('boom');
    }

    const originalError = console.error;
    console.error = () => {
    };
    let rejection = null;
    try {
        const promise = ShowBsrDialog({body: h(Broken)});
        await promise.catch((error) => {
            rejection = error;
        });
        await tick();
    } finally {
        console.error = originalError;
    }

    assert.ok(rejection instanceof Error, 'the promise must be rejected with an Error');
    assert.equal(rejection.message, 'boom');
    assert.equal(roots().length, 0, 'the dialog must not stay in the document');
});
