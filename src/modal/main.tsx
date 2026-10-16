import {ParamsDialog, ResolvePromise} from "./modalDialog";
import {WrapperModal} from "./wrapperModal";


export default function ShowBsrDialog(props: ParamsDialog): Promise<ResolvePromise> {

    const wrap = new WrapperModal();
    return wrap.showModalDialog(props);


}
