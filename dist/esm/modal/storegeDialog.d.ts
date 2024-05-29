import { ModalDialog } from "./modalDialog";
declare class StorageDialog {
    currentDialog: ModalDialog | undefined;
    moduleId: string | undefined;
    constructor();
}
export declare const hostDialog: StorageDialog;
export {};
