import React, {ReactElement, useRef} from 'react';

import './App.css';
import { FaUserSecret } from "react-icons/fa";
import ShowModalDialog from "./modal";
import {Assa} from "./testBody";
import {ConfirmDialogF} from "./ConfirmDialog";

function App() {

    const mRefLabel=useRef<HTMLLabelElement>(null)
    const but: ReactElement[] = []
    but.push(<a data-mode={2} href="https://medium.com/@ericapantojacs/react-registration-form-d298b3b7e75d">Visit source code</a> )
    but.push(<button className={'button-10'} data-mode={100} onClick={()=>{
        ConfirmDialogF()
    }
    }>ShowModal</button>)
    but.push(<button className={'button-10'} data-mode={1}>register</button>)
    but.push(< button className={'button-10'} data-mode={-1} data-focus={true}>close</button>)



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
                    mRefLabel.current!.innerText=JSON.stringify(a);
                   // alert();
                })
            }}> Click
            </button>
            <br/>
            <br/>
            <label ref={mRefLabel}></label>
        </div>
    );
}

export default App;
