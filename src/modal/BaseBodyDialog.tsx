import React from "react";
import {hostDialog} from "./storegeDialog";

export abstract class BaseBodyDialog extends React.Component<any, any> {
    public _id?: string

    private selfCloseCore:((modeId?:string)=>void)|undefined
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


    selfClose(mode?:string) {
      if(this.selfCloseCore){
          this.selfCloseCore(mode)
      }
    }

    abstract validate(mode: string | undefined): boolean | undefined

    abstract getData(mode: string | undefined): object | undefined
}