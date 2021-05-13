var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { SdlNamedBased } from "./named";
import { SdlValueType } from "./value";
var SdlTag = (function (_super) {
    __extends(SdlTag, _super);
    function SdlTag(qualifiedName, init) {
        var _a, _b, _c;
        var _this = _super.call(this, qualifiedName) || this;
        _this._children = (_a = init === null || init === void 0 ? void 0 : init.children) !== null && _a !== void 0 ? _a : [];
        _this._values = (_b = init === null || init === void 0 ? void 0 : init.values) !== null && _b !== void 0 ? _b : [];
        _this._attributes = (_c = init === null || init === void 0 ? void 0 : init.attributes) !== null && _c !== void 0 ? _c : {};
        return _this;
    }
    Object.defineProperty(SdlTag.prototype, "children", {
        get: function () {
            return this._children;
        },
        set: function (v) {
            this._children = v;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlTag.prototype, "attributes", {
        get: function () {
            return this._attributes;
        },
        set: function (v) {
            this._attributes = v;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlTag.prototype, "values", {
        get: function () {
            return this._values;
        },
        set: function (v) {
            this._values = v;
        },
        enumerable: false,
        configurable: true
    });
    SdlTag.prototype.hasValueAt = function (valueIndex) { return valueIndex < this.values.length; };
    SdlTag.prototype.hasAttributeCalled = function (name) { return name in this.attributes; };
    SdlTag.prototype.hasChildAt = function (childIndex) { return childIndex < this.children.length; };
    SdlTag.prototype.hasChildCalled = function (name) { return this.children.find(function (c) { return c.qualifiedName === name; }) !== undefined; };
    SdlTag.prototype.getChildrenCalled = function (name) { return this.children.filter(function (c) { return c.qualifiedName === name; }); };
    SdlTag.prototype.getValue = function (valueIndex) { return this.values[valueIndex]; };
    SdlTag.prototype.getValueNumber = function (valueIndex) { return this.values[valueIndex].number; };
    SdlTag.prototype.getValueBoolean = function (valueIndex) { return this.values[valueIndex].boolean; };
    SdlTag.prototype.getValueBinary = function (valueIndex) { return this.values[valueIndex].binary; };
    SdlTag.prototype.getValueString = function (valueIndex) { return this.values[valueIndex].string; };
    SdlTag.prototype.getValueDateTime = function (valueIndex) { return this.values[valueIndex].dateTime; };
    SdlTag.prototype.getValueTimeSpan = function (valueIndex) { return this.values[valueIndex].timeSpan; };
    SdlTag.prototype.getValueOrDefault = function (valueIndex, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        return (valueIndex >= this._values.length) ? defaultValue : this._values[valueIndex];
    };
    SdlTag.prototype.getValueNumberOrDefault = function (valueIndex, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = 0; }
        return (_b = (_a = this.getValueOrDefault(valueIndex)) === null || _a === void 0 ? void 0 : _a.number) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.getValueBooleanOrDefault = function (valueIndex, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = false; }
        return (_b = (_a = this.getValueOrDefault(valueIndex)) === null || _a === void 0 ? void 0 : _a.boolean) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.getValueBinaryOrDefault = function (valueIndex, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = null; }
        return (_b = (_a = this.getValueOrDefault(valueIndex)) === null || _a === void 0 ? void 0 : _a.binary) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.getValueStringOrDefault = function (valueIndex, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = ""; }
        return (_b = (_a = this.getValueOrDefault(valueIndex)) === null || _a === void 0 ? void 0 : _a.string) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.getValueDateTimeOrDefault = function (valueIndex, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = null; }
        return (_b = (_a = this.getValueOrDefault(valueIndex)) === null || _a === void 0 ? void 0 : _a.dateTime) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.getValueTimeSpanOrDefault = function (valueIndex, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = null; }
        return (_b = (_a = this.getValueOrDefault(valueIndex)) === null || _a === void 0 ? void 0 : _a.timeSpan) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.getAttribute = function (attribName) { return this._attributes[attribName]; };
    SdlTag.prototype.getAttributeValue = function (attribName) { return this._attributes[attribName].value; };
    SdlTag.prototype.getAttributeNumber = function (attribName) { return this._attributes[attribName].value.number; };
    SdlTag.prototype.getAttributeBoolean = function (attribName) { return this._attributes[attribName].value.boolean; };
    SdlTag.prototype.getAttributeBinary = function (attribName) { return this._attributes[attribName].value.binary; };
    SdlTag.prototype.getAttributeString = function (attribName) { return this._attributes[attribName].value.string; };
    SdlTag.prototype.getAttributeDateTime = function (attribName) { return this._attributes[attribName].value.dateTime; };
    SdlTag.prototype.getAttributeTimeSpan = function (attribName) { return this._attributes[attribName].value.timeSpan; };
    SdlTag.prototype.getAttributeValueOrDefault = function (attribName, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        return !(attribName in this._attributes) ? defaultValue : this._attributes[attribName].value;
    };
    SdlTag.prototype.getAttributeNumberOrDefault = function (attribName, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = 0; }
        return (_b = (_a = this.getAttributeValueOrDefault(attribName)) === null || _a === void 0 ? void 0 : _a.number) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.getAttributeBooleanOrDefault = function (attribName, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = false; }
        return (_b = (_a = this.getAttributeValueOrDefault(attribName)) === null || _a === void 0 ? void 0 : _a.boolean) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.getAttributeBinaryOrDefault = function (attribName, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = null; }
        return (_b = (_a = this.getAttributeValueOrDefault(attribName)) === null || _a === void 0 ? void 0 : _a.binary) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.getAttributeStringOrDefault = function (attribName, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = ""; }
        return (_b = (_a = this.getAttributeValueOrDefault(attribName)) === null || _a === void 0 ? void 0 : _a.string) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.getAttributeDateTimeOrDefault = function (attribName, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = null; }
        return (_b = (_a = this.getAttributeValueOrDefault(attribName)) === null || _a === void 0 ? void 0 : _a.dateTime) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.getAttributeTimeSpanOrDefault = function (attribName, defaultValue) {
        var _a, _b;
        if (defaultValue === void 0) { defaultValue = null; }
        return (_b = (_a = this.getAttributeValueOrDefault(attribName)) === null || _a === void 0 ? void 0 : _a.timeSpan) !== null && _b !== void 0 ? _b : defaultValue;
    };
    SdlTag.prototype.toString = function (isRootNode, _indent) {
        if (isRootNode === void 0) { isRootNode = true; }
        if (_indent === void 0) { _indent = 0; }
        var output = "";
        writeTag(this);
        function writeTag(tag) {
            var e_1, _a;
            if (isRootNode) {
                isRootNode = false;
                _indent++;
                tag.children.forEach(function (c) { return writeTag(c); });
                _indent--;
                return;
            }
            output += "    ".repeat(_indent);
            if (tag.qualifiedName !== "content") {
                output += tag.qualifiedName;
                output += ' ';
            }
            tag.values.forEach(function (v) { return writeValue(v); });
            try {
                for (var _b = __values(Object.entries(tag.attributes)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = __read(_c.value, 2), _ = _d[0], attrib = _d[1];
                    writeAttribute(attrib);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (tag.children.length === 0) {
                output += '\n';
                return;
            }
            output += "{\n";
            _indent++;
            tag.children.forEach(function (c) { return writeTag(c); });
            _indent--;
            output += "    ".repeat(_indent);
            output += "}\n";
        }
        function writeAttribute(attribute) {
            output += attribute.qualifiedName;
            output += '=';
            writeValue(attribute.value);
        }
        function writeValue(value) {
            switch (value.type) {
                case SdlValueType.Binary:
                    output += "/*TODO, sorry!*/";
                    output += value.binary;
                    break;
                case SdlValueType.Boolean:
                    output += value.boolean ? "true" : "false";
                    break;
                case SdlValueType.DateTime:
                    output += value.dateTime.getUTCFullYear().toString().padStart(4, '0') + "/"
                        + ((value.dateTime.getUTCMonth() + 1).toString().padStart(2, '0') + "/")
                        + (value.dateTime.getUTCDay().toString().padStart(2, '0') + " ")
                        + (value.dateTime.getUTCHours().toString().padStart(2, '0') + ":")
                        + (value.dateTime.getUTCMinutes().toString().padStart(2, '0') + ":")
                        + (value.dateTime.getUTCSeconds().toString().padStart(2, '0') + ".")
                        + (value.dateTime.getUTCMilliseconds().toString().padStart(3, '0') + "-GMT+0");
                    break;
                case SdlValueType.Null:
                    output += "null";
                    break;
                case SdlValueType.Number:
                    output += value.number.toString(10);
                    if (value.number % 1 === 0) {
                        if (value.number > 2147483647)
                            output += 'L';
                    }
                    else {
                        output += (value.number > 3.402823466E+38 || value.number < 1.175494351E-38)
                            ? 'd' : 'f';
                    }
                    break;
                case SdlValueType.String:
                    output += "\"" + value.string + "\"";
                    break;
                case SdlValueType.TimeSpan:
                    output += value.timeSpan.days + "d:"
                        + (value.timeSpan.hours.toString().padStart(2, '0') + ":")
                        + (value.timeSpan.minutes.toString().padStart(2, '0') + ":")
                        + ("" + value.timeSpan.seconds.toString().padStart(2, '0'));
                    break;
                default: throw new Error("Unhandled value type: " + value.type);
            }
            output += ' ';
        }
        return output;
    };
    return SdlTag;
}(SdlNamedBased));
export { SdlTag };
//# sourceMappingURL=tag.js.map