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
import { SdlNamedBased } from "./named";
var SdlAttribute = (function (_super) {
    __extends(SdlAttribute, _super);
    function SdlAttribute(qualifiedName, _value) {
        var _this = _super.call(this, qualifiedName) || this;
        _this._value = _value;
        return _this;
    }
    Object.defineProperty(SdlAttribute.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (v) {
            this._value = v;
        },
        enumerable: false,
        configurable: true
    });
    return SdlAttribute;
}(SdlNamedBased));
export { SdlAttribute };
//# sourceMappingURL=attribute.js.map