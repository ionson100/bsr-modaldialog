import React, { ReactElement } from 'react';

type ResolvePromise = {
    ok: boolean;
    mode: string | null | undefined;
    dataBody?: any | undefined;
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
     * @param dialog HTMLDivElement
     */
    onCancel?: (dialog: InstanceType<typeof HTMLDivElement> | undefined) => boolean;
    /***
     * Event when closing a dialog
     * @param dialog  HTMLDivElement
     */
    onClose?: (dialog: InstanceType<typeof HTMLDivElement> | undefined) => void;
    /**
     * Event when opening a dialog
     * @param dialog  HTMLDivElement
     */
    onShow?: (dialog: InstanceType<typeof HTMLDivElement> | undefined) => void;
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
    __actionUnmount?: () => void;
    classNameAssDialog?: string;
    className?: string;
    classNameHeader?: string;
    classNameBody?: string;
    classNameFooter?: string;
    ariaLabel?: string;
    ariaLabelledby?: string;
};
declare class ModalDialog extends React.Component<ParamsDialog, any> {
    static defaultProps: ParamsDialog;
    body: any | undefined;
    promiseInfo: object;
    mRefDialog: React.RefObject<HTMLDivElement>;
    private focusable;
    formClose: HTMLFormElement | undefined;
    mRefButtonHost: React.RefObject<HTMLDivElement>;
    mRefHeaderHost: React.RefObject<HTMLDivElement>;
    mRefBodyHost: React.RefObject<HTMLDivElement>;
    mRefFocusDiv: React.RefObject<HTMLDivElement>;
    mRefAssDiv: React.RefObject<HTMLDivElement>;
    oldDialog: ModalDialog | undefined;
    moduleIdCore: string;
    innerValidate: ((mode: string | undefined) => boolean | undefined) | undefined;
    innerGetData: ((mode: string | undefined) => object | undefined) | undefined;
    lastFocus: Element | null;
    selfClose: (mode: string | undefined) => void;
    constructor({ props }: {
        props: Readonly<ParamsDialog>;
    });
    __innerCloseDom(mode: string | null | undefined): void;
    closeDialog(mode: string | undefined | null): void;
    checkGlobal(): void;
    private FocusTab;
    componentDidMount(): void;
    get dialog(): HTMLDivElement | null | undefined;
    componentWillUnmount(): void;
    closeModal: () => void;
    clickButton(mode: string | null | undefined): void;
    renderButtons(): any;
    render(): React.JSX.Element;
    private ClickDialog;
    private KeuUpEsc;
}

declare function ShowBsrDialog(props: ParamsDialog): Promise<ResolvePromise>;

declare abstract class BaseBodyDialog<T = any> extends React.Component<T, any> {
    _id?: string;
    private selfCloseCore;
    protected constructor(props: Readonly<T>);
    selfClose(mode?: string): void;
    abstract validate(mode: string | undefined): boolean | undefined;
    abstract getData(mode: string | undefined): any | undefined;
}

export { BaseBodyDialog, ModalDialog, type ParamsDialog, ShowBsrDialog };
