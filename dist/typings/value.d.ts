export declare enum SdlValueType {
    ERROR = 0,
    Number = 1,
    Boolean = 2,
    Null = 3,
    Binary = 4,
    String = 5,
    DateTime = 6,
    TimeSpan = 7
}
export declare type SdlTimeSpan = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
};
export declare type SdlValueNumber = {
    type: SdlValueType.Number;
    value: number;
};
export declare type SdlValueBoolean = {
    type: SdlValueType.Boolean;
    value: boolean;
};
export declare type SdlValueNull = {
    type: SdlValueType.Null;
    value: null;
};
export declare type SdlValueBinary = {
    type: SdlValueType.Binary;
    value: string;
};
export declare type SdlValueString = {
    type: SdlValueType.String;
    value: string;
};
export declare type SdlValueDateTime = {
    type: SdlValueType.DateTime;
    value: Date;
};
export declare type SdlValueTimeSpan = {
    type: SdlValueType.TimeSpan;
    value: SdlTimeSpan;
};
export declare type SdlValueUnion = SdlValueDateTime | SdlValueNumber | SdlValueNull | SdlValueTimeSpan | SdlValueBoolean | SdlValueBinary | SdlValueString;
export declare type SdlValueRawUnion = number | boolean | null | string | Date | SdlTimeSpan;
export declare class SdlValue {
    static fromTrue(): SdlValue;
    static fromFalse(): SdlValue;
    static fromBoolean(v: boolean): SdlValue;
    static fromNull(): SdlValue;
    static fromNumber(v: number): SdlValue;
    static fromBinary(v: string): SdlValue;
    static fromString(v: string): SdlValue;
    static fromDateTime(v: Date): SdlValue;
    static fromTimeSpan(v: SdlTimeSpan): SdlValue;
    static from(v: SdlValueRawUnion | unknown): SdlValue;
    get number(): number;
    set number(v: number);
    get boolean(): boolean;
    set boolean(v: boolean);
    get null(): null;
    set null(v: null);
    get binary(): string;
    set binary(v: string);
    get string(): string;
    set string(v: string);
    get dateTime(): Date;
    set dateTime(v: Date);
    get timeSpan(): SdlTimeSpan;
    set timeSpan(v: SdlTimeSpan);
    get type(): SdlValueType;
    private _value;
    get value(): SdlValueUnion;
    set value(v: SdlValueUnion);
    constructor(value: SdlValueUnion);
    clone(): SdlValue;
    private getValueEnforceType;
}
//# sourceMappingURL=value.d.ts.map