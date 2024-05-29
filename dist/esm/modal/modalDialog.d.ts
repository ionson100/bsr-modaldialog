import React, { ReactElement } from "react";
import "./index.css";
export type ResolvePromise = {
    ok: boolean;
    mode: string | null | undefined;
    dataBody?: object | undefined;
};
export type ParamsDialog = {
    icon?: any;
    header?: any | undefined;
    body?: any | undefined;
    buttons?: ReactElement[];
    style?: React.CSSProperties | undefined;
    styleHeader?: React.CSSProperties | undefined;
    styleFooter?: React.CSSProperties | undefined;
    position?: 'center' | 'top';
    modal?: boolean;
    onCancel?: (dialog: InstanceType<typeof HTMLDialogElement> | undefined) => boolean;
    onClose?: (dialog: InstanceType<typeof HTMLDialogElement> | undefined) => void;
    onShow?: (dialog: InstanceType<typeof HTMLDialogElement> | undefined) => void;
    timeOut?: number;
    __container?: Node;
    id?: string | undefined;
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
export declare class ModalDialog extends React.Component<ParamsDialog, any> {
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
    checkGlobal(): void;
    componentDidMount(): void;
    get dialog(): HTMLDialogElement | null | undefined;
    componentWillUnmount(): void;
    closeModal: () => void;
    clickButton(e: React.MouseEvent<HTMLDivElement> | undefined, mode: string | null | undefined): void;
    renderButtons(): any;
    renderBody(): any;
    render(): React.JSX.Element;
}
