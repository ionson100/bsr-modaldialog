import React from "react";
import {ModalDialog, ParamsDialog, ResolvePromise} from "./modalDialog";
import ReactDOM from "react-dom/client";
import {createId} from "./createId";

export class WrapperModal {

    showModalDialog(props: ParamsDialog): Promise<ResolvePromise> {

        return new Promise<ResolvePromise>((resolve, reject) => {
            const id = createId();
            const myDiv = document.createElement('div')
            myDiv.setAttribute("id", id);
            myDiv.setAttribute("data-root-m-dialog", 'true');
            document.body.append(myDiv);

            const root = ReactDOM.createRoot(myDiv);
            let unmounted = false;

            // the object passed by the caller is not modified anymore
            const dialogProps: ParamsDialog = {
                ...props,
                __container: myDiv,
                _id: id,
                _promise: {reject: reject, resolve: resolve},
                __actionUnmount: () => {
                    if (unmounted) {
                        return;
                    }
                    unmounted = true;
                    root.unmount()
                }
            };

            root.render(
                <ModalDialog ref={props.refDialog} {...dialogProps} />
            );
        })
    }
}
