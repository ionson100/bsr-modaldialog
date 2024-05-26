import React from "react";

export abstract class BaseBodyDialog extends React.Component<any, any> {
    public _id?: string



    public constructor(props: any) {
        super(props);
        this._id = undefined





    }

    selfClose() {
        const host = document.getElementById(this._id!)
        alert(host)
        if (host) {

            document.body.removeChild<Node>(host);
        }
    }

    abstract validate(modeId: string | null): boolean | undefined

    abstract getData(modeId: string | null): object | undefined
}