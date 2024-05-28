import {ModalDialog} from "./modalDialog";

class StorageDialog{
    public currentDialog:ModalDialog|undefined
    public moduleId:string|undefined
    constructor() {
        this.currentDialog= undefined;
        this.moduleId = undefined;
    }

}

export const hostDialog=new StorageDialog()