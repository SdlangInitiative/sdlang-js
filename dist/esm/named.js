var SdlNamedBased = (function () {
    function SdlNamedBased(_qualifiedName) {
        this._qualifiedName = _qualifiedName;
        this.qualifiedName = _qualifiedName;
    }
    Object.defineProperty(SdlNamedBased.prototype, "qualifiedName", {
        get: function () {
            return this._qualifiedName;
        },
        set: function (value) {
            var index = value.indexOf(':');
            if (index >= 0)
                this._namespaceColonIndex = index;
            this._qualifiedName = value;
            this._name = undefined;
            this._namespace = undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlNamedBased.prototype, "name", {
        get: function () {
            if (this._name)
                return this._name;
            else if (this._namespaceColonIndex !== undefined) {
                var index = this._namespaceColonIndex + 1;
                this._name = this._qualifiedName.slice(index);
            }
            else
                this._name = this._qualifiedName;
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SdlNamedBased.prototype, "namespace", {
        get: function () {
            if (this._namespace)
                return this._namespace;
            else if (this._namespaceColonIndex !== undefined) {
                this._namespace = this._qualifiedName.slice(0, this._namespaceColonIndex);
                return this._namespace;
            }
            return "";
        },
        enumerable: false,
        configurable: true
    });
    return SdlNamedBased;
}());
export { SdlNamedBased };
//# sourceMappingURL=named.js.map