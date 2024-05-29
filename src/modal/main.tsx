



import {ParamsDialog} from "./modalDialog";
import {WrapperModal} from "./wrapperModal";


export default async function ShowBsrDialog(props: ParamsDialog) {

    const wrap = new WrapperModal();
    return await wrap.showModalDialog(props);


}