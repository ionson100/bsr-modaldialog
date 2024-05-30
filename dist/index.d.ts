import React, { ReactElement } from 'react';

type ResolvePromise = {
    ok: boolean;
    mode: string | null | undefined;
    dataBody?: object | undefined;
};
type ParamsDialog = {
    icon?: any;
    header?: any | undefined;
    body?: any | undefined;
    buttons?: ReactElement[];
    style?: React.CSSProperties | undefined;
    styleHeader?: React.CSSProperties | undefined;
    styleFooter?: React.CSSProperties | undefined;
    styleBody?: React.CSSProperties | undefined;
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

declare function ShowBsrDialog(props: ParamsDialog): Promise<ResolvePromise>;

declare abstract class BaseBodyDialog extends React.Component<any, any> {
    _id?: string;
    private selfCloseCore;
    constructor(props: any);
    selfClose(modeId?: string): void;
    abstract validate(mode: string | undefined): boolean | undefined;
    abstract getData(mode: string | undefined): object | undefined;
}

export { BaseBodyDialog, type ParamsDialog, ShowBsrDialog };
