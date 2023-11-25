export const delayFunc = ms => new Promise(res => setTimeout(res, ms));
export function mapToNewRange(value:number,inputMin:number,inputMax:number,outputMin:number,outputMax:number) {
    let result = outputMin + (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin);
    result = Math.round(result);
return result;
}