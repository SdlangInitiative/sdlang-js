export enum SdlValueType
{
    ERROR,
    Number,
    Boolean,
    Null,
    Binary,
    String,
    DateTime,
    TimeSpan
}

export type SdlTimeSpan =
{
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number
};

export type SdlValueNumber   = { type: SdlValueType.Number,     value: number };
export type SdlValueBoolean  = { type: SdlValueType.Boolean,    value: boolean };
export type SdlValueNull     = { type: SdlValueType.Null,       value: null };
export type SdlValueBinary   = { type: SdlValueType.Binary,     value: string };
export type SdlValueString   = { type: SdlValueType.String,     value: string };
export type SdlValueDateTime = { type: SdlValueType.DateTime,   value: Date };
export type SdlValueTimeSpan = { type: SdlValueType.TimeSpan,   value: SdlTimeSpan };
export type SdlValueUnion    = SdlValueDateTime | SdlValueNumber | SdlValueNull | SdlValueTimeSpan | SdlValueBoolean | SdlValueBinary | SdlValueString;
export type SdlValueRawUnion = number | boolean | null | string | Date | SdlTimeSpan;

export class SdlValue
{
    /***********
     * STATIC CONSTRUCTORS
     * *********/
    public static fromTrue    ():               SdlValue { return new SdlValue({ type: SdlValueType.Boolean,    value: true  }); }
    public static fromFalse   ():               SdlValue { return new SdlValue({ type: SdlValueType.Boolean,    value: false }); }
    public static fromBoolean (v: boolean):     SdlValue { return new SdlValue({ type: SdlValueType.Boolean,    value: v     }); }
    public static fromNull    ():               SdlValue { return new SdlValue({ type: SdlValueType.Null,       value: null  }); }
    public static fromNumber  (v: number):      SdlValue { return new SdlValue({ type: SdlValueType.Number,     value: v     }); }
    public static fromBinary  (v: string):      SdlValue { return new SdlValue({ type: SdlValueType.Binary,     value: v     }); }
    public static fromString  (v: string):      SdlValue { return new SdlValue({ type: SdlValueType.String,     value: v     }); }
    public static fromDateTime(v: Date):        SdlValue { return new SdlValue({ type: SdlValueType.DateTime,   value: v     }); }
    public static fromTimeSpan(v: SdlTimeSpan): SdlValue { return new SdlValue({ type: SdlValueType.TimeSpan,   value: v     }); }

    public static from(v: SdlValueRawUnion | unknown): SdlValue
    {
        if(v === null)
            return SdlValue.fromNull();

        switch(typeof v)
        {
            case "string": return SdlValue.fromString(v);
            case "boolean": return SdlValue.fromBoolean(v);
            case "number": return SdlValue.fromNumber(v);
            case "object":
                if(v instanceof Date)
                    return SdlValue.fromDateTime(v);
                else if((v as SdlTimeSpan).days !== undefined) // shitty, but JS is a bit shit at this stuff anyway.
                    return SdlValue.fromTimeSpan(v as SdlTimeSpan);
                throw new Error(`Can't construct an SdlValue from object. Only Date and SdlTimeSpan objects are allowed: ${v}`);

            default: throw new Error(`Can't construct an SdlValue from: ${v}`);
        }
    }

    /************
     * PER-TYPE GETTERS & SETTERS
     * **********/

    public get number(): number  { return this.getValueEnforceType<number>(this._value, SdlValueType.Number); }
    public set number(v: number) { this._value = { type: SdlValueType.Number, value: v } }

    public get boolean(): boolean  { return this.getValueEnforceType<boolean>(this._value, SdlValueType.Boolean); }
    public set boolean(v: boolean) { this._value = { type: SdlValueType.Boolean, value: v } }

    public get null(): null  { return this.getValueEnforceType<null>(this._value, SdlValueType.Null); }
    public set null(v: null) { this._value = { type: SdlValueType.Null, value: v } }

    public get binary(): string  { return this.getValueEnforceType<string>(this._value, SdlValueType.Binary); }
    public set binary(v: string) { this._value = { type: SdlValueType.Binary, value: v } }

    public get string(): string  { return this.getValueEnforceType<string>(this._value, SdlValueType.String); }
    public set string(v: string) { this._value = { type: SdlValueType.String, value: v } }

    public get dateTime(): Date  { return this.getValueEnforceType<Date>(this._value, SdlValueType.DateTime); }
    public set dateTime(v: Date) { this._value = { type: SdlValueType.DateTime, value: v } }

    public get timeSpan(): SdlTimeSpan  { return this.getValueEnforceType<SdlTimeSpan>(this._value, SdlValueType.TimeSpan); }
    public set timeSpan(v: SdlTimeSpan) { this._value = { type: SdlValueType.TimeSpan, value: v } }

    /*************
     * MISC
     * ************/

    // Some of this code was made using VSCode snippets, hence the slightly inconsistent styling.
    public get type() : SdlValueType {
        return this._value.type;
    }
    
    private _value : SdlValueUnion;
    public get value() : SdlValueUnion {
        return this._value;
    }
    public set value(v : SdlValueUnion) {
        this._value = v;
    }

    constructor(value: SdlValueUnion) 
    {
        if(typeof value !== "object")
            throw new Error("SdlValue.constructor can only take SdlValueUnion. Use the static constructors such as SdlValue.from, SdlValue.fromString, etc.");

        this._value = value;
    }

    public clone() : SdlValue
    {
        switch(this._value.type)
        {
            case SdlValueType.Binary:   return SdlValue.fromBinary(this._value.value);
            case SdlValueType.Boolean:  return SdlValue.fromBoolean(this._value.value);
            case SdlValueType.DateTime: return SdlValue.fromDateTime({...this._value.value});
            case SdlValueType.Null:     return SdlValue.fromNull();
            case SdlValueType.Number:   return SdlValue.fromNumber(this._value.value);
            case SdlValueType.String:   return SdlValue.fromString(this._value.value);
            case SdlValueType.TimeSpan: return SdlValue.fromTimeSpan({...this._value.value});
            default: throw new Error(`Bug: This SdlValue is either uninitialised, or has a bad type: ${this.type}`);
        }
    }

    /*********
     * PRIVATES
     * *******/

    private getValueEnforceType<T extends SdlValueRawUnion>(union: SdlValueUnion, type: SdlValueType) : T
    {
        if(union.type !== type)
            throw new TypeError(`I am not a ${type}, I am: ${this.type}`);
        return union.value as T;
    }
}