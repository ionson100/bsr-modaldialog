import React from "react";
export declare abstract class BaseBodyDialog<T = any> extends React.Component<T, any> {
    _id?: string;
    private selfCloseCore;
    protected constructor(props: Readonly<T>);
    selfClose(mode?: string): void;
    abstract validate(mode: string | undefined): boolean | undefined;
    abstract getData(mode: string | undefined): any | undefined;
}
