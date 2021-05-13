import { SdlTag } from "./tag";
import { ISdlTokenVisitor } from "./pusher";
import { SdlValue } from "./value";
export declare class AstSdlTokenVisitor implements ISdlTokenVisitor {
    private _parentStack;
    private _currentNode;
    constructor();
    reset(): void;
    visitOpenBlock(): void;
    visitCloseBlock(): void;
    visitComment(_commentText: string): void;
    visitStartTag(qualifiedName: string, _namespace: string, _name: string): void;
    visitEndOfFile(): void;
    visitNewValue(value: SdlValue): void;
    visitNewAttribute(value: SdlValue, qualifiedName: string, _namespace: string, _name: string): void;
    get rootNode(): SdlTag;
}
//# sourceMappingURL=ast_visitor.d.ts.map