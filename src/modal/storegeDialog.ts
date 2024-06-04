import {ModalDialog} from "./modalDialog";

class StorageDialog{
    public currentDialog:ModalDialog|undefined

    constructor() {
        this.currentDialog= undefined;

    }

}

export const hostDialog=new StorageDialog()