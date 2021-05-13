import { SdlTag } from "./tag";
import { SdlAttribute } from "./attribute";
var AstSdlTokenVisitor = (function () {
    function AstSdlTokenVisitor() {
        this._parentStack = [];
        this._currentNode = null;
    }
    AstSdlTokenVisitor.prototype.reset = function () {
        this._parentStack = [];
        this._parentStack.push(new SdlTag("root"));
        this._currentNode = null;
    };
    AstSdlTokenVisitor.prototype.visitOpenBlock = function () {
        if (this._currentNode === null)
            throw new Error("Anonymous blocks are not supported.");
        this._parentStack.push(this._currentNode);
    };
    AstSdlTokenVisitor.prototype.visitCloseBlock = function () {
        if (this._parentStack.length === 1)
            throw new Error("Stray '}'. We are not inside an open block (started by '{').");
        this._currentNode = null;
        this._parentStack.pop();
    };
    AstSdlTokenVisitor.prototype.visitComment = function (_commentText) {
    };
    AstSdlTokenVisitor.prototype.visitStartTag = function (qualifiedName, _namespace, _name) {
        this._currentNode = new SdlTag(qualifiedName);
        this._parentStack[this._parentStack.length - 1].children.push(this._currentNode);
    };
    AstSdlTokenVisitor.prototype.visitEndOfFile = function () {
        if (this._parentStack.length !== 1)
            throw new Error("Tag " + this._parentStack[this._parentStack.length - 1].qualifiedName + " does not have a closing bracket '}'");
    };
    AstSdlTokenVisitor.prototype.visitNewValue = function (value) {
        var _a;
        (_a = this._currentNode) === null || _a === void 0 ? void 0 : _a.values.push(value);
    };
    AstSdlTokenVisitor.prototype.visitNewAttribute = function (value, qualifiedName, _namespace, _name) {
        if (this._currentNode === null)
            throw new Error("Attributes cannot be attached to anonymous tags.");
        if (this._currentNode.hasAttributeCalled(qualifiedName))
            throw new Error("Tag " + this._currentNode.qualifiedName + " already has an attribute called " + qualifiedName);
        this._currentNode.attributes[qualifiedName] = new SdlAttribute(qualifiedName, value);
    };
    Object.defineProperty(AstSdlTokenVisitor.prototype, "rootNode", {
        get: function () {
            if (this._parentStack.length !== 1)
                throw new Error("This visitor hasn't parsed anything yet, or the parsing failed as the root node isn't on top.");
            return this._parentStack[0];
        },
        enumerable: false,
        configurable: true
    });
    return AstSdlTokenVisitor;
}());
export { AstSdlTokenVisitor };
//# sourceMappingURL=ast_visitor.js.map