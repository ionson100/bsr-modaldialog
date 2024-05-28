
import React, {ReactElement} from "react";
import ShowModalDialog,{BaseBodyDialog} from "./modal";
import {FaUserSecret} from "react-icons/fa";


class ConfirmDialog extends BaseBodyDialog {
    getData(mode: string | undefined): object | undefined {
        return undefined;
    }

    validate(mode: string | undefined): boolean | undefined {
        return true
    }
    render() {
        return(
            <>
                <div style={{textAlign:"center",padding:30}}> Close my</div>
                </>
        )
    }

}
export function ConfirmDialogF(){
    const but: ReactElement[] = []
    but.push(< button className={'button-10'} data-mode={-1} data-focus={true}>close</button>)
    return(
        ShowModalDialog({
            position: 'top',
            icon: <FaUserSecret/>,
            header: (<span style={{paddingLeft: 30}}>Close my:</span>),
            body: <ConfirmDialog/>,
            buttons: but
        })
    )
}