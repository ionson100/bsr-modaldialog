import React, {ReactElement} from 'react';

import './App.css';
import {GoAlertFill} from "react-icons/go";
import {ShowModalDialog} from "./modal/main";
import {Assa} from "./testBody";

function App() {
    const but: ReactElement[] = []
    but.push(<button className={'b-65'} data-mode={1}> test1</button>)
    but.push(< button className={'b-65'} data-mode={-1} data-focus={true}>close</button>)


    return (
        <div>

            <button onClick={() => {
                ShowModalDialog({
                    position: 'center',
                    icon: <GoAlertFill color="red"/>,
                    header: (<span style={{paddingLeft: 30}}>Simple Test</span>),
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
