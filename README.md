# bsr-modaldialog


[![NPM](https://img.shields.io/npm/v/bsr-modaldialog.svg)](https://www.npmjs.com/package/bsr-modaldialog)

React async dialog: `ShowBsrDialog(props)` mounts a modal dialog into `document.body`
and returns a promise that is resolved when the dialog is closed.

## Install

```bash
npm install --save bsr-modaldialog
```

`react` and `react-dom` are peer dependencies (`^18.3.0 || ^19.0.0`).
React is **not** bundled into the package - the dialog renders with the React
instance of your application, so hooks work in the dialog content.

### Install from GitHub

```bash
npm install --save github:ionson100/bsr-modaldialog#v3.1.0
```

The repository contains the already built `dist`, so the package can be consumed
without npm and without a build step on your side.

## Usage

```tsx
import React from "react";
import {ShowBsrDialog} from "bsr-modaldialog";
import 'bsr-modaldialog/dist/index.css'

export default function P4_1() {
    return (
        <div style={{display: "flex"}}>
            <button onClick={() => {
                ShowBsrDialog({
                    header: "header",
                    body: "body",
                    buttons: [<button data-mode={-1} data-focus={1}>close</button>]
                }).then(a => {
                    alert(JSON.stringify(a))
                })
            }}>Simple modal dialog</button>
        </div>
    )
}
```

The promise result is `{ok, mode, dataBody}`:

- `mode` - the `data-mode` value of the clicked button (`string`), `'-1'` for the
  close button / `timeOut`, `'-2'` for Escape or a click on the foreign area;
- `ok` - `false` for `'-1'` and `'-2'`;
- `dataBody` - the value returned by `getData()` of the dialog body (see below).

## Dialog body as a class

Extend `BaseBodyDialog` to take part in the closing process:

```tsx
import React from "react";
import {BaseBodyDialog, ShowBsrDialog} from "bsr-modaldialog";

class DialogConfirm extends BaseBodyDialog {
    /** returning anything but `true` keeps the dialog open */
    validate(mode: string | undefined): boolean | undefined {
        return mode !== '2';
    }

    /** the result is delivered as `dataBody` of the promise */
    getData(mode: string | undefined) {
        return {mode};
    }

    render() {
        return <div>{this.props.text}</div>;
    }
}

ShowBsrDialog({
    header: 'Confirm',
    body: <DialogConfirm text={'Delete?'}/>,
    buttons: [
        <button data-mode={2}>Ok</button>,
        <button data-mode={-1} data-focus={true}>Cancel</button>,
    ],
});
```

`this.selfClose(mode)` inside the body closes the dialog programmatically.

Dialog content may use function components with hooks.

## Props

| prop | type | description |
| --- | --- | --- |
| `header` / `icon` / `body` / `buttons` | `any` / `any` / `any` / `ReactElement[]` | content |
| `buttons` | `ReactElement[]` | buttons closed by `data-mode`; the first one with `data-focus` gets the focus |
| `style`, `styleHeader`, `styleBody`, `styleFooter` | `CSSProperties` | inline styles |
| `className`, `classNameHeader`, `classNameBody`, `classNameFooter`, `classNameAssDialog` | `string` | css classes |
| `position` | `'center' \| 'top'` | dialog position |
| `modal` | `boolean` | `true` (default) - modal with overlay |
| `closeModalDialogClickForeignArea` | `boolean` | close on a click on the overlay |
| `onShow` / `onClose` | `(dialog) => void` | open / close events |
| `onCancel` | `(dialog) => boolean` | called before closing with Escape, `false` cancels |
| `timeOut` | `number` | close automatically after N ms (`mode: '-1'`) |
| `refDialog` | `RefObject<ModalDialog>` | access to the dialog instance |

## Development

```bash
npm run build   # tsc (d.ts) + rollup (cjs/esm) + css copy
npm run lint
npm test        # builds and runs the jsdom based tests
```

[Props, Function](https://ionson100.github.io/wwwroot/index.html#mode=bsrdialog&page=bsrdialog&state=true).

[Examples, Help pages](https://ionson100.github.io/wwwroot/index.html#mode=bsrdialog&page=4-1).

## License

MIT © [ionson100](https://github.com/ionson100)
