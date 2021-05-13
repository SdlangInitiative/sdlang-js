/* eslint-disable @typescript-eslint/no-unused-vars */
import { SdlTag } from "./tag";
import { SdlAttribute } from "./attribute";
import { ISdlTokenVisitor } from "./pusher";
import { SdlValue } from "./value";

export class AstSdlTokenVisitor implements ISdlTokenVisitor
{
    private _parentStack: SdlTag[];
    private _currentNode: SdlTag | null;

    constructor()
    {
        this._parentStack = [];
        this._currentNode = null;
    }

    reset(): void {
        this._parentStack = [];
        this._parentStack.push(new SdlTag("root"));
        this._currentNode = null;
    }

    visitOpenBlock(): void {
        if(this._currentNode === null)
            throw new Error("Anonymous blocks are not supported.");
        this._parentStack.push(this._currentNode);
    }

    visitCloseBlock(): void {
        if(this._parentStack.length === 1)
            throw new Error("Stray '}'. We are not inside an open block (started by '{').");
        this._currentNode = null;
        this._parentStack.pop();
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    visitComment(_commentText: string): void {
    }
    visitStartTag(qualifiedName: string, _namespace: string, _name: string): void {
        this._currentNode = new SdlTag(qualifiedName);
        this._parentStack[this._parentStack.length-1].children.push(this._currentNode);
    }
    visitEndOfFile(): void {
        if(this._parentStack.length !== 1)
            throw new Error(`Tag ${this._parentStack[this._parentStack.length-1].qualifiedName} does not have a closing bracket '}'`);
    }
    visitNewValue(value: SdlValue): void {
        this._currentNode?.values.push(value);
    }
    visitNewAttribute(value: SdlValue, qualifiedName: string, _namespace: string, _name: string): void {
        if(this._currentNode === null)
            throw new Error("Attributes cannot be attached to anonymous tags.");
        if(this._currentNode.hasAttributeCalled(qualifiedName))
            throw new Error(`Tag ${this._currentNode.qualifiedName} already has an attribute called ${qualifiedName}`);
        this._currentNode.attributes[qualifiedName] = new SdlAttribute(qualifiedName, value);
    }

    get rootNode() : SdlTag
    {
        if(this._parentStack.length !== 1)
            throw new Error("This visitor hasn't parsed anything yet, or the parsing failed as the root node isn't on top.");
        return this._parentStack[0];
    }
}