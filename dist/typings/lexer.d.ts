import { SdlTag } from "./tag";
export declare enum SdlTokenType {
    Failsafe = 0,
    Comment = 1,
    Identifier = 2,
    StringDoubleQuoted = 3,
    StringBackQuoted = 4,
    NumberInt32 = 5,
    NumberInt64 = 6,
    NumberFloat32 = 7,
    NumberFloat64 = 8,
    NumberFloat128 = 9,
    BooleanTrue = 10,
    BooleanFalse = 11,
    Date = 12,
    DateTime = 13,
    TimeSpan = 14,
    EndOfLine = 15,
    EndOfFile = 16,
    BlockOpen = 17,
    BlockClose = 18,
    Equals = 19,
    Null = 20,
    Binary = 21
}
export declare type SdlToken = {
    type: SdlTokenType.Identifier;
    text: string;
    name: string;
    namespace: string;
    line: number;
    column: number;
} | {
    type: SdlTokenType.DateTime | SdlTokenType.Date;
    text: string;
    asDate: Date;
    line: number;
    column: number;
} | {
    type: SdlTokenType.TimeSpan;
    text: string;
    isNegative: boolean;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
    line: number;
    column: number;
} | {
    type: SdlTokenType.Failsafe | SdlTokenType.EndOfFile;
} | {
    type: SdlTokenType.BlockOpen | SdlTokenType.BlockClose | SdlTokenType.EndOfLine | SdlTokenType.Equals | SdlTokenType.BooleanFalse | SdlTokenType.BooleanTrue | SdlTokenType.Null;
    line: number;
    column: number;
} | {
    type: SdlTokenType.NumberInt32 | SdlTokenType.NumberInt64 | SdlTokenType.NumberFloat32 | SdlTokenType.NumberFloat64 | SdlTokenType.NumberFloat128;
    text: string;
    line: number;
    column: number;
    asNumber: number;
} | {
    type: SdlTokenType.Binary | SdlTokenType.Comment | SdlTokenType.StringBackQuoted | SdlTokenType.StringDoubleQuoted;
    text: string;
    line: number;
    column: number;
};
export declare class SdlReader {
    private _input;
    private _cursor;
    private _token;
    private _line;
    private _column;
    private _lastPeekCharsRead;
    private _lastPeekEscaped;
    private _lastPeekNewLineCount;
    private _lastPeekNewLineCursor;
    private _lastReadEndCursor;
    constructor(_input: string);
    get token(): SdlToken;
    read(): SdlToken;
    clone(): SdlReader;
    toArray(): SdlToken[];
    toAst(): SdlTag;
    private readImpl;
    private readComment;
    private readIdentifierOrBooleanOrNull;
    private readString;
    private readNumberOrDateOrTimeOrTimespan;
    private readTime;
    private readDateOrDateTime;
    private isCommentStartChar;
    private peekChar;
    private commitPeek;
    private nextChar;
    private isEof;
    private skipSpacesAndTabs;
    private readToEndOrChar;
    private readToEndOrAnyChar;
}
//# sourceMappingURL=lexer.d.ts.map