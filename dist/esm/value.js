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
export var SdlValueType;
(function (SdlValueType) {
    SdlValueType[SdlValueType["ERROR"] = 0] = "ERROR";
    SdlValueType[SdlValueType["Number"] = 1] = "Number";
    SdlValueType[SdlValueType["Boolean"] = 2] = "Boolean";
    SdlValueType[SdlValueType["Null"] = 3] = "Null";
    SdlValueType[SdlValueType["Binary"] = 4] = "Binary";
    SdlValueType[SdlValueType["String"] = 5] = "String";
    SdlValueType[SdlValueType["DateTime"] = 6] = "DateTime";
    SdlValueType[SdlValueType["TimeSpan"] = 7] = "TimeSpan";
})(SdlValueType || (SdlValueType = {}));
var SdlValue = (function () {
    function SdlValue(value) {
        if (typeof value !== "object")
            throw new Error("SdlValue.constructor can only take SdlValueUnion. Use the static constructors such as SdlValue.from, SdlValue.fromString, etc.");
        this._value = value;
    }
    SdlValue.fromTrue = function () { return new SdlValue({ type: SdlValueType.Boolean, value: true }); };
    SdlValue.fromFalse = function () { return new SdlValue({ type: SdlValueType.Boolean, value: false }); };
    SdlValue.fromBoolean = function (v) { return new SdlValue({ type: SdlValueType.Boolean, value: v }); };
    SdlValue.fromNull = function () { return new SdlValue({ type: SdlValueType.Null, value: null }); };
    SdlValue.fromNumber = function (v) { return new SdlValue({ type: SdlValueType.Number, value: v }); };
    SdlValue.fromBinary = function (v) { return new SdlValue({ type: SdlValueType.Binary, value: v }); };
    SdlValue.fromString = function (v) { return new SdlValue({ type: SdlValueType.String, value: v }); };
    SdlValue.fromDateTime = function (v) { return new SdlValue({ type: SdlValueType.DateTime, value: v }); };
    SdlValue.fromTimeSpan = function (v) { return new SdlValue({ type: SdlValueType.TimeSpan, value: v }); };
    SdlValue.from = function (v) {
        if (v === null)
            return SdlValue.fromNull();
        switch (typeof v) {
            case "string": return SdlValue.fromString(v);
            case "boolean": return SdlValue.fromBoolean(v);
            case "number": return SdlValue.fromNumber(v);
            case "object":
                if (v instanceof Date)
                    return SdlValue.fromDateTime(v);
                else if (v.days !== undefined)
                    return SdlValue.fromTimeSpan(v);
                throw new Error("Can't construct an SdlValue from object. Only Date and SdlTimeSpan objects are allowed: " + v);
            default: throw new Error("Can't construct an SdlValue from: " + v);
        }
    };
    Object.defineProperty(SdlValue.prototype, "number", {
        get: function () { return this.getValueEnforceType(this._value, SdlValueType.Number); },
        set: function (v) { this._value = { type: SdlValueType.Number, value: v }; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlValue.prototype, "boolean", {
        get: function () { return this.getValueEnforceType(this._value, SdlValueType.Boolean); },
        set: function (v) { this._value = { type: SdlValueType.Boolean, value: v }; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlValue.prototype, "null", {
        get: function () { return this.getValueEnforceType(this._value, SdlValueType.Null); },
        set: function (v) { this._value = { type: SdlValueType.Null, value: v }; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlValue.prototype, "binary", {
        get: function () { return this.getValueEnforceType(this._value, SdlValueType.Binary); },
        set: function (v) { this._value = { type: SdlValueType.Binary, value: v }; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlValue.prototype, "string", {
        get: function () { return this.getValueEnforceType(this._value, SdlValueType.String); },
        set: function (v) { this._value = { type: SdlValueType.String, value: v }; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlValue.prototype, "dateTime", {
        get: function () { return this.getValueEnforceType(this._value, SdlValueType.DateTime); },
        set: function (v) { this._value = { type: SdlValueType.DateTime, value: v }; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlValue.prototype, "timeSpan", {
        get: function () { return this.getValueEnforceType(this._value, SdlValueType.TimeSpan); },
        set: function (v) { this._value = { type: SdlValueType.TimeSpan, value: v }; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlValue.prototype, "type", {
        get: function () {
            return this._value.type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlValue.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (v) {
            this._value = v;
        },
        enumerable: false,
        configurable: true
    });
    SdlValue.prototype.clone = function () {
        switch (this._value.type) {
            case SdlValueType.Binary: return SdlValue.fromBinary(this._value.value);
            case SdlValueType.Boolean: return SdlValue.fromBoolean(this._value.value);
            case SdlValueType.DateTime: return SdlValue.fromDateTime(__assign({}, this._value.value));
            case SdlValueType.Null: return SdlValue.fromNull();
            case SdlValueType.Number: return SdlValue.fromNumber(this._value.value);
            case SdlValueType.String: return SdlValue.fromString(this._value.value);
            case SdlValueType.TimeSpan: return SdlValue.fromTimeSpan(__assign({}, this._value.value));
            default: throw new Error("Bug: This SdlValue is either uninitialised, or has a bad type: " + this.type);
        }
    };
    SdlValue.prototype.getValueEnforceType = function (union, type) {
        if (union.type !== type)
            throw new TypeError("I am not a " + type + ", I am: " + this.type);
        return union.value;
    };
    return SdlValue;
}());
export { SdlValue };
//# sourceMappingURL=value.js.map