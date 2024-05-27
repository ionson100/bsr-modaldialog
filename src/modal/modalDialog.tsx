import React, {ReactElement} from "react";

import "./index.css"
import {BaseBodyDialog} from "./BaseBodyDialog";
import { IoMdClose } from "react-icons/io";

type ResolvePromise = {
    ok: boolean
    mode: string | null
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
    position?: 'center' | 'fullScreen' | 'top',
    container?: Node,
    id?: string | undefined,
    _promise?: {
        resolve: (value: ResolvePromise) => void, reject: (reason?: any) => void
    }
}


export class ModalDialog extends React.Component<ParamsDialog, any> {

    static defaultProps: ParamsDialog = {
        id: undefined,
        body: undefined, buttons: [], position: 'center'

    }

    public body: any | undefined;
    public promiseInfo: object
    public mRefButtonHost: React.RefObject<HTMLDivElement>
    public mRefHeaderHost: React.RefObject<HTMLDivElement>
    public mRefBodyHost: React.RefObject<HTMLDivElement>
    public baseDialog: BaseBodyDialog | undefined
    public host: HTMLElement | null


    constructor({props}: { props: Readonly<ParamsDialog> }) {
        super(props);

        this.promiseInfo = {};
        this.state = {
            isShow: false
        }
        this.mRefHeaderHost=React.createRef<HTMLDivElement>();
        this.mRefButtonHost = React.createRef<HTMLDivElement>();
        this.mRefBodyHost = React.createRef<HTMLDivElement>();
        this.clickButton = this.clickButton.bind(this)

        this.baseDialog = undefined

        // @ts-ignore
        this.host = undefined
    }
    __innerCloseDomm(){
        document.body.removeChild<Node>(this.host!);
    }

    componentDidMount() {
        console.log(this.props)
        alert(this.props.body as BaseBodyDialog)
        if(!this.props.icon&&!this.props.header&&this.mRefHeaderHost.current){
            this.mRefHeaderHost.current.remove()
        }
        try {

            this.baseDialog = this.props.body.type?.prototype as BaseBodyDialog
            if (this.baseDialog) {
                this.baseDialog.selfCloseCore = (modeId) => {
                    const host = document.getElementById(this.props.id!)
                    if (host) {
                        const modeCore=modeId?modeId:"no data"
                        this.props._promise?.resolve({ok: true, mode: modeCore, dataBody: this.baseDialog?.getData(modeCore)});
                        document.body.removeChild<Node>(host!);
                    }
                };
            }
        } catch (e) {

        }
        this.host = document.getElementById(this.props.id!)
        document.querySelectorAll('[data-focus="true"]').forEach((a: Element) => {
            const d: HTMLElement = a as HTMLElement
            if (d) {
                d.focus()
            }
        });
    }


    componentWillUnmount() {
        this.__innerCloseDomm()
    }

    closeModal = () => {
        this.__innerCloseDomm()
        this.props._promise?.resolve({ok: false, mode: '-1', dataBody: undefined});
    }

    clickButton(e: React.MouseEvent<HTMLDivElement> | undefined) {

        const d = (e?.target as HTMLElement).getAttribute('data-mode');
        if (d === "-1") {
            this.closeModal();
            return;
        }
        if (this.baseDialog) {
            const res = this.baseDialog.validate(d)
            if (res !== true) return
            const data = this.baseDialog.getData(d);
            this.props._promise?.resolve({ok: true, mode: d, dataBody: data});
            this.__innerCloseDomm()
            return;
        }
        this.props._promise?.resolve({ok: true, mode: d, dataBody: undefined});
        this.__innerCloseDomm()

    }

    renderButtons(): any {
        const divs: ReactElement[] = [];
        this.props.buttons!.forEach(button => {
            divs.push(<div onClick={this.clickButton}>{button}</div>)
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
                <div className={'blender'} ></div>
                <div className={'main-dialog'} style={this.props.style}>
                    <div ref={this.mRefHeaderHost} className={'m-header'}>
                        <div style={{width: 'fit-content'}}>{this.props.icon}</div>
                        <div style={{width: '100%'}}>{this.props.header}</div>
                        <IoMdClose className={'icon-close'}  onClick={this.closeModal}/>
                    </div>
                    <div className={'band-1'}></div>

                    <div className={'m-body'}>
                        {
                            this.renderBody()
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