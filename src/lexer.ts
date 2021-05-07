// This is mostly a port of SdlangSharp, my C# Sdlang parser.
// It changes a few places of logic since we don't have SIMD here.
// It also keeps track of line info, since the focus is more on usability rather than speed in TS/JS land.
// It also TypeScriptifies a few things.

export enum SdlTokenType
{
    Failsafe,
    Comment,
    Identifier,
    StringDoubleQuoted,
    StringBackQuoted,
    NumberInt32,
    NumberInt64,
    NumberFloat32,
    NumberFloat64,
    NumberFloat128,
    BooleanTrue,
    BooleanFalse,
    Date,
    DateTime,
    TimeSpan,
    EndOfLine,
    EndOfFile,
    BlockOpen,
    BlockClose,
    Equals,
    Null,
    Binary
}

enum SdlReadCharOptions
{
    None,
    CanEscapeNewLines = 1 << 0,
    CanEscapeStringChars = 1 << 1
}

// God I love/hate this feature of TypeScript.
export type SdlToken =
{
    type: SdlTokenType.Identifier,
    text: string,
    name: string,
    namespace: string,
    line: number,
    column: number
}
|
{
    type: SdlTokenType.DateTime | SdlTokenType.Date,
    text: string,
    asDate: Date,
    line: number,
    column: number
}
|
{
    type: SdlTokenType.TimeSpan,
    text: string,
    isNegative: boolean,
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
    milliseconds: number,
    line: number,
    column: number
}
|
{
    type: SdlTokenType.Failsafe | SdlTokenType.EndOfFile
}
|
{
    type: SdlTokenType.BlockOpen | SdlTokenType.BlockClose | SdlTokenType.EndOfLine 
        | SdlTokenType.Equals | SdlTokenType.BooleanFalse | SdlTokenType.BooleanTrue
        | SdlTokenType.Null,
    line: number,
    column: number
}
|
{
    type: SdlTokenType.NumberInt32 | SdlTokenType.NumberInt64 | SdlTokenType.NumberFloat32
        | SdlTokenType.NumberFloat64 | SdlTokenType.NumberFloat128,
    text: string,
    line: number,
    column: number,
    asNumber: number
}
|
{
    type: SdlTokenType.Binary | SdlTokenType.Comment | SdlTokenType.StringBackQuoted
        | SdlTokenType.StringDoubleQuoted,
    text: string,
    line: number,
    column: number
}

export class SdlReader
{
    private _cursor: number;
    private _token: SdlToken;
    private _line: number;
    private _column : number;

     // I don't want peekChar to return an object every time, so we're using these vars.
    private _lastPeekCharsRead: number;
    private _lastPeekEscaped: boolean;
    private _lastPeekNewLineCount: number;
    private _lastPeekNewLineCursor: number;

    // ditto, but for readToEndOrChar
    private _lastReadEndCursor: number;

    constructor(private _input: string) 
    {
        this._cursor = 0;
        this._line = 0;
        this._column = 0;
        this._lastPeekCharsRead = 0;
        this._lastPeekEscaped = false;
        this._lastPeekNewLineCount = 0;
        this._lastPeekNewLineCursor = 0;
        this._lastReadEndCursor = 0;
        this._token = { type: SdlTokenType.Failsafe };
    }

    public get token() : SdlToken 
    {
        return this._token;
    }
    
    public read() : SdlToken
    {
        return this.readImpl();
    }

    public clone() : SdlReader
    {
        const value = new SdlReader(this._input);
        value._cursor = this._cursor;
        value._token = {...this._token};
        return value;
    }

    public toArray() : SdlToken[]
    {
        const array = [];
        // eslint-disable-next-line no-constant-condition
        while(true)
        {
            array.push(this.read());
            if(this.token.type === SdlTokenType.EndOfFile)
                break;
        }

        return array;
    }

    private readImpl() : SdlToken
    {
        this.skipSpacesAndTabs();
        if(this.isEof())
        {
            this._token = { type: SdlTokenType.EndOfFile };
            return this._token;
        }

        const nextCh = this.peekChar(SdlReadCharOptions.CanEscapeNewLines);
        if(this._lastPeekCharsRead > 1)
        {
            // idk, it's in the original SdlangSharp code though.
            this._lastPeekCharsRead--;
            this.commitPeek();
            this._lastPeekCharsRead = 1;
        }

        if(this.isCommentStartChar(nextCh))
        {
            if(nextCh === '-' && this._cursor + 1 < this._input.length && this._input[this._cursor + 1] !== '-')
                this.readNumberOrDateOrTimeOrTimespan();
            else
                this.readComment();
        }
        else if(nextCh.match(/[_a-zA-Z]/))
            this.readIdentifierOrBooleanOrNull();
        else if(nextCh.match(/[0-9-]/))
            this.readNumberOrDateOrTimeOrTimespan();
        else if(nextCh === '"' || nextCh === '`')
            this.readString();
        else if(nextCh === '{' || nextCh === '}' || nextCh === '=')
        {
            this.commitPeek();
            if(nextCh === '{') this._token = { type: SdlTokenType.BlockOpen, line: this._line, column: this._column };
            else if(nextCh === '}') this._token = { type: SdlTokenType.BlockClose, line: this._line, column: this._column };
            else this._token = { type: SdlTokenType.Equals, line: this._line, column: this._column };
        }
        else if(nextCh === '[')
        {
            this.commitPeek();
            const start = this._cursor;
            this.readToEndOrChar(']');
            if(this.isEof())
                throw new Error("Unterminated Base64 sequence. Could not find ending ']' bracket.");
            this._token = { type: SdlTokenType.Binary, text: this._input.slice(start, this._cursor), line: this._line, column: this._column };
            this._cursor++;
        }
        else if(nextCh === '\n' || nextCh === ';')
        {
            this.commitPeek();
            this._token = { type: SdlTokenType.EndOfLine, line: this._line, column: this._column };
        }
        else if(nextCh === ' ' || nextCh === '\t')
            return this.readImpl();
        else
            throw new Error(`Unexpected character: '${nextCh}'`);

        return this._token;
    }

    private readComment() : void
    {
        const startChar = this.nextChar();
        let startCursor = this._cursor;
        let endCursor = 0;
        let nextChar = '';
        switch(startChar)
        {
            case '#': this.readToEndOrChar('\n'); endCursor = this._lastReadEndCursor; break;

            case '-':
            case '/':
                nextChar = this.nextChar();
                startCursor = this._cursor;

                if((startChar === '/' && nextChar !== '*') || startChar !== '/')
                {
                    if(nextChar !== startChar)
                        throw new Error("Expected second '"+startChar+"' to start a line comment, not '"+nextChar+"'");

                    this.readToEndOrChar('\n');
                    endCursor = this._lastReadEndCursor;
                    break;
                }

                // eslint-disable-next-line no-constant-condition
                while(true)
                {
                    endCursor = this._cursor;

                    if(this.isEof())
                        throw new Error("Unexpected EOF when reading multi-line comment");
                    const charOne = this.nextChar();
                    if(this.isEof())
                        throw new Error("Unexpected EOF when reading multi-line comment");
                    const charTwo = this.peekChar();

                    if(charOne === '*' && charTwo === '/')
                    {
                        this.commitPeek();
                        break;
                    }
                }
                break;

            default: throw new Error("This shouldn't happen.");
        }

        this._token = { type: SdlTokenType.Comment, line: this._line, column: this._column, text: this._input.slice(startCursor, endCursor) };
    }

    private readIdentifierOrBooleanOrNull()
    {
        this._token = {
            type: SdlTokenType.Identifier,
            column: this._column,
            line: this._line,
            text: '',
            name: '',
            namespace: ''
        };

        const start = this._cursor;
        let nameStartCursor = start;
        while(!this.isEof())
        {
            this.readToEndOrAnyChar(':', ' ', '=', '\r', '\n');
            if(this.isEof())
                break;

            const ch = this.peekChar();
            if(ch === ':')
            {
                this._token.namespace = this._input.slice(start, this._cursor);
                this.commitPeek();
                nameStartCursor = this._cursor;
                continue;
            }

            break;
        }

        this._token.text = this._input.slice(start, this._cursor);
        if(nameStartCursor < this._input.length)
            this._token.name = this._input.slice(nameStartCursor, this._cursor);

        nameStartCursor -= (nameStartCursor !== start) ? 1 : 0;

        switch(this._token.text)
        {
            case 'true':
            case 'on':
                this._token = { type: SdlTokenType.BooleanTrue, line: this._line, column: this._column };
                break;

            case 'false':
            case 'off':
                this._token = { type: SdlTokenType.BooleanFalse, line: this._line, column: this._column };
                break;

            case 'null':
                this._token = { type: SdlTokenType.Null, line: this._line, column: this._column };
                break;            
        }
    }

    private readString()
    {
        const quoteChar = this.nextChar();
        let start = this._cursor;

        if(quoteChar === '`')
        {
            this.readToEndOrChar('`');
            if(this.isEof())
                throw new Error("Unterminated string");
            this._token = { type: SdlTokenType.StringBackQuoted, line: this._line, column: this._column, text: this._input.slice(start, this._cursor) };
            this._cursor++;
            return;
        }

        // In SdlangSharp we don't parse escape characters by default
        // due to it being a slowdown for a rare case.
        //
        // We're in JS/TS land now though, so we'll be doing that.

        // Fast path: We don't need to escape at all (end on '"')
        // Slow path: We need to parse escape chars (end on '\\')

        let result = "";
        // eslint-disable-next-line no-constant-condition
        while(true)
        {
            if(this.isEof())
                throw new Error("Unterminated string");

            this.readToEndOrAnyChar('"', '\\');
            const ch = this.peekChar();

            if(ch === '"')
            {
                if(result.length === 0)
                {
                    result = this._input.slice(start, this._cursor);
                    this.commitPeek();
                    break;
                }

                result += this._input.slice(start, this._cursor);
                this.commitPeek();
                break;
            }
            else if(ch === '\\')
            {
                this._cursor++;
                // Escaped raw new line. ('\n', not '\\n')
                if(this.peekChar() === '\n')
                {
                    result += this._input.slice(start, this._cursor - 1);
                    this.commitPeek();
                    this.skipSpacesAndTabs();
                    start = this._cursor;
                    continue;
                }
                this._cursor--;

                result += this._input.slice(start, this._cursor);
                result += this.nextChar(SdlReadCharOptions.CanEscapeStringChars);
                start = this._cursor;
            }
        }

        this._token = { type: SdlTokenType.StringDoubleQuoted, line: this._line, column: this._column, text: result };
    }

    private readNumberOrDateOrTimeOrTimespan() : void
    {
        const start = this._cursor;
        this.nextChar();

        while(!this.isEof())
        {
            const ch = this.peekChar().toLowerCase();

            // The original SdlangSharp code is just as bad >x3
            if(ch.match(/[0-9.]/))
            {
                this.commitPeek();
                continue;
            }
            else if(ch === ':')
            {
                this._cursor = start;
                this.readTime();
                return;
            }
            else if(ch === '/')
            {
                this._cursor = start;
                this.readDateOrDateTime();
                return;
            }
            else if(ch.match(/[\s\t\n]/))
            {
                const slice = this._input.slice(start, this._cursor);
                this._token = { type: SdlTokenType.NumberInt32, asNumber: parseInt(slice, 10), line: this._line, column: this._column, text: slice};
                return;
            }
            else if(ch === 'l')
            {
                const slice = this._input.slice(start, this._cursor);
                this._token = { type: SdlTokenType.NumberInt64, asNumber: parseInt(slice, 10), line: this._line, column: this._column, text: slice};
                this.commitPeek();
                return;
            }
            else if(ch === 'f')
            {
                const slice = this._input.slice(start, this._cursor);
                this._token = { type: SdlTokenType.NumberFloat32, asNumber: parseFloat(slice), line: this._line, column: this._column, text: slice};
                this.commitPeek();
                return;
            }
            else if(ch === 'd')
            {
                const slice = this._input.slice(start, this._cursor);
                this._token = { type: SdlTokenType.NumberFloat64, asNumber: parseFloat(slice), line: this._line, column: this._column, text: slice};
                this.commitPeek();

                if(!this.isEof() && this.peekChar() === ':')
                {
                    this._cursor = start;
                    this.readTime();
                }
                return;
            }
            else if(ch === 'b')
            {
                this.commitPeek();
                const nextCh = this.peekChar();

                if(nextCh !== 'd' && nextCh !== 'D')
                    throw new Error("Expected 'd' or 'D' following 'b' or 'B' 128-bit float suffix, but got: "+nextCh);

                const slice = this._input.slice(start, this._cursor - 1);
                this._token = { type: SdlTokenType.NumberFloat128, asNumber: parseFloat(slice), line: this._line, column: this._column, text: slice};
                this.commitPeek();
                return;
            }
            else
                throw new Error("Unexpected character when parsing number/date/time: '"+ch+"'");
        }

        const slice = this._input.slice(start, this._cursor);
        this._token = { type: SdlTokenType.NumberInt32, asNumber: parseInt(slice, 10), line: this._line, column: this._column, text: slice};
    }

    private readTime() : void
    {
        this._token = {
            type: SdlTokenType.TimeSpan,
            column: this._column,
            line: this._line,
            days: 0,
            hours: 0,
            milliseconds: 0,
            minutes: 0,
            seconds: 0,
            text: '',
            isNegative: false
        };

        const startCursor = this._cursor;
        const ch = this.peekChar();
        const isNegative = ch === '-';

        if(isNegative)
            this.commitPeek();

        let hitColon = false;
        let hitDot = false;
        const readToColonOrSpaceOrEndOrDot = () =>
        {
            hitColon = false;
            hitDot = false;
            const start = this._cursor;

            let result = "";
            while(!this.isEof())
            {
                const currentCh = this.peekChar();
                if(currentCh.match(/[: \t\n.]/))
                {
                    hitColon = currentCh === ':';
                    hitDot = currentCh === '.';
                    result = this._input.slice(start, this._cursor);
                    if(!currentCh.match(/[ \n\t]/))
                        this.commitPeek();
                    return result;
                }
                this.commitPeek();
            }
            return this._input.slice(start, this._cursor);
        }

        function toInt(number: string, unit: string)
        {
            let value = 0;
            if(number.length === 0)
                throw new Error("No value provided for timespan "+unit);
            if(isNaN(value = parseInt(number)))
                throw new Error(`Invalid timespan ${unit} value: ${number}`);
            return value;
        }

        const enforceHitColon = () =>
        {
            if(!hitColon)
                throw new Error("Expected colon");
        }

        let readResult : string | null = readToColonOrSpaceOrEndOrDot();
        enforceHitColon();
        if(readResult.endsWith("d"))
        {
            const slicedResult = readResult.slice(0, -1);
            this._token.days = toInt(slicedResult, "days");
            readResult = null;
        }

        if(readResult === null)
            readResult = readToColonOrSpaceOrEndOrDot();
        enforceHitColon();
        this._token.hours = toInt(readResult, "hours");
        readResult = readToColonOrSpaceOrEndOrDot();
        enforceHitColon();
        this._token.minutes = toInt(readResult, "minutes");
        readResult = readToColonOrSpaceOrEndOrDot();
        this._token.seconds = toInt(readResult, "seconds");

        if(hitDot)
        {
            readResult = readToColonOrSpaceOrEndOrDot();
            this._token.milliseconds = toInt(readResult, "milliseconds");
        }

        this._token.isNegative = isNegative;
        this._token.text = this._input.slice(startCursor, this._cursor);
    }

    private readDateOrDateTime() : void
    {
        this._token = {
            type: SdlTokenType.DateTime,
            asDate: new Date(),
            column: this._column,
            line: this._line,
            text: ''
        };

        const REQUIRED_CHARS = "yyyy/mm/dd".length;

        if(this._cursor + REQUIRED_CHARS > this._input.length)
            throw new Error(`Expected ${REQUIRED_CHARS} available characters for Date, but reached EOF. Format must be yyyy/mm/dd`);

        const start = this._cursor;
        this._cursor += REQUIRED_CHARS;

        let end = this._cursor;
        this.skipSpacesAndTabs();

        let hasColon = false;
        let hyphenCursor = 0;
        while(!this.isEof())
        {
            const ch = this.peekChar();
            if(ch.match(/[ \n\t]/))
                break;
                
            this._cursor += this._lastPeekCharsRead;

            hasColon = hasColon || ch === ':';
            if(ch === '-' && hyphenCursor === 0)
                hyphenCursor = this._cursor;
        }

        if(hasColon)
            end = (hyphenCursor > 0) ? hyphenCursor - 1 : this._cursor;
        else
            this._cursor = end;

        const timeSlice = this._input.slice(start, end);
        let dateTime = new Date(timeSlice);
        if(isNaN(dateTime.getTime()))
            throw new Error("Invalid DateTime value: "+timeSlice);

        this._token.type = (hasColon) ? SdlTokenType.DateTime : SdlTokenType.Date;
        this._token.text = this._input.slice(start, this._cursor);

        if(hyphenCursor > 0)
        {
            const timezoneSlice = this._input.slice(hyphenCursor, this._cursor);
            const match = timezoneSlice.match(/GMT([+-]?)(\d?\d?:?\d?\d?)/);
            if(!match || (match[2].length > 0 && match[1].length === 0))
                throw new Error("Invalid timezone within DateTime, only supported format (for now!) is: -GMT+/-nn:nn and -GMT");

            let timeMatch : RegExpMatchArray | null;
            let timezone = 0;
            if(match[2].match(/^\d?\d$/))
                timezone = (1000 * 60 * 60 * parseInt(match[2]));
            else if((timeMatch = match[2].match(/(\d?\d):(\d?\d)/)))
            {
                timezone = (
                  + (1000 * 60 * 60 * parseInt(timeMatch[1]))
                  + (1000 * 60 * parseInt(timeMatch[2]))
                );
            }
            else if(match[2].length !== 0)
                throw new Error("Invalid timezone within DateTime, use 'hh' or 'hh:mm' format. Bad format: "+ match[2]);

            if(match[1] === '-')
                timezone *= -1;
            dateTime = new Date(dateTime.getTime() + timezone);
        }

        this._token.asDate = dateTime;
        const delta = this._cursor - start;
        this._cursor = start;
        this._cursor += delta;
        this._column += delta;
    }

    private isCommentStartChar(ch: string) : boolean
    {
        return ch === '#' || ch === '-' || ch === '/';
    }

    private peekChar(options = SdlReadCharOptions.None) : string
    {
        let ch = this._input[this._cursor];
        this._lastPeekNewLineCount = 0;
        this._lastPeekCharsRead = 1;
        this._lastPeekEscaped = false;

        // Special case: Sdlang spec defines '\r\n' as always being read as '\n'.
        if(ch === '\r')
        {
            if(this._cursor + 1 >= this._input.length || this._input[this._cursor + 1] !== '\n')
                throw new Error("Stray carriage return - no line feed character following it.");

            ch = '\n';
            this._lastPeekCharsRead = 2;
            this._lastPeekNewLineCount = 1;
            this._lastPeekNewLineCursor = this._cursor + 1;
        }
        else if(ch === '\n')
        {
            this._lastPeekNewLineCount++;
            this._lastPeekNewLineCursor = this._cursor;
        }
        else if(ch === '\\')
        {
            if(options & SdlReadCharOptions.CanEscapeNewLines)
            {
                const startCursor = this._cursor;
                this._cursor++;

                let oldCharsRead = this._lastPeekCharsRead;
                let oldNewLinesRead = this._lastPeekNewLineCount;
                const nextCh = this.peekChar(options);
                if(nextCh === '\n')
                {
                    oldCharsRead += this._lastPeekCharsRead;
                    oldNewLinesRead += this._lastPeekNewLineCount;
                    this._cursor += this._lastPeekCharsRead;

                    ch = this.peekChar(options);
                    this._lastPeekCharsRead += oldCharsRead;
                    this._lastPeekNewLineCount += oldNewLinesRead;
                    this._cursor = startCursor;
                    return ch;
                }
            }

            if(options & SdlReadCharOptions.CanEscapeStringChars)
            {
                if(this._cursor + 1 >= this._input.length)
                    throw new Error("Unexpected EOF after initial escape backslash");

                const nextCh = this._input[this._cursor + 1];
                this._lastPeekCharsRead = 2;
                this._lastPeekEscaped = true;

                switch(nextCh)
                {
                    case 'n': ch = '\n'; break;
                    case 't': ch = '\t'; break;
                    case 'r': ch = '\r'; break;
                    case '"': ch = '"'; break;
                    case '\\': ch = '\\'; break;

                    default: this._lastPeekEscaped = false; break;
                }

                if(this._lastPeekEscaped)
                    return ch;
            }
        }

        return ch;
    }

    private commitPeek() : void
    {
        this._cursor += this._lastPeekCharsRead;
        if(this._lastPeekNewLineCount > 0)
        {
            this._line += this._lastPeekNewLineCount;
            this._column = this._cursor - this._lastPeekNewLineCursor;
        }
    }

    private nextChar(options = SdlReadCharOptions.None) : string
    {
        const ch = this.peekChar(options);
        this.commitPeek();

        return ch;
    }

    private isEof() : boolean
    {
        return this._cursor >= this._input.length;
    }

    private skipSpacesAndTabs() : void
    {
        while(!this.isEof())
        {
            const ch = this.peekChar();
            if(ch !== ' ' && ch !== '\t')
                break;
            this.commitPeek();
        }
    }

    private readToEndOrChar(expected: string) : void
    {
        // Browsers don't really have general purpose SIMD, so thankfully
        // I only need to port over the fallback loops.
        this._lastReadEndCursor = this._cursor;
        while(!this.isEof())
        {
            const ch = this.peekChar();
            if(ch === expected)
                break;
            this.commitPeek();
            this._lastReadEndCursor = this._cursor;
        }
    }

    private readToEndOrAnyChar(...expected: string[]) : void
    {
        while(!this.isEof())
        {
            const ch = this.peekChar();
            if(expected.includes(ch))
                break;
            this.commitPeek();
        }
    }
}