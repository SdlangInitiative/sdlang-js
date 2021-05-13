import { SdlValue } from "./value";
import { SdlReader } from "./lexer";
export interface ISdlTokenVisitor {
    reset(): void;
    visitOpenBlock(): void;
    visitCloseBlock(): void;
    visitComment(commentText: string): void;
    visitStartTag(qualifiedName: string, namespace: string, name: string): void;
    visitEndOfFile(): void;
    visitNewValue(value: SdlValue): void;
    visitNewAttribute(value: SdlValue, qualifiedName: string, namespace: string, name: string): void;
}
export declare function parseAndVisit(reader: SdlReader, visitor: ISdlTokenVisitor): void;
//# sourceMappingURL=pusher.d.ts.map