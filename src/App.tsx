import React, {ReactElement} from 'react';

import './App.css';
import { FaUserSecret } from "react-icons/fa";
import {ShowModalDialog} from "./modal/main";
import {Assa} from "./testBody";

function App() {
    const but: ReactElement[] = []
    but.push(<a data-mode={2} href="https://medium.com/@ericapantojacs/react-registration-form-d298b3b7e75d">Visit source code</a> )
    but.push(<button className={'b-65'} data-mode={1}>register</button>)
    but.push(< button className={'b-65'} data-mode={-1} data-focus={true}>close</button>)



    return (
        <div>

            <button onClick={() => {
                ShowModalDialog({
                    style:{width:520},
                    position: 'center',
                    icon: <FaUserSecret/>,
                    header: (<span style={{paddingLeft: 30}}>Add user:</span>),
                    body: <Assa/>,
                    buttons: but
                }).then(a => {
                    alert(JSON.stringify(a));
                })
            }}> Click
            </button>
        </div>
    );
}

export default App;
