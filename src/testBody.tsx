import {BaseBodyDialog} from "./modal/BaseBodyDialog";

export class Assa extends BaseBodyDialog {

    validate(modeId: string): boolean {
        if (!modeId || modeId === '2' || modeId === '-1') {
            return true;
        }

        if (modeId === '1') {// click register
            // request to server
            setTimeout(() => {
                this.selfClose('0')
            }, 2000)
            return false
        }
        return false;


    }

    getData(modeId: string): object | undefined {

        return {modeId: modeId, user_name: 'testUser'};
    }

    componentDidMount() {

    }

    render() {
        return (
            <div style={{paddingTop: 2, paddingBottom: 2}}>

                <fieldset>
                    <h2>Sign Up</h2>
                    <div className="Field">
                        <label>
                            First name <sup>*</sup>
                        </label>
                        <input
                            placeholder="First name"
                        />
                    </div>
                    <div className="Field">
                        <label>Last name</label>
                        <input
                            placeholder="Last name"
                        />
                    </div>
                    <div className="Field">
                        <label>
                            Email address <sup>*</sup>
                        </label>
                        <input
                            placeholder="Email address"
                        />
                    </div>
                    <div className="Field">
                        <label>
                            Password <sup>*</sup>
                        </label>
                        <input
                            type="password"
                            placeholder="Password"
                        />
                    </div>
                    <div className="Field">
                        <label>
                            Role <sup>*</sup>
                        </label>
                        <select>
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