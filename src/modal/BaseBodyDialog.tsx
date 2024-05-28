import React from "react";
import {hostDialog} from "./storegeDialog";

export abstract class BaseBodyDialog extends React.Component<any, any> {
    public _id?: string

    public selfCloseCore:((modeId?:string)=>void)|undefined
    public constructor(props: any) {
        super(props);
        this._id = undefined
        this.selfCloseCore=undefined
        setTimeout(() => {
            if(hostDialog.currentDialog){
                hostDialog.currentDialog.innerValidate=this.validate.bind(this)
                hostDialog.currentDialog.innerGetData=this.getData.bind(this)
                this.selfCloseCore=hostDialog.currentDialog.selfClose
            }


        }, 1);

    }


    selfClose(modeId?:string) {
      if(this.selfCloseCore){
          this.selfCloseCore(modeId)
      }
    }

    abstract validate(mode: string | undefined): boolean | undefined

    abstract getData(mode: string | undefined): object | undefined
}