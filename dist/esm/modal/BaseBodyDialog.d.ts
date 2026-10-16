import React from "react";
export declare abstract class BaseBodyDialog<T = any> extends React.Component<T, any> {
    _id?: string;
    private selfCloseCore;
    private boundValidate;
    private boundGetData;
    private hostDialogRef;
    constructor(props: Readonly<T>);
    componentWillUnmount(): void;
    selfClose(mode?: string): void;
    abstract validate(mode: string | undefined): boolean | undefined;
    abstract getData(mode: string | undefined): any | undefined;
}
