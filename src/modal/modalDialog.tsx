import React, {ReactElement} from "react";

///import "./index.css"
import {IoMdClose} from "react-icons/io";
import {hostDialog} from "./storegeDialog";
import {v4 as uuidv4} from 'uuid';
import {findHighestZIndex} from "./maxZIndex";


export type ResolvePromise = {
    ok: boolean
    mode: string | null | undefined
    dataBody?: object | undefined
}

export type ParamsDialog = {
    /**
     * Closing a modal dialog by clicking an empty area
     */
    closeModalDialogClickForeignArea?: boolean

    /**
     * A reference to the modal dialog object.
     * Will be useful for closing the dialog programmatically
     */
    refDialog?: React.RefObject<InstanceType<typeof ModalDialog>> | null

    /**
     * Dialogue head icon
     */
    icon?: any,

    /**
     * Dialogue title content
     */
    header?: any | undefined,

    /**
     * Dialogue body content
     */
    body?: any | undefined,

    /**
     * Array of dialog buttons
     */
    buttons?: ReactElement[]

    /**
     * Dialogue styles
     */
    style?: React.CSSProperties | undefined,

    /**
     * Dialog Title Styles
     */
    styleHeader?: React.CSSProperties | undefined,

    /**
     * Dialog Footer Styles
     */
    styleFooter?: React.CSSProperties | undefined,

    /**
     * Dialog Body Styles
     */
    styleBody?: React.CSSProperties | undefined,

    /**
     * Position of dialogue on screen
     */
    position?: 'center' | 'top',


    /**
     * Dialogue type, modal or non-modal
     */
    modal?: boolean,

    /**
     * The event occurs before the modal dialog is closed using the Esc button
     * @param dialog HTMLDivElement
     */
    onCancel?: (dialog: InstanceType<typeof HTMLDivElement> | undefined) => boolean;

    /***
     * Event when closing a dialog
     * @param dialog  HTMLDivElement
     */
    onClose?: (dialog: InstanceType<typeof HTMLDivElement> | undefined) => void;


    /**
     * Event when opening a dialog
     * @param dialog  HTMLDivElement
     */
    onShow?: (dialog: InstanceType<typeof HTMLDivElement> | undefined) => void;

    /**
     * Time in milliseconds until the dialog is automatically closed if the dialog is used as an alert
     */
    timeOut?: number

    /**
     * for private use
     */
    __container?: Node,

    /**
     * for private use
     */
    _id?: string | undefined,

    /**
     * for private use
     */
    _promise?: {
        resolve: (value: ResolvePromise) => void, reject: (reason?: any) => void
    },
    __actionUnmount?: () => void

    classNameAssDialog?: string;
    className?: string;
    classNameHeader?: string;
    classNameBody?: string;
    classNameFooter?: string;


    ariaLabel?: string;
    ariaLabelledby?: string

}


export class ModalDialog extends React.Component<ParamsDialog, any> {

    static defaultProps: ParamsDialog = {
        _id: undefined,
        body: undefined, buttons: [], position: 'center',
        className: "main-dialog",
        modal: true,
        onCancel: () => {
            return true;
        },
        classNameBody: "m-body",
        classNameFooter: "m-footer",
        classNameHeader: "m-header",
        classNameAssDialog: "ass-dialog"


    }

    public body: any | undefined;
    public promiseInfo: object

    public mRefDialog: React.RefObject<HTMLDivElement>
    private focusable: {
        firstFocusableEl: HTMLElement | undefined,
        lastFocusableEl: HTMLElement | undefined
    }
    public formClose: HTMLFormElement | undefined


    public mRefButtonHost: React.RefObject<HTMLDivElement>
    public mRefHeaderHost: React.RefObject<HTMLDivElement>
    public mRefBodyHost: React.RefObject<HTMLDivElement>
    public mRefFocusDiv: React.RefObject<HTMLDivElement>
    public mRefAssDiv: React.RefObject<HTMLDivElement>


    public oldDialog: ModalDialog | undefined
    public moduleIdCore: string;
    public innerValidate: ((mode: string | undefined) => boolean | undefined) | undefined
    public innerGetData: ((mode: string | undefined) => object | undefined) | undefined
    public lastFocus: Element | null;


    public selfClose: (mode: string | undefined) => void = (mode) => {

        const modeCore = mode ? mode : "no data"
        this.props._promise?.resolve({ok: true, mode: modeCore, dataBody: this.innerGetData!(mode!)});
        this.props.__actionUnmount?.call(undefined)

    };


    constructor({props}: { props: Readonly<ParamsDialog> }) {
        super(props);
        this.focusable = {
            lastFocusableEl: undefined,
            firstFocusableEl: undefined
        }

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
        this.mRefButtonHost = React.createRef<HTMLDivElement>();
        this.mRefBodyHost = React.createRef<HTMLDivElement>();
        this.mRefFocusDiv = React.createRef<HTMLDivElement>();
        this.mRefAssDiv = React.createRef<HTMLDivElement>()

        this.clickButton = this.clickButton.bind(this)
        this.KeuUpEsc = this.KeuUpEsc.bind(this)
        this.FocusTab = this.FocusTab.bind(this)
        this.ClickDialog = this.ClickDialog.bind(this)
        this.lastFocus = document.activeElement
        this.formClose = undefined;
        this.checkGlobal();

    }

    __innerCloseDom(mode: string | null | undefined) {

        try {
            const d: string | null | undefined = mode?.toString();

            let dataBody: object | undefined = undefined;
            if (this.innerValidate) {
                const res = this.innerValidate(d)
                if (res !== true) return
            }
            if (this.innerGetData) {
                dataBody = this.innerGetData(d);
            }

            let res: boolean = true;
            if (d === '-1' || d === '-2') {
                res = false;
            }

            this.props._promise?.resolve({ok: res, mode: d, dataBody: dataBody});
            this.props.__actionUnmount?.call(undefined)
        } catch (value) {
            try{
                let error = 'inner error, watch console'
                if (value) {
                    error = (value as ErrorEvent)?.message;
                }

                if (this.props._promise) {
                    this.props._promise.reject(new Error(error));
                }
                console.error(error)
            }catch (e){
                console.error(e)
            }finally {
                this.props.__actionUnmount?.call(undefined)
            }

        }
    }


    closeDialog(mode: string | undefined | null) {
        this.__innerCloseDom(mode)
    }

    checkGlobal() {

        this.oldDialog = hostDialog.currentDialog
        hostDialog.currentDialog = this;
    }

    private FocusTab(e: KeyboardEvent) {
        if (this.moduleIdCore === hostDialog.currentDialog?.moduleIdCore) {
            const isTabPressed = (e.key === 'Tab' || e.keyCode === 9);
            if (!isTabPressed) {
                return;
            }
            if (e.shiftKey) {
                if (document.activeElement === this.focusable.firstFocusableEl) {
                    (this.focusable.lastFocusableEl as HTMLElement).focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === this.focusable.lastFocusableEl) {
                    (this.focusable.firstFocusableEl as HTMLElement).focus();
                    e.preventDefault();
                }
            }
        }
    }

    componentDidMount() {

        /*__________close form__________*/
        const formsCloseList: NodeListOf<HTMLFormElement> | undefined = this.mRefDialog.current?.querySelectorAll('form');
        if (formsCloseList) {
            formsCloseList!.forEach(a => {
                const name = a.getAttribute('method')
                if (name === 'dialog') {
                    this.formClose = a;
                }
            })
            if (this.formClose) {
                this.formClose.addEventListener("submit", () => {
                    this.__innerCloseDom('dialog')
                })
            }
        }
        /*___________________trap-focus______________________*/

        const focusableEls: NodeListOf<HTMLElement> | undefined = this.mRefDialog.current?.querySelectorAll('' +
            'area[href]:not([tabindex=\'-1\']),' +
            'iframe:not([tabindex=\'-1\']),' +
            '[tabindex]:not([tabindex=\'-1\']),' +
            '[contentEditable=true]:not([tabindex=\'-1\']),' +

            'a[href]:not([disabled]):not([tabindex=\'-1\']),' +
            ' button:not([disabled]):not([tabindex=\'-1\']),' +
            ' textarea:not([disabled]):not([tabindex=\'-1\']),' +
            ' input:not([disabled]):not([tabindex=\'-1\']),' +
            ' select:not([disabled]):not([tabindex=\'-1\'])');
        if (focusableEls) {
            this.focusable.firstFocusableEl = focusableEls[0];
            this.focusable.lastFocusableEl = focusableEls[focusableEls.length - 1];
        }


        window.addEventListener("keydown", this.FocusTab)
        if (this.props.modal === true) {
            window.addEventListener("keyup", this.KeuUpEsc)

            this.mRefDialog.current?.setAttribute('aria-live', 'assertive')
            this.mRefDialog.current?.setAttribute('aria-modal', 'true')

        } else {
            this.mRefDialog.current?.setAttribute('aria-modal', 'false')
            this.mRefAssDiv.current!.style.visibility = 'hidden'
        }
        this.dialog!.onclose = () => {
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
                this.__innerCloseDom('-1')
            }, this.props.timeOut)
        }

        const zet: number = findHighestZIndex('div');
        this.mRefAssDiv.current!.style.zIndex = "" + (zet + 1)
        this.mRefDialog.current!.style.zIndex = "" + (zet + 2)

    }

    public get dialog(): HTMLDivElement | null | undefined {
        return this.mRefDialog.current
    }


    componentWillUnmount() {
        hostDialog.currentDialog = this.oldDialog;


        // if (hostDialog.moduleId === this.moduleIdCore) {
        //     hostDialog.currentDialog = undefined;
        //     hostDialog.moduleId = undefined;
        // } else {
        //     hostDialog.currentDialog = this.oldDialog;
        // }
        if (this.props.modal) {
            window.removeEventListener("keyup", this.KeuUpEsc)

        }
        window.removeEventListener("keydown", this.FocusTab)

        document.body.removeChild<Node>(this.props.__container as Node);
        if (this.lastFocus) {
            (this.lastFocus as HTMLElement)!.focus()
        }
        // this.__innerCloseDom(undefined)
    }

    closeModal = () => {
        this.clickButton("-1")

    }

    clickButton(mode: string | null | undefined) {
        this.__innerCloseDom(mode)
    }

    renderButtons(): any {
        const divs: ReactElement[] = [];
        let add = true;
        this.props.buttons!.forEach((button, index) => {
            const dataMode: string | null | undefined = button.props['data-mode']
            const focus = button.props['data-focus']
            if (focus && add) {

                divs.push(<div ref={this.mRefFocusDiv} key={index} onClick={() => {
                    this.clickButton(dataMode)
                }}>{button}</div>)
                add = false;
            } else {
                divs.push(<div key={index} onClick={() => {
                    this.clickButton(dataMode)
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

                <div ref={this.mRefAssDiv} className={this.props.classNameAssDialog} onClick={this.ClickDialog}/>
                <div
                    aria-label={this.props.ariaLabel}
                    aria-labelledby={this.props.ariaLabelledby}
                    role={'dialog'}
                    className={this.props.className} style={this.props.style} ref={this.mRefDialog}>

                    <div ref={this.mRefHeaderHost} style={this.props.styleHeader}
                         className={this.props.classNameHeader}>
                        <div style={{width: 'fit-content'}}>{this.props.icon}</div>
                        <div style={{width: '100%'}}>{this.props.header}</div>

                        <button className={'btn-close-modal'} aria-label={'Close'} onClick={this.closeModal}>
                            <IoMdClose/>
                        </button>
                    </div>

                    <div ref={this.mRefBodyHost} style={this.props.styleBody} className={this.props.classNameBody}>
                        {
                            this.props.body
                        }
                    </div>

                    <div ref={this.mRefButtonHost} style={this.props.styleFooter}
                         className={this.props.classNameFooter}>
                        {
                            this.renderButtons()
                        }
                    </div>

                </div>
            </>

        );
    }


    private ClickDialog() {

        if (this.moduleIdCore === hostDialog.currentDialog?.moduleIdCore) {
            if (this.props.modal === true && this.props.closeModalDialogClickForeignArea === true) {
                this.__innerCloseDom('-2')
            }
        }
        return false
    }

    private KeuUpEsc(e: KeyboardEvent) {

        if (e.key === 'Escape') {
            if (this.moduleIdCore === hostDialog.currentDialog?.moduleIdCore) {
                if (this.props.onCancel) {
                    const res = this.props.onCancel(this.mRefDialog.current!)
                    if (res) {
                        this.__innerCloseDom('-2')
                    }
                }

            }

        }

    }
}
