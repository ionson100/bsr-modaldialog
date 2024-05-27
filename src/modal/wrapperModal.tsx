import React from "react";
import {ModalDialog, ParamsDialog} from "./modalDialog";
import ReactDOM from "react-dom/client";
import {v4 as uuidv4} from 'uuid';

export class WrapperModal {

    async showModalDialog(props: ParamsDialog) {

        return new Promise((resolve, reject) => {
            const uuid = uuidv4();
            const myDiv = document.createElement('div',)
            myDiv.setAttribute("id", uuid);
            document.body.append(myDiv);
            props.container = myDiv
            props.id = uuid;
            props._promise = {reject: reject, resolve: resolve}
            const root = ReactDOM.createRoot(myDiv);
            root.render(
                <ModalDialog  {...props} />
            );

        })
    }
}