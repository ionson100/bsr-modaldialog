



import {ParamsDialog} from "./modalDialog";
import {WrapperModal} from "./wrapperModal";


export async function ShowModalDialog(props: ParamsDialog) {

    const wrap = new WrapperModal();
    return await wrap.showModalDialog(props);


}