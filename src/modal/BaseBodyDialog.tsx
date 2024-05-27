import React from "react";

export abstract class BaseBodyDialog extends React.Component<any, any> {
    public _id?: string

    public selfCloseCore:((modeId?:string)=>void)|undefined
    public constructor(props: any) {
        super(props);
        this._id = undefined
        this.selfCloseCore=undefined

    }
    setId(value:string){
        this._id=value;
    }

    selfClose(modeId?:string) {
      if(this.selfCloseCore){
          this.selfCloseCore(modeId)
      }
    }

    abstract validate(modeId: string | null): boolean | undefined

    abstract getData(modeId: string | null): object | undefined
}