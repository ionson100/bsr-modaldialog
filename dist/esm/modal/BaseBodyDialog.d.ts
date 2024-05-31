import React from "react";
export declare abstract class BaseBodyDialog extends React.Component<any, any> {
    _id?: string;
    private selfCloseCore;
    constructor(props: any);
    selfClose(mode?: string): void;
    abstract validate(mode: string | undefined): boolean | undefined;
    abstract getData(mode: string | undefined): object | undefined;
}
