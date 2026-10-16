import React, {ReactElement} from "react";
import {IoMdClose} from "react-icons/io";
import {hostDialog} from "./storegeDialog";
import {createId} from "./createId";
import {FOCUSABLE_SELECTOR} from "./focusable";
import {findHighestZIndex} from "./maxZIndex";


export type ResolvePromise = {
    ok: boolean
    mode: string | null | undefined
    dataBody?: any | undefined
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


export class ModalDialog extends React.Component<ParamsDialog, { hasError: boolean }> {

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

    public mRefDialog: React.RefObject<HTMLDivElement | null>
    public formClose: HTMLFormElement | undefined


    public mRefButtonHost: React.RefObject<HTMLDivElement | null >
    public mRefHeaderHost: React.RefObject<HTMLDivElement | null>
    public mRefBodyHost: React.RefObject<HTMLDivElement | null >
    public mRefFocusDiv: React.RefObject<HTMLDivElement  | null>
    public mRefAssDiv: React.RefObject<HTMLDivElement | null >


    public oldDialog: ModalDialog | undefined
    public moduleIdCore: string
    public innerValidate: ((mode: string | undefined) => boolean | undefined) | undefined
    public innerGetData: ((mode: string | undefined) => object | undefined) | undefined
    public lastFocus: Element | null;

    /**
     * The dialog is closed exactly once: the promise is settled, `onClose` fires
     * and the React root is unmounted only on the first call.
     */
    private closed: boolean
    private timer: ReturnType<typeof setTimeout> | undefined


    public selfClose: (mode: string | undefined) => void = (mode) => {

        const modeCore = mode ? mode : "no data"
        this.__innerCloseDom(modeCore);
    };


    constructor(props: Readonly<ParamsDialog>) {
        super(props);
        this.state = {
            hasError: false
        }
        this.closed = false;
        this.timer = undefined;
        this.oldDialog = undefined
        this.moduleIdCore = createId()
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
        this.lastFocus = null
        this.formClose = undefined;
        // `hostDialog` keeps track of the topmost dialog (nested dialogs are
        // supported). Done in the constructor - not in componentDidMount - on
        // purpose: the body components register themselves during their own
        // construction, i.e. before any didMount of this dialog runs.
        this.checkGlobal();

    }

    /**
     * Settles the promise, calls `onClose` and unmounts the dialog.
     * `mode` -1 / -2 mean "cancelled" and produce `ok: false`.
     */
    __innerCloseDom(mode: string | null | undefined) {

        if (this.closed) {
            return;
        }

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

            this.closed = true;
            this.clearTimer();

            this.props._promise?.resolve({ok: res, mode: d, dataBody: dataBody});

            if (this.props.onClose) {
                this.props.onClose(this.dialog ?? undefined)
            }

            this.props.__actionUnmount?.call(undefined)
        } catch (value) {
            try{
                let error = 'inner error, watch console'
                if (value) {
                    error = (value as ErrorEvent)?.message;
                }

                if (!this.closed) {
                    this.closed = true;
                    this.clearTimer();
                    if (this.props._promise) {
                        this.props._promise.reject(new Error(error));
                    }
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

        if (hostDialog.currentDialog === this) {
            // a second constructor call (StrictMode / re-mount) must not make
            // the dialog its own predecessor
            return;
        }
        this.oldDialog = hostDialog.currentDialog
        hostDialog.currentDialog = this;
    }

    private clearTimer() {
        if (this.timer !== undefined) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }

    private getFocusableElements(): HTMLElement[] {
        const root = this.mRefDialog.current;
        if (!root) {
            return [];
        }
        return Array.prototype.slice.call(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
    }

    private FocusTab(e: KeyboardEvent) {
        if (this.moduleIdCore === hostDialog.currentDialog?.moduleIdCore) {
            const isTabPressed = (e.key === 'Tab' || e.keyCode === 9);
            if (!isTabPressed) {
                return;
            }
            const focusableEls = this.getFocusableElements();
            if (focusableEls.length === 0) {
                return;
            }
            const firstFocusableEl = focusableEls[0];
            const lastFocusableEl = focusableEls[focusableEls.length - 1];
            const root = this.mRefDialog.current;
            const active: Element | null = document.activeElement;
            const inside = !!(root && active && root.contains(active));

            if (e.shiftKey) {
                if (!inside || active === firstFocusableEl) {
                    lastFocusableEl.focus();
                    e.preventDefault();
                }
            } else {
                if (!inside || active === lastFocusableEl) {
                    firstFocusableEl.focus();
                    e.preventDefault();
                }
            }
        }
    }

    componentDidMount() {

        this.lastFocus = document.activeElement;

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
        /* the list of focusable elements is evaluated on every Tab press, see FocusTab */

        window.addEventListener("keydown", this.FocusTab)
        if (this.props.modal === true) {
            window.addEventListener("keyup", this.KeuUpEsc)

            this.mRefDialog.current?.setAttribute('aria-live', 'assertive')
            this.mRefDialog.current?.setAttribute('aria-modal', 'true')

        } else {
            this.mRefDialog.current?.setAttribute('aria-modal', 'false')
            if (this.mRefAssDiv.current) {
                this.mRefAssDiv.current.style.visibility = 'hidden'
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

            if (this.mRefDialog.current) {
                this.mRefDialog.current.style.top = "-60%"
            }

        }
        if (this.props.onShow) {
            this.props.onShow(this.dialog!)
        }

        const zet: number = findHighestZIndex('div');
        if (this.mRefAssDiv.current) {
            this.mRefAssDiv.current.style.zIndex = "" + (zet + 1)
        }
        if (this.mRefDialog.current) {
            this.mRefDialog.current.style.zIndex = "" + (zet + 2)
        }

        if (this.props.timeOut) {
            this.timer = setTimeout(() => {
                this.timer = undefined;
                this.__innerCloseDom('-1')
            }, this.props.timeOut)
        }

    }

    public get dialog(): HTMLDivElement | null | undefined {
        return this.mRefDialog.current
    }

    /**
     * Keeps an error thrown by the dialog content from leaving the caller
     * with a promise that never settles: the promise is rejected and the
     * dialog is unmounted.
     */
    static getDerivedStateFromError() {
        return {hasError: true};
    }

    componentDidCatch(error: unknown) {
        if (this.closed) {
            return;
        }
        this.closed = true;
        this.clearTimer();
        const err = error instanceof Error
            ? error
            : new Error(typeof error === 'string' ? error : 'bsr-modaldialog: unknown error');
        console.error('bsr-modaldialog:', err);
        this.props._promise?.reject(err);
        // unmount outside of the commit phase
        setTimeout(() => {
            this.props.__actionUnmount?.call(undefined)
        }, 0);
    }


    componentWillUnmount() {
        this.clearTimer();
        if (hostDialog.currentDialog === this) {
            hostDialog.currentDialog = this.oldDialog;
        }
        if (this.props.modal) {
            window.removeEventListener("keyup", this.KeuUpEsc)

        }
        window.removeEventListener("keydown", this.FocusTab)

        if (!this.closed) {
            // the dialog was unmounted from the outside - do not leave the
            // caller waiting forever
            this.closed = true;
            this.props._promise?.resolve({ok: false, mode: undefined, dataBody: undefined});
        }

        const container = this.props.__container as (Node & { parentNode?: Node | null }) | undefined;
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }

        const lastFocus = this.lastFocus as HTMLElement | null;
        if (lastFocus && typeof lastFocus.focus === 'function' && document.contains(lastFocus)) {
            try {
                lastFocus.focus();
            } catch {
                // the previously focused element can not be focused anymore
            }
        }
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
        (this.props.buttons ?? []).forEach((button, index) => {


            // @ts-expect-error data-mode is read from the button element provided by the consumer
            const dataMode: string | null | undefined = button.props['data-mode']
            // @ts-expect-error data-focus is read from the button element provided by the consumer
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


    render(): React.ReactNode {

        if (this.state.hasError) {
            // error fallback, the promise is already rejected in componentDidCatch
            return null;
        }

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
