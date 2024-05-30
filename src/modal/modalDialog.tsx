import React, {ReactElement} from "react";

///import "./index.css"
import {IoMdClose} from "react-icons/io";
import {hostDialog} from "./storegeDialog";
import {v4 as uuidv4} from 'uuid';


export type ResolvePromise = {
    ok: boolean
    mode: string | null | undefined
    dataBody?: object | undefined
}

export type ParamsDialog = {
    refDialog?: React.RefObject<InstanceType<typeof ModalDialog>> | null
    icon?: any,
    header?: any | undefined,
    body?: any | undefined,
    buttons?: ReactElement[]
    style?: React.CSSProperties | undefined,
    styleHeader?: React.CSSProperties | undefined,
    styleFooter?: React.CSSProperties | undefined,
    styleBody?: React.CSSProperties | undefined,
    position?: 'center' | 'top',
    modal?: boolean,
    onCancel?: (dialog: InstanceType<typeof HTMLDialogElement> | undefined) => boolean;
    onClose?: (dialog: InstanceType<typeof HTMLDialogElement> | undefined) => void;
    onShow?: (dialog: InstanceType<typeof HTMLDialogElement> | undefined) => void;
    timeOut?: number
    __container?: Node,
    id?: string | undefined,
    _promise?: {
        resolve: (value: ResolvePromise) => void, reject: (reason?: any) => void
    },
    className?: string;
    classNameHeader?: string;
    classNameBody?: string;
    classNameFooter?: string;
    classNameTopStripe?: string;
    classNameBottomStripe?: string;

}


export class ModalDialog extends React.Component<ParamsDialog, any> {

    static defaultProps: ParamsDialog = {
        id: undefined,
        body: undefined, buttons: [], position: 'center',
        className: "main-dialog",
        modal: true,
        onCancel: () => {
            return true;
        },
        classNameBody: "m-body",
        classNameFooter: "m-footer",
        classNameHeader: "m-header",
        classNameTopStripe: "top-stripe",
        classNameBottomStripe: "bottom-stripe"

    }

    public body: any | undefined;
    public promiseInfo: object

    public mRefDialog: React.RefObject<HTMLDialogElement>


    public mRefButtonHost: React.RefObject<HTMLDivElement>
    public mRefHeaderHost: React.RefObject<HTMLDivElement>
    public mRefBodyHost: React.RefObject<HTMLDivElement>
    public mRefFocusDiv: React.RefObject<HTMLDivElement>


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
        this.mRefDialog = React.createRef<HTMLDialogElement>();
        this.mRefButtonHost = React.createRef<HTMLDivElement>();
        this.mRefBodyHost = React.createRef<HTMLDivElement>();
        this.mRefFocusDiv = React.createRef<HTMLDivElement>();

        this.clickButton = this.clickButton.bind(this)
        this.checkGlobal();
    }

    private __innerCloseDom(value: ResolvePromise | undefined) {
        this.mRefDialog.current?.close()
        const host = document.getElementById(this.props.id!)
        if (host) {
            document.body.removeChild<Node>(host);
        }

        if (value) {
            this.props._promise?.resolve(value);
        }

    }

    closeDialog(mode: string | undefined | null) {
        this.__innerCloseDom({ok: false, mode: mode, dataBody: undefined})
    }

    private checkGlobal() {


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

        if (this.props.modal === true) {
            this.mRefDialog.current?.showModal()
            this.dialog!.oncancel = (ev) => {
                if (this.innerValidate) {
                    const res = this.innerValidate("-2");
                    if (res === true) {
                        this.__innerCloseDom({ok: false, mode: '-2', dataBody: undefined});
                    }
                } else {
                    const d = this.props.onCancel!(this.dialog!)
                    if (d) {
                        this.__innerCloseDom({ok: false, mode: '-2', dataBody: undefined});
                    }
                }
                return false
            }
        } else {
            this.mRefDialog.current?.show()
        }
        this.dialog!.onclose = (ev) => {
            if (this.props.onClose) {
                this.props.onClose(this.dialog!)
            }
        }


        if (!this.props.icon && !this.props.header && this.mRefHeaderHost.current) {
            this.mRefHeaderHost.current.remove()
        }
        if (this.props.buttons?.length == 0) {
            this.mRefButtonHost.current?.remove();
        }


        if (this.mRefFocusDiv.current && this.mRefFocusDiv.current.children[0]) {
            (this.mRefFocusDiv.current.children[0] as HTMLElement)!.focus()
        }
        if (this.props.position === 'top') {

            this.mRefDialog.current!.style.top = "-60%"

        }
        if (this.props.onShow) {
            this.props.onShow(this.dialog!)
        }
        if (this.props.timeOut) {
            setTimeout(() => {
                this.__innerCloseDom({ok: false, mode: "-1", dataBody: undefined})
            }, this.props.timeOut)
        }

    }

    public get dialog(): HTMLDialogElement | null | undefined {
        return this.mRefDialog.current
    }


    componentWillUnmount() {
        if (hostDialog.moduleId === this.moduleIdCore) {
            hostDialog.currentDialog = undefined;
            hostDialog.moduleId = undefined;
        } else {
            hostDialog.currentDialog = this.oldDialog;
        }
        this.__innerCloseDom(undefined)
    }

    private closeModal = () => {
        this.__innerCloseDom({ok: false, mode: '-1', dataBody: undefined})

    }

    private clickButton(e: React.MouseEvent<HTMLDivElement> | undefined, mode: string | null | undefined) {


        const d: string | null | undefined = mode!.toString();//(e?.target as HTMLElement).getAttribute('data-mode');

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
            this.__innerCloseDom({ok: true, mode: d, dataBody: data})
            return;
        }


        this.__innerCloseDom({ok: true, mode: d, dataBody: undefined})

    }

    private renderButtons(): any {
        const divs: ReactElement[] = [];
        let add = true;
        this.props.buttons!.forEach((button, index) => {
            const dataMode: string | null | undefined = button.props['data-mode']
            const focus = button.props['data-focus']
            if (focus && add) {

                divs.push(<div ref={this.mRefFocusDiv} key={index} onClick={(e) => {
                    this.clickButton(e, dataMode)
                }}>{button}</div>)
                add = false;
            } else {
                divs.push(<div key={index} onClick={(e) => {
                    this.clickButton(e, dataMode)
                }}>{button}</div>)
            }
            //
            // divs.push(<div key={index} onClick={(e)=>{
            //     this.clickButton(e,dataMode)
            // }}>{button}</div>)
        })
        return divs
    }



    render() {


        return (
            <>

                <dialog className={this.props.className} style={this.props.style} ref={this.mRefDialog}>
                    <div ref={this.mRefHeaderHost} style={this.props.styleHeader}
                         className={this.props.classNameHeader}>
                        <div style={{width: 'fit-content'}}>{this.props.icon}</div>
                        <div style={{width: '100%'}}>{this.props.header}</div>
                        <IoMdClose className={'icon-close'} onClick={this.closeModal}/>
                    </div>
                    <div className={this.props.classNameTopStripe}></div>

                    <div ref={this.mRefBodyHost} style={this.props.styleBody} className={this.props.classNameBody}>
                        {
                            this.props.body
                        }
                    </div>
                    <div className={this.props.classNameBottomStripe}></div>
                    <div ref={this.mRefButtonHost} style={this.props.styleFooter}
                         className={this.props.classNameFooter}>
                        {
                            this.renderButtons()
                        }
                    </div>
                </dialog>
            </>

        );
    }


}