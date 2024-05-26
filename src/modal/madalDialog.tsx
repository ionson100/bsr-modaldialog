import React, {lazy, ReactElement} from "react";
import {RiCloseFill} from "react-icons/ri";
import "./index.css"
import {BaseBodyDialog} from "./BaseBodyDialog";

type ResolvePromise={
    ok:boolean
    mode:string|null
    dataBody?:object | undefined
}

export type ParamsDialog = {
    icon?: any,
    header?: any|undefined,
    body?: any| undefined,
    buttons?: ReactElement[]
    style?: React.CSSProperties | undefined,
    styleHeader?: React.CSSProperties | undefined,
    styleFooter?: React.CSSProperties | undefined,
    position?: 'center' | 'fullScreen' | 'scroll',
    container?: Node ,
    id?:string|undefined,
    _promise?: {
        resolve: (value: ResolvePromise) => void, reject: (reason?: any) => void
    }
}


export class ModalDialog extends React.Component<ParamsDialog, any> {

    static defaultProps: ParamsDialog = { id:undefined,
        body: undefined, buttons: [], position: 'center'

    }

    public  body: any|undefined;
    public promiseInfo: object
    public mRefButtonHost: React.RefObject<HTMLDivElement>
    public mRefBodyHost: React.RefObject<HTMLDivElement>
    public baseDialog:BaseBodyDialog|undefined
    public host:HTMLElement|null


    constructor({props}: { props: Readonly<ParamsDialog> }) {
        super(props);

        this.promiseInfo = {};
        this.state = {
            isShow: false
        }
        this.mRefButtonHost = React.createRef<HTMLDivElement>();
        this.mRefBodyHost = React.createRef<HTMLDivElement>();
        this.clickButton=this.clickButton.bind(this)

        this.baseDialog=undefined

        // @ts-ignore
        this.host=undefined



        //this.body = this.props.body?.undefined;
    }
    componentDidMount() {
        try {
            this.baseDialog =this.props.body.type.prototype as BaseBodyDialog
            if(this.baseDialog){
                this.baseDialog._id=this.props.id
            }
        }catch (e){

        }

        this.host=document.getElementById(this.props.id!)
        console.log(this.props)


        document.querySelectorAll('[data-focus="true"]').forEach((a:Element)=>{
            const d:HTMLElement=a as HTMLElement
            if(d){
                d.focus()
            }
        });
    }


    componentWillUnmount() {

        document.body.removeChild<Node>(this.props.container!);
    }

    closeModal = () => {

        document.body.removeChild<Node>(this.props.container!);
        this.props._promise?.resolve({ok:false,mode:'-1',dataBody:undefined});

    }

    clickButton(e: React.MouseEvent<HTMLDivElement> | undefined) {

        const d = (e?.target as HTMLElement).getAttribute('data-mode');
        if(d==="-1"){
            this.closeModal();
            return;
        }
        if(this.baseDialog){
            const res=this.baseDialog.validate(d)
            if(res!==true) return
            const data=this.baseDialog.getData(d);
            this.props._promise?.resolve({ok:true,mode:d,dataBody:data});
            document.body.removeChild<Node>(this.props.container!);
            return;
        }
        this.props._promise?.resolve({ok:true,mode:d,dataBody:undefined});
        document.body.removeChild<Node>(this.props.container!);

    }

    renderButtons(): any {
        const divs: ReactElement[] = [];
        this.props.buttons!.forEach(button => {
            divs.push(<div onClick={this.clickButton}>{button}</div>)
        })
        return divs
    }
    renderBody(): any {
        return(
            <div ref={this.mRefBodyHost}>
                {
                    this.props.body
                }
            </div>
        )
    }

    render() {

        // @ts-ignore
        return (
            <>
                <div className={'blender'}></div>
                <div className={'main-dialog'}>
                    <div style={{background: "#f5d3d3", display: 'flex', padding: 5}}>
                        <div style={{width: 'fit-content'}}>{this.props.icon}</div>
                        <div style={{width: '100%'}}>{this.props.header}</div>
                        <RiCloseFill className={'icon-close'} onClick={this.closeModal}/>
                    </div>

                    <div style={{background: "#dbe7b7", height: "100%"}}>
                        {
                            this.renderBody()
                        }
                    </div>

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