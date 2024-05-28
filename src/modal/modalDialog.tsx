import React, {ReactElement} from "react";

import "./index.css"
import {IoMdClose} from "react-icons/io";
import {hostDialog} from "./storegeDialog";
import {v4 as uuidv4} from 'uuid';
import {findHighestZIndex} from "./maxZIndex";

type ResolvePromise = {
    ok: boolean
    mode: string | null|undefined
    dataBody?: object | undefined
}

export type ParamsDialog = {
    icon?: any,
    header?: any | undefined,
    body?: any | undefined,
    buttons?: ReactElement[]
    style?: React.CSSProperties | undefined,
    styleHeader?: React.CSSProperties | undefined,
    styleFooter?: React.CSSProperties | undefined,
    position?: 'center'  | 'top',
    container?: Node,
    id?: string | undefined,
    _promise?: {
        resolve: (value: ResolvePromise) => void, reject: (reason?: any) => void
    },
    className?:string;

}


export class ModalDialog extends React.Component<ParamsDialog, any> {

    static defaultProps: ParamsDialog = {
        id: undefined,
        body: undefined, buttons: [], position: 'center',
        className:"main-dialog"

    }

    public body: any | undefined;
    public promiseInfo: object

    public mRefDialog: React.RefObject<HTMLDivElement>
    public mRefBlender: React.RefObject<HTMLDivElement>

    public mRefButtonHost: React.RefObject<HTMLDivElement>
    public mRefHeaderHost: React.RefObject<HTMLDivElement>
    public mRefBodyHost: React.RefObject<HTMLDivElement>
    public mRefFocusDiv:React.RefObject<HTMLDivElement>

    public host: HTMLElement | null
    public oldDialog: ModalDialog | undefined
    public moduleIdCore: string;
    public innerValidate: ((mode: string | undefined) => boolean | undefined) | undefined
    public innerGetData: ((mode: string | undefined) => object | undefined) | undefined
    public selfClose: (mode: string | undefined) => void = (mode) => {
        const host = document.getElementById(this.props.id!)
        if (host) {
            const modeCore = mode ? mode : "no data"
            this.props._promise?.resolve({ok: true, mode: modeCore, dataBody: this.innerGetData!(mode!)});
            document.body.removeChild<Node>(host!);
        }
    };


    constructor({props}: { props: Readonly<ParamsDialog> }) {
        super(props);

        this.promiseInfo = {};
        this.state = {
            isShow: false
        }
        this.oldDialog = undefined
        this.moduleIdCore = uuidv4()
        this.innerValidate = undefined
        this.innerGetData = undefined;
        this.mRefHeaderHost = React.createRef<HTMLDivElement>();
        this.mRefDialog = React.createRef<HTMLDivElement>();
        this.mRefBlender= React.createRef<HTMLDivElement>();

        this.mRefButtonHost = React.createRef<HTMLDivElement>();
        this.mRefBodyHost = React.createRef<HTMLDivElement>();
        this.clickButton = this.clickButton.bind(this)
        this.mRefFocusDiv =React.createRef<HTMLDivElement>();


        // @ts-ignore
        this.host = undefined
        this.checkGlobal();
    }

    __innerCloseDom() {
        document.body.removeChild<Node>(this.host!);
    }

    checkGlobal() {


        this.oldDialog = hostDialog.currentDialog

        hostDialog.currentDialog = this;
        //console.log("old", this.oldDialog)
        // console.log("current", hostDialog.currentDialog)
        if (!hostDialog.moduleId) {
            hostDialog.moduleId = this.moduleIdCore;
            //  console.log("init", hostDialog.moduleId, "  ", this.moduleIdCore)
        }
    }

    componentDidMount() {

        if (!this.props.icon && !this.props.header && this.mRefHeaderHost.current) {
            this.mRefHeaderHost.current.remove()
        }

        this.host = document.getElementById(this.props.id!)
        if(this.mRefFocusDiv.current&&this.mRefFocusDiv.current.children[0]){
            (this.mRefFocusDiv.current.children[0] as HTMLElement)!.focus()
        }
        // document.querySelectorAll('[data-focus="true"]').forEach((a: Element) => {
        //     const d: HTMLElement = a as HTMLElement
        //     if (d) {
        //         d.focus()
        //     }
        // });
        const  index:number=findHighestZIndex('div')
        this.mRefBlender.current!.style.zIndex=""+(index+1);
        this.mRefDialog.current!.style.zIndex=""+(index+2);
        if(this.props.position==='top'){

            this.mRefDialog.current!.style.top="-80%"

        }
    }


    componentWillUnmount() {
        if (hostDialog.moduleId === this.moduleIdCore) {
            hostDialog.currentDialog = undefined;
            hostDialog.moduleId = undefined;
        } else {
            hostDialog.currentDialog = this.oldDialog;
        }
        this.__innerCloseDom()
    }

    closeModal = () => {
        this.__innerCloseDom()
        this.props._promise?.resolve({ok: false, mode: '-1', dataBody: undefined});
    }

    clickButton(e: React.MouseEvent<HTMLDivElement> | undefined,mode:string|null|undefined) {



        const d:string|null|undefined = mode!.toString();//(e?.target as HTMLElement).getAttribute('data-mode');

        if (d === "-1") {
            this.closeModal();
            return;
        }
        if (this.innerValidate) {
            const res = this.innerValidate(d!)
            if (res !== true) return
        }
        if (this.innerGetData) {
            const data = this.innerGetData(d!);
            this.props._promise?.resolve({ok: true, mode: d, dataBody: data});
            this.__innerCloseDom()
            return;
        }

        this.props._promise?.resolve({ok: true, mode: d, dataBody: undefined});
        this.__innerCloseDom()

    }

    renderButtons(): any {
        const divs: ReactElement[] = [];
        let add=true;
        this.props.buttons!.forEach((button,index) => {
            const dataMode:string|null|undefined=button.props['data-mode']
            const focus=button.props['data-focus']
            if(focus&&add===true){

                divs.push(<div ref={this.mRefFocusDiv} key={index} onClick={(e)=>{
                    this.clickButton(e,dataMode)
                }}>{button}</div>)
                add=false;
            }else{
                divs.push(<div key={index} onClick={(e)=>{
                    this.clickButton(e,dataMode)
                }}>{button}</div>)
            }
            //
            // divs.push(<div key={index} onClick={(e)=>{
            //     this.clickButton(e,dataMode)
            // }}>{button}</div>)
        })
        return divs
    }

    renderBody(): any {
        return (
            <div ref={this.mRefBodyHost}>
                {
                    this.props.body
                }
            </div>
        )
    }

    render() {



        return (
            <>
                <div className={'blender'} ref={this.mRefBlender}></div>
                <div className={this.props.className} style={this.props.style} ref={this.mRefDialog} >
                    <div ref={this.mRefHeaderHost} className={'m-header'}>
                        <div style={{width: 'fit-content'}}>{this.props.icon}</div>
                        <div style={{width: '100%'}}>{this.props.header}</div>
                        <IoMdClose className={'icon-close'} onClick={this.closeModal}/>
                    </div>
                    <div className={'band-1'}></div>

                    <div ref={this.mRefBodyHost} className={'m-body'}>
                        {
                            this.props.body
                        }
                    </div>
                    <div className={'band-2'}></div>
                    <div ref={this.mRefButtonHost} className={'m-footer'}>
                        {
                            this.renderButtons()
                        }
                    </div>
                </div>
            </>

        );
    }


}