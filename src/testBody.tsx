import {BaseBodyDialog} from "./modal/BaseBodyDialog";
import React from "react";

export class Assa extends BaseBodyDialog {

    public id:number=23;
    public mRefFirstName: React.RefObject<HTMLInputElement>=React.createRef<HTMLInputElement>()
    public mRefEmail: React.RefObject<HTMLInputElement>=React.createRef<HTMLInputElement>()
    public mRefPassword: React.RefObject<HTMLInputElement>=React.createRef<HTMLInputElement>()
    public mRefRole: React.RefObject<HTMLSelectElement>=React.createRef<HTMLSelectElement>()
    public mRefError: React.RefObject<HTMLLabelElement>=React.createRef<HTMLLabelElement>();



    public validate(modeId: string): boolean {
        if (!modeId || modeId === '2' || modeId === '-1') {
            return true;
        }

        if (modeId === '1') {// click register


            alert(this.mRefFirstName)
            // if(this.mRefFirstName!.current!.value===''){
            //     this.mRefError.current!.innerText='Name empty'
            //     return false;
            // }

            // request to server
            // setTimeout(() => {
            //     this.selfClose('0')
            // }, 2000)
            return false
        }
        return false;


    }

    getData(modeId: string): object | undefined {

        return {modeId: modeId, user_name: 'testUser'};
    }

    componentDidMount() {
        this.validate=this.validate.bind(this);
        setTimeout(() => {
            this.mRefFirstName!.current!.focus()// override focus button :close
        }, 100)
    }

    render() {
        return (
            <div style={{paddingTop: 2, paddingBottom: 2}}>

                <fieldset>
                    <label ref={this.mRefError} style={{color:"red"}}>sdsdsd</label>
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