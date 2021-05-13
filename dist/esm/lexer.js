var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { AstSdlTokenVisitor } from "./ast_visitor";
import { parseAndVisit } from "./pusher";
export var SdlTokenType;
(function (SdlTokenType) {
    SdlTokenType[SdlTokenType["Failsafe"] = 0] = "Failsafe";
    SdlTokenType[SdlTokenType["Comment"] = 1] = "Comment";
    SdlTokenType[SdlTokenType["Identifier"] = 2] = "Identifier";
    SdlTokenType[SdlTokenType["StringDoubleQuoted"] = 3] = "StringDoubleQuoted";
    SdlTokenType[SdlTokenType["StringBackQuoted"] = 4] = "StringBackQuoted";
    SdlTokenType[SdlTokenType["NumberInt32"] = 5] = "NumberInt32";
    SdlTokenType[SdlTokenType["NumberInt64"] = 6] = "NumberInt64";
    SdlTokenType[SdlTokenType["NumberFloat32"] = 7] = "NumberFloat32";
    SdlTokenType[SdlTokenType["NumberFloat64"] = 8] = "NumberFloat64";
    SdlTokenType[SdlTokenType["NumberFloat128"] = 9] = "NumberFloat128";
    SdlTokenType[SdlTokenType["BooleanTrue"] = 10] = "BooleanTrue";
    SdlTokenType[SdlTokenType["BooleanFalse"] = 11] = "BooleanFalse";
    SdlTokenType[SdlTokenType["Date"] = 12] = "Date";
    SdlTokenType[SdlTokenType["DateTime"] = 13] = "DateTime";
    SdlTokenType[SdlTokenType["TimeSpan"] = 14] = "TimeSpan";
    SdlTokenType[SdlTokenType["EndOfLine"] = 15] = "EndOfLine";
    SdlTokenType[SdlTokenType["EndOfFile"] = 16] = "EndOfFile";
    SdlTokenType[SdlTokenType["BlockOpen"] = 17] = "BlockOpen";
    SdlTokenType[SdlTokenType["BlockClose"] = 18] = "BlockClose";
    SdlTokenType[SdlTokenType["Equals"] = 19] = "Equals";
    SdlTokenType[SdlTokenType["Null"] = 20] = "Null";
    SdlTokenType[SdlTokenType["Binary"] = 21] = "Binary";
})(SdlTokenType || (SdlTokenType = {}));
var SdlReadCharOptions;
(function (SdlReadCharOptions) {
    SdlReadCharOptions[SdlReadCharOptions["None"] = 0] = "None";
    SdlReadCharOptions[SdlReadCharOptions["CanEscapeNewLines"] = 1] = "CanEscapeNewLines";
    SdlReadCharOptions[SdlReadCharOptions["CanEscapeStringChars"] = 2] = "CanEscapeStringChars";
})(SdlReadCharOptions || (SdlReadCharOptions = {}));
var SdlReader = (function () {
    function SdlReader(_input) {
        this._input = _input;
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
    Object.defineProperty(SdlReader.prototype, "token", {
        get: function () {
            return this._token;
        },
        enumerable: false,
        configurable: true
    });
    SdlReader.prototype.read = function () {
        return this.readImpl();
    };
    SdlReader.prototype.clone = function () {
        var value = new SdlReader(this._input);
        value._cursor = this._cursor;
        value._token = __assign({}, this._token);
        return value;
    };
    SdlReader.prototype.toArray = function () {
        var array = [];
        while (true) {
            array.push(this.read());
            if (this.token.type === SdlTokenType.EndOfFile)
                break;
        }
        return array;
    };
    SdlReader.prototype.toAst = function () {
        var visitor = new AstSdlTokenVisitor();
        parseAndVisit(this.clone(), visitor);
        return visitor.rootNode;
    };
    SdlReader.prototype.readImpl = function () {
        this.skipSpacesAndTabs();
        if (this.isEof()) {
            this._token = { type: SdlTokenType.EndOfFile };
            return this._token;
        }
        var nextCh = this.peekChar(SdlReadCharOptions.CanEscapeNewLines);
        if (this._lastPeekCharsRead > 1) {
            this._lastPeekCharsRead--;
            this.commitPeek();
            this._lastPeekCharsRead = 1;
        }
        if (this.isCommentStartChar(nextCh)) {
            if (nextCh === '-' && this._cursor + 1 < this._input.length && this._input[this._cursor + 1] !== '-')
                this.readNumberOrDateOrTimeOrTimespan();
            else
                this.readComment();
        }
        else if (nextCh.match(/[_a-zA-Z]/))
            this.readIdentifierOrBooleanOrNull();
        else if (nextCh.match(/[0-9-]/))
            this.readNumberOrDateOrTimeOrTimespan();
        else if (nextCh === '"' || nextCh === '`')
            this.readString();
        else if (nextCh === '{' || nextCh === '}' || nextCh === '=') {
            this.commitPeek();
            if (nextCh === '{')
                this._token = { type: SdlTokenType.BlockOpen, line: this._line, column: this._column };
            else if (nextCh === '}')
                this._token = { type: SdlTokenType.BlockClose, line: this._line, column: this._column };
            else
                this._token = { type: SdlTokenType.Equals, line: this._line, column: this._column };
        }
        else if (nextCh === '[') {
            this.commitPeek();
            var start = this._cursor;
            this.readToEndOrChar(']');
            if (this.isEof())
                throw new Error("Unterminated Base64 sequence. Could not find ending ']' bracket.");
            this._token = { type: SdlTokenType.Binary, text: this._input.slice(start, this._cursor), line: this._line, column: this._column };
            this._cursor++;
        }
        else if (nextCh === '\n' || nextCh === ';') {
            this.commitPeek();
            this._token = { type: SdlTokenType.EndOfLine, line: this._line, column: this._column };
        }
        else if (nextCh === ' ' || nextCh === '\t')
            return this.readImpl();
        else
            throw new Error("Unexpected character: '" + nextCh + "'");
        return this._token;
    };
    SdlReader.prototype.readComment = function () {
        var startChar = this.nextChar();
        var startCursor = this._cursor;
        var endCursor = 0;
        var nextChar = '';
        switch (startChar) {
            case '#':
                this.readToEndOrChar('\n');
                endCursor = this._lastReadEndCursor;
                break;
            case '-':
            case '/':
                nextChar = this.nextChar();
                startCursor = this._cursor;
                if ((startChar === '/' && nextChar !== '*') || startChar !== '/') {
                    if (nextChar !== startChar)
                        throw new Error("Expected second '" + startChar + "' to start a line comment, not '" + nextChar + "'");
                    this.readToEndOrChar('\n');
                    endCursor = this._lastReadEndCursor;
                    break;
                }
                while (true) {
                    endCursor = this._cursor;
                    if (this.isEof())
                        throw new Error("Unexpected EOF when reading multi-line comment");
                    var charOne = this.nextChar();
                    if (this.isEof())
                        throw new Error("Unexpected EOF when reading multi-line comment");
                    var charTwo = this.peekChar();
                    if (charOne === '*' && charTwo === '/') {
                        this.commitPeek();
                        break;
                    }
                }
                break;
            default: throw new Error("This shouldn't happen.");
        }
        this._token = { type: SdlTokenType.Comment, line: this._line, column: this._column, text: this._input.slice(startCursor, endCursor) };
    };
    SdlReader.prototype.readIdentifierOrBooleanOrNull = function () {
        this._token = {
            type: SdlTokenType.Identifier,
            column: this._column,
            line: this._line,
            text: '',
            name: '',
            namespace: ''
        };
        var start = this._cursor;
        var nameStartCursor = start;
        while (!this.isEof()) {
            this.readToEndOrAnyChar(':', ' ', '=', '\r', '\n');
            if (this.isEof())
                break;
            var ch = this.peekChar();
            if (ch === ':') {
                this._token.namespace = this._input.slice(start, this._cursor);
                this.commitPeek();
                nameStartCursor = this._cursor;
                continue;
            }
            break;
        }
        this._token.text = this._input.slice(start, this._cursor);
        if (nameStartCursor < this._input.length)
            this._token.name = this._input.slice(nameStartCursor, this._cursor);
        nameStartCursor -= (nameStartCursor !== start) ? 1 : 0;
        switch (this._token.text) {
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
    };
    SdlReader.prototype.readString = function () {
        var quoteChar = this.nextChar();
        var start = this._cursor;
        if (quoteChar === '`') {
            this.readToEndOrChar('`');
            if (this.isEof())
                throw new Error("Unterminated string");
            this._token = { type: SdlTokenType.StringBackQuoted, line: this._line, column: this._column, text: this._input.slice(start, this._cursor) };
            this._cursor++;
            return;
        }
        var result = "";
        while (true) {
            if (this.isEof())
                throw new Error("Unterminated string");
            this.readToEndOrAnyChar('"', '\\');
            var ch = this.peekChar();
            if (ch === '"') {
                if (result.length === 0) {
                    result = this._input.slice(start, this._cursor);
                    this.commitPeek();
                    break;
                }
                result += this._input.slice(start, this._cursor);
                this.commitPeek();
                break;
            }
            else if (ch === '\\') {
                this._cursor++;
                if (this.peekChar() === '\n') {
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
    };
    SdlReader.prototype.readNumberOrDateOrTimeOrTimespan = function () {
        var start = this._cursor;
        this.nextChar();
        while (!this.isEof()) {
            var ch = this.peekChar().toLowerCase();
            if (ch.match(/[0-9.]/)) {
                this.commitPeek();
                continue;
            }
            else if (ch === ':') {
                this._cursor = start;
                this.readTime();
                return;
            }
            else if (ch === '/') {
                this._cursor = start;
                this.readDateOrDateTime();
                return;
            }
            else if (ch.match(/[\s\t\n]/)) {
                var slice_1 = this._input.slice(start, this._cursor);
                this._token = { type: SdlTokenType.NumberInt32, asNumber: parseInt(slice_1, 10), line: this._line, column: this._column, text: slice_1 };
                return;
            }
            else if (ch === 'l') {
                var slice_2 = this._input.slice(start, this._cursor);
                this._token = { type: SdlTokenType.NumberInt64, asNumber: parseInt(slice_2, 10), line: this._line, column: this._column, text: slice_2 };
                this.commitPeek();
                return;
            }
            else if (ch === 'f') {
                var slice_3 = this._input.slice(start, this._cursor);
                this._token = { type: SdlTokenType.NumberFloat32, asNumber: parseFloat(slice_3), line: this._line, column: this._column, text: slice_3 };
                this.commitPeek();
                return;
            }
            else if (ch === 'd') {
                var slice_4 = this._input.slice(start, this._cursor);
                this._token = { type: SdlTokenType.NumberFloat64, asNumber: parseFloat(slice_4), line: this._line, column: this._column, text: slice_4 };
                this.commitPeek();
                if (!this.isEof() && this.peekChar() === ':') {
                    this._cursor = start;
                    this.readTime();
                }
                return;
            }
            else if (ch === 'b') {
                this.commitPeek();
                var nextCh = this.peekChar();
                if (nextCh !== 'd' && nextCh !== 'D')
                    throw new Error("Expected 'd' or 'D' following 'b' or 'B' 128-bit float suffix, but got: " + nextCh);
                var slice_5 = this._input.slice(start, this._cursor - 1);
                this._token = { type: SdlTokenType.NumberFloat128, asNumber: parseFloat(slice_5), line: this._line, column: this._column, text: slice_5 };
                this.commitPeek();
                return;
            }
            else
                throw new Error("Unexpected character when parsing number/date/time: '" + ch + "'");
        }
        var slice = this._input.slice(start, this._cursor);
        this._token = { type: SdlTokenType.NumberInt32, asNumber: parseInt(slice, 10), line: this._line, column: this._column, text: slice };
    };
    SdlReader.prototype.readTime = function () {
        var _this = this;
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
        var startCursor = this._cursor;
        var ch = this.peekChar();
        var isNegative = ch === '-';
        if (isNegative)
            this.commitPeek();
        var hitColon = false;
        var hitDot = false;
        var readToColonOrSpaceOrEndOrDot = function () {
            hitColon = false;
            hitDot = false;
            var start = _this._cursor;
            var result = "";
            while (!_this.isEof()) {
                var currentCh = _this.peekChar();
                if (currentCh.match(/[: \t\n.]/)) {
                    hitColon = currentCh === ':';
                    hitDot = currentCh === '.';
                    result = _this._input.slice(start, _this._cursor);
                    if (!currentCh.match(/[ \n\t]/))
                        _this.commitPeek();
                    return result;
                }
                _this.commitPeek();
            }
            return _this._input.slice(start, _this._cursor);
        };
        function toInt(number, unit) {
            var value = 0;
            if (number.length === 0)
                throw new Error("No value provided for timespan " + unit);
            if (isNaN(value = parseInt(number)))
                throw new Error("Invalid timespan " + unit + " value: " + number);
            return value;
        }
        var enforceHitColon = function () {
            if (!hitColon)
                throw new Error("Expected colon");
        };
        var readResult = readToColonOrSpaceOrEndOrDot();
        enforceHitColon();
        if (readResult.endsWith("d")) {
            var slicedResult = readResult.slice(0, -1);
            this._token.days = toInt(slicedResult, "days");
            readResult = null;
        }
        if (readResult === null)
            readResult = readToColonOrSpaceOrEndOrDot();
        enforceHitColon();
        this._token.hours = toInt(readResult, "hours");
        readResult = readToColonOrSpaceOrEndOrDot();
        enforceHitColon();
        this._token.minutes = toInt(readResult, "minutes");
        readResult = readToColonOrSpaceOrEndOrDot();
        this._token.seconds = toInt(readResult, "seconds");
        if (hitDot) {
            readResult = readToColonOrSpaceOrEndOrDot();
            this._token.milliseconds = toInt(readResult, "milliseconds");
        }
        this._token.isNegative = isNegative;
        this._token.text = this._input.slice(startCursor, this._cursor);
    };
    SdlReader.prototype.readDateOrDateTime = function () {
        this._token = {
            type: SdlTokenType.DateTime,
            asDate: new Date(),
            column: this._column,
            line: this._line,
            text: ''
        };
        var REQUIRED_CHARS = "yyyy/mm/dd".length;
        if (this._cursor + REQUIRED_CHARS > this._input.length)
            throw new Error("Expected " + REQUIRED_CHARS + " available characters for Date, but reached EOF. Format must be yyyy/mm/dd");
        var start = this._cursor;
        this._cursor += REQUIRED_CHARS;
        var end = this._cursor;
        this.skipSpacesAndTabs();
        var hasColon = false;
        var hyphenCursor = 0;
        while (!this.isEof()) {
            var ch = this.peekChar();
            if (ch.match(/[ \n\t]/))
                break;
            this._cursor += this._lastPeekCharsRead;
            hasColon = hasColon || ch === ':';
            if (ch === '-' && hyphenCursor === 0)
                hyphenCursor = this._cursor;
        }
        if (hasColon)
            end = (hyphenCursor > 0) ? hyphenCursor - 1 : this._cursor;
        else
            this._cursor = end;
        var timeSlice = this._input.slice(start, end);
        var dateTime = new Date(timeSlice);
        if (isNaN(dateTime.getTime()))
            throw new Error("Invalid DateTime value: " + timeSlice);
        this._token.type = (hasColon) ? SdlTokenType.DateTime : SdlTokenType.Date;
        this._token.text = this._input.slice(start, this._cursor);
        if (hyphenCursor > 0) {
            var timezoneSlice = this._input.slice(hyphenCursor, this._cursor);
            var match = timezoneSlice.match(/GMT([+-]?)(\d?\d?:?\d?\d?)/);
            if (!match || (match[2].length > 0 && match[1].length === 0))
                throw new Error("Invalid timezone within DateTime, only supported format (for now!) is: -GMT+/-nn:nn and -GMT");
            var timeMatch = void 0;
            var timezone = 0;
            if (match[2].match(/^\d?\d$/))
                timezone = (1000 * 60 * 60 * parseInt(match[2]));
            else if ((timeMatch = match[2].match(/(\d?\d):(\d?\d)/))) {
                timezone = (+(1000 * 60 * 60 * parseInt(timeMatch[1]))
                    + (1000 * 60 * parseInt(timeMatch[2])));
            }
            else if (match[2].length !== 0)
                throw new Error("Invalid timezone within DateTime, use 'hh' or 'hh:mm' format. Bad format: " + match[2]);
            if (match[1] === '-')
                timezone *= -1;
            dateTime = new Date(dateTime.getTime() + timezone);
        }
        this._token.asDate = dateTime;
        var delta = this._cursor - start;
        this._cursor = start;
        this._cursor += delta;
        this._column += delta;
    };
    SdlReader.prototype.isCommentStartChar = function (ch) {
        return ch === '#' || ch === '-' || ch === '/';
    };
    SdlReader.prototype.peekChar = function (options) {
        if (options === void 0) { options = SdlReadCharOptions.None; }
        var ch = this._input[this._cursor];
        this._lastPeekNewLineCount = 0;
        this._lastPeekCharsRead = 1;
        this._lastPeekEscaped = false;
        if (ch === '\r') {
            if (this._cursor + 1 >= this._input.length || this._input[this._cursor + 1] !== '\n')
                throw new Error("Stray carriage return - no line feed character following it.");
            ch = '\n';
            this._lastPeekCharsRead = 2;
            this._lastPeekNewLineCount = 1;
            this._lastPeekNewLineCursor = this._cursor + 1;
        }
        else if (ch === '\n') {
            this._lastPeekNewLineCount++;
            this._lastPeekNewLineCursor = this._cursor;
        }
        else if (ch === '\\') {
            if (options & SdlReadCharOptions.CanEscapeNewLines) {
                var startCursor = this._cursor;
                this._cursor++;
                var oldCharsRead = this._lastPeekCharsRead;
                var oldNewLinesRead = this._lastPeekNewLineCount;
                var nextCh = this.peekChar(options);
                if (nextCh === '\n') {
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
            if (options & SdlReadCharOptions.CanEscapeStringChars) {
                if (this._cursor + 1 >= this._input.length)
                    throw new Error("Unexpected EOF after initial escape backslash");
                var nextCh = this._input[this._cursor + 1];
                this._lastPeekCharsRead = 2;
                this._lastPeekEscaped = true;
                switch (nextCh) {
                    case 'n':
                        ch = '\n';
                        break;
                    case 't':
                        ch = '\t';
                        break;
                    case 'r':
                        ch = '\r';
                        break;
                    case '"':
                        ch = '"';
                        break;
                    case '\\':
                        ch = '\\';
                        break;
                    default:
                        this._lastPeekEscaped = false;
                        break;
                }
                if (this._lastPeekEscaped)
                    return ch;
            }
        }
        return ch;
    };
    SdlReader.prototype.commitPeek = function () {
        this._cursor += this._lastPeekCharsRead;
        if (this._lastPeekNewLineCount > 0) {
            this._line += this._lastPeekNewLineCount;
            this._column = this._cursor - this._lastPeekNewLineCursor;
        }
    };
    SdlReader.prototype.nextChar = function (options) {
        if (options === void 0) { options = SdlReadCharOptions.None; }
        var ch = this.peekChar(options);
        this.commitPeek();
        return ch;
    };
    SdlReader.prototype.isEof = function () {
        return this._cursor >= this._input.length;
    };
    SdlReader.prototype.skipSpacesAndTabs = function () {
        while (!this.isEof()) {
            var ch = this.peekChar();
            if (ch !== ' ' && ch !== '\t')
                break;
            this.commitPeek();
        }
    };
    SdlReader.prototype.readToEndOrChar = function (expected) {
        this._lastReadEndCursor = this._cursor;
        while (!this.isEof()) {
            var ch = this.peekChar();
            if (ch === expected)
                break;
            this.commitPeek();
            this._lastReadEndCursor = this._cursor;
        }
    };
    SdlReader.prototype.readToEndOrAnyChar = function () {
        var expected = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            expected[_i] = arguments[_i];
        }
        while (!this.isEof()) {
            var ch = this.peekChar();
            if (expected.includes(ch))
                break;
            this.commitPeek();
        }
    };
    return SdlReader;
}());
export { SdlReader };
//# sourceMappingURL=lexer.js.map