import { log } from "console";

export function parse(body:string,value:any,startDelimiter="{",endDilimiter="}"){
    let st=0;
    let res="";
    const s = JSON.parse(value);
    while(st<body.length){
        log(res);
        if(body[st]==startDelimiter){
            let curr=st;
            while(body[curr]!='}'){
                curr++;
                if(curr>=body.length) {
                    console.log("invalid input");
                    
                    return "";
                }
            }
           
            const keys=body.substring(st+1,curr).split('.');
            let localVal=s;
            for (let key of keys) {
                if (localVal.hasOwnProperty(key)) {
                    localVal = localVal[key];
                } else {
                    console.log(`Invalid key path: ${keys.join('.')}`);
                    return "";
                }
            }
            res+=localVal+"";
           
            st=curr;
        }
        else{
            res+=body[st];
        }
        st++;
    }
    console.log(res);
    return res;
    
}


