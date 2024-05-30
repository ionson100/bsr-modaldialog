import React from "react";
import {ModalDialog, ParamsDialog, ResolvePromise} from "./modalDialog";
import ReactDOM from "react-dom/client";
import {v4 as uuidv4} from 'uuid';

export class WrapperModal {

    async showModalDialog(props: ParamsDialog) {

        return new Promise<ResolvePromise>((resolve, reject) => {
            const uuid = uuidv4();
            const myDiv = document.createElement('div',)
            myDiv.setAttribute("id", uuid);
            myDiv.setAttribute("data-root-m-dialog", 'true');
            document.body.append(myDiv);
            props.__container = myDiv
            props._id = uuid;
            props._promise = {reject: reject, resolve: resolve}
            const root = ReactDOM.createRoot(myDiv);
            root.render(
                <ModalDialog ref={props.refDialog}  {...props} />
            );

        })
    }
}