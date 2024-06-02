import React, { ReactElement } from 'react';

type ResolvePromise = {
    ok: boolean;
    mode: string | null | undefined;
    dataBody?: object | undefined;
};
type ParamsDialog = {
    /**
     * Closing a modal dialog by clicking an empty area
     */
    closeModalDialogClickForeignArea?: boolean;
    /**
     * A reference to the modal dialog object.
     * Will be useful for closing the dialog programmatically
     */
    refDialog?: React.RefObject<InstanceType<typeof ModalDialog>> | null;
    /**
     * Dialogue head icon
     */
    icon?: any;
    /**
     * Dialogue title content
     */
    header?: any | undefined;
    /**
     * Dialogue body content
     */
    body?: any | undefined;
    /**
     * Array of dialog buttons
     */
    buttons?: ReactElement[];
    /**
     * Dialogue styles
     */
    style?: React.CSSProperties | undefined;
    /**
     * Dialog Title Styles
     */
    styleHeader?: React.CSSProperties | undefined;
    /**
     * Dialog Footer Styles
     */
    styleFooter?: React.CSSProperties | undefined;
    /**
     * Dialog Body Styles
     */
    styleBody?: React.CSSProperties | undefined;
    /**
     * Position of dialogue on screen
     */
    position?: 'center' | 'top';
    /**
     * Dialogue type, modal or non-modal
     */
    modal?: boolean;
    /**
     * The event occurs before the modal dialog is closed using the Esc button
     * @param dialog HTMLDialogElement
     */
    onCancel?: (dialog: InstanceType<typeof HTMLDialogElement> | undefined) => boolean;
    /***
     * Event when closing a dialog
     * @param dialog HTMLDialogElement
     */
    onClose?: (dialog: InstanceType<typeof HTMLDialogElement> | undefined) => void;
    /**
     * Event when opening a dialog
     * @param dialog HTMLDialogElement
     */
    onShow?: (dialog: InstanceType<typeof HTMLDialogElement> | undefined) => void;
    /**
     * Time in milliseconds until the dialog is automatically closed if the dialog is used as an alert
     */
    timeOut?: number;
    /**
     * for private use
     */
    __container?: Node;
    /**
     * for private use
     */
    _id?: string | undefined;
    /**
     * for private use
     */
    _promise?: {
        resolve: (value: ResolvePromise) => void;
        reject: (reason?: any) => void;
    };
    className?: string;
    classNameHeader?: string;
    classNameBody?: string;
    classNameFooter?: string;
    classNameTopStripe?: string;
    classNameBottomStripe?: string;
};
declare class ModalDialog extends React.Component<ParamsDialog, any> {
    static defaultProps: ParamsDialog;
    body: any | undefined;
    promiseInfo: object;
    mRefDialog: React.RefObject<HTMLDialogElement>;
    mRefButtonHost: React.RefObject<HTMLDivElement>;
    mRefHeaderHost: React.RefObject<HTMLDivElement>;
    mRefBodyHost: React.RefObject<HTMLDivElement>;
    mRefFocusDiv: React.RefObject<HTMLDivElement>;
    oldDialog: ModalDialog | undefined;
    moduleIdCore: string;
    innerValidate: ((mode: string | undefined) => boolean | undefined) | undefined;
    innerGetData: ((mode: string | undefined) => object | undefined) | undefined;
    selfClose: (mode: string | undefined) => void;
    constructor({ props }: {
        props: Readonly<ParamsDialog>;
    });
    __innerCloseDom(value: ResolvePromise | undefined): void;
    __innerCloseDomError(value: unknown): void;
    checkGlobal(): void;
    componentDidMount(): void;
    get dialog(): HTMLDialogElement | null | undefined;
    componentWillUnmount(): void;
    closeModal: () => void;
    clickButton(mode: string | null | undefined): void;
    renderButtons(): any;
    render(): React.JSX.Element;
    private clickDialog;
}

declare function ShowBsrDialog(props: ParamsDialog): Promise<ResolvePromise>;

declare abstract class BaseBodyDialog extends React.Component<any, any> {
    _id?: string;
    private selfCloseCore;
    constructor(props: any);
    selfClose(mode?: string): void;
    abstract validate(mode: string | undefined): boolean | undefined;
    abstract getData(mode: string | undefined): object | undefined;
}

export { BaseBodyDialog, ModalDialog, type ParamsDialog, ShowBsrDialog };
