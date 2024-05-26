import {BaseBodyDialog} from "./modal/BaseBodyDialog";

 export class Assa extends BaseBodyDialog{
     validate(modeId: string): boolean {
        return true;
     }
     getData(modeId: string): object | undefined {
         //this.selfClose()
         return {modeId:modeId};
     }
     componentDidMount(){

     }
     render() {
         return (
             <div style={{padding:20}}>
             <label>Name:</label>
                 <input type={"text"}/>
             </div>
         );
     }

 }