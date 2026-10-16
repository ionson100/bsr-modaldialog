import React from "react";
import {hostDialog} from "./storegeDialog";
import type {ModalDialog} from "./modalDialog";

export abstract class BaseBodyDialog<T= any> extends React.Component<T, any> {
    public _id?: string

    private selfCloseCore:((modeId?:string)=>void)|undefined
    private boundValidate:((mode: string | undefined) => boolean | undefined)|undefined
    private boundGetData:((mode: string | undefined) => any)|undefined
    private hostDialogRef:ModalDialog|undefined

    constructor(props: Readonly<T>) {
        super(props);
        this._id = undefined
        this.selfCloseCore=undefined
        this.boundValidate=undefined
        this.boundGetData=undefined
        this.hostDialogRef=undefined

        // The dialog renders its body synchronously right after the dialog
        // itself was constructed, so `hostDialog.currentDialog` is already the
        // dialog this body belongs to. Registering here (and not in
        // componentDidMount) is required: body components of the consumer
        // override componentDidMount without calling super().
        // The previous implementation did the same, but through setTimeout(1),
        // which could bind the body to a dialog opened later.
        const dialog = hostDialog.currentDialog;
        if (dialog) {
            const validate = (mode: string | undefined) => this.validate(mode);
            const getData = (mode: string | undefined) => this.getData(mode);
            this.boundValidate = validate
            this.boundGetData = getData
            this.hostDialogRef = dialog
            dialog.innerValidate = validate
            dialog.innerGetData = getData
            this.selfCloseCore = dialog.selfClose
        }
    }

    componentWillUnmount() {
        const dialog = this.hostDialogRef
        if (dialog) {
            if (dialog.innerValidate === this.boundValidate) {
                dialog.innerValidate = undefined
            }
            if (dialog.innerGetData === this.boundGetData) {
                dialog.innerGetData = undefined
            }
        }
        this.hostDialogRef = undefined
        this.selfCloseCore = undefined
    }


    selfClose(mode?:string) {
        if(this.selfCloseCore){
            this.selfCloseCore(mode)
        }
    }

    abstract validate(mode: string | undefined): boolean | undefined

    abstract getData(mode: string | undefined): any | undefined
}
