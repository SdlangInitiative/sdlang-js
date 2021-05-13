import { SdlNamedBased } from "./named";
import { SdlValue } from "./value";

export class SdlAttribute extends SdlNamedBased
{
    public get value() : SdlValue {
        return this._value;
    }
    public set value(v : SdlValue) {
        this._value = v;
    }
    
    constructor(qualifiedName: string, private _value : SdlValue) 
    {
        super(qualifiedName);
    }
}