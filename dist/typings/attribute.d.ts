import { SdlNamedBased } from "./named";
import { SdlValue } from "./value";
export declare class SdlAttribute extends SdlNamedBased {
    private _value;
    get value(): SdlValue;
    set value(v: SdlValue);
    constructor(qualifiedName: string, _value: SdlValue);
}
//# sourceMappingURL=attribute.d.ts.map