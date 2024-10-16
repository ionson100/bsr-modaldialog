# bsr-modaldialog


[![NPM](https://img.shields.io/npm/v/bsr-modaldialog.svg)](https://www.npmjs.com/package/bsr-modaldialog) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save bsr-modaldialog
```

## Usage

```tsx
import React from "react";
import {ShowBsrDialog} from "bsr-modaldialog";
import 'bsr-modaldialog/dist/index.css'

export default function P4_1(){
    return (
        <div style={{display:"flex"}}>
            <button onClick={()=>{
                ShowBsrDialog({
                    header:"header",
                    body:"body",
                    buttons:[(<button data-mode={-1} data-focus={1}>close</button>)]
                }).then(a=>{
                    alert(JSON.stringify(a))
                })
            }}>Simple modal dialog</button>
        </div>
    )
}
```

## License

MIT © [ionson100](https://github.com/ionson100)

[Props, Function](https://ionson100.github.io/wwwroot/index.html#mode=bsrdialog&page=bsrdialog&state=true).

[Examples, Help pages](https://ionson100.github.io/wwwroot/index.html#mode=bsrdialog&page=4-1).
