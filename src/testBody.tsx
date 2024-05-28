import {BaseBodyDialog} from "./modal";
import React from "react";

export class Assa extends BaseBodyDialog {

    public mRefFirstName: React.RefObject<HTMLInputElement>=React.createRef<HTMLInputElement>()
    public mRefEmail: React.RefObject<HTMLInputElement>=React.createRef<HTMLInputElement>()
    public mRefPassword: React.RefObject<HTMLInputElement>=React.createRef<HTMLInputElement>()
    public mRefRole: React.RefObject<HTMLSelectElement>=React.createRef<HTMLSelectElement>()
    public mRefError: React.RefObject<HTMLLabelElement>=React.createRef<HTMLLabelElement>();



    validate(mode: string|undefined): boolean {
        this.mRefError.current!.innerText=''
        if(mode==='100'){
            return  false;
        }

        if (!mode || mode === '2' || mode === '-1') {
            return true;
        }

        if (mode === '1') {// click register



            if(this.mRefFirstName.current!.value===''){
                this.mRefError.current!.innerText='First name empty.'
                return false;
            }
            if(this.mRefEmail.current!.value===''){
                this.mRefError.current!.innerText='Email empty.'
                return false;
            }
            if(this.mRefPassword.current!.value===''){
                this.mRefError.current!.innerText='Password empty.'
                return false;
            }
            if(this.mRefRole.current!.selectedIndex===0){
                this.mRefError.current!.innerText='Role not selected.'
                return false;
            }

            //request to server
            setTimeout(() => {
                this.selfClose('0')
            }, 2000)
            return false
        }
        return false;


    }

    getData(mode: string|undefined): object | undefined {


        return {
            userName:this.mRefFirstName.current?.value,
            email:this.mRefEmail.current?.value,
            password:this.mRefPassword.current?.value,
            role:this.mRefRole.current?.value
        };
    }

    componentDidMount() {
        this.validate=this.validate.bind(this);
        setTimeout(() => {
            this.mRefFirstName!.current!.focus()// override focus button dialog :close
        }, 100)
    }

    render() {
        return (
            <div style={{paddingTop: 2, paddingBottom: 2}}>

                <fieldset>
                    <label ref={this.mRefError} style={{color:"red"}}/>
                    <h2>Sign Up</h2>
                    <div className="Field">
                        <label>First name <sup>*</sup></label>
                        <input ref={this.mRefFirstName} placeholder="First name"/>
                    </div>
                    <div className="Field">
                        <label>Last name</label>
                        <input placeholder="Last name"/>
                    </div>
                    <div className="Field">
                        <label>Email address <sup>*</sup></label>
                        <input ref={this.mRefEmail} placeholder="Email address"/>
                    </div>
                    <div className="Field">
                        <label>Password <sup>*</sup></label>
                        <input ref={this.mRefPassword} type="password" placeholder="Password"/>
                    </div>
                    <div  className="Field">
                        <label>Role <sup>*</sup></label>
                        <select ref={this.mRefRole}>
                            <option value="role">Role</option>
                            <option value="individual">Individual</option>
                            <option value="business">Business</option>
                        </select>
                    </div>

                </fieldset>
            </div>
        );
    }
}