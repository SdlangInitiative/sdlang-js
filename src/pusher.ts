import { SdlReader, SdlValue, SdlTokenType } from "./index";

export interface ISdlTokenVisitor
{
    reset() : void;
    visitOpenBlock() : void;
    visitCloseBlock() : void;
    visitComment(commentText: string) : void;
    visitStartTag(qualifiedName: string, namespace: string, name: string) : void;
    visitEndOfFile() : void;
    visitNewValue(value: SdlValue) : void;
    visitNewAttribute(value: SdlValue, qualifiedName: string, namespace: string, name: string) : void;
}

const ANONYMOUS_TAG_NAME = "content";

export function parseAndVisit(reader: SdlReader, visitor: ISdlTokenVisitor) : void
{
    visitor.reset();

    let copy: SdlReader | null = null;
    let startOfLine = true;

    function valueAsSdlValue(reader: SdlReader) : SdlValue
    {
        switch(reader.token.type)
        {
            case SdlTokenType.Binary: throw new Error("TODO");
            case SdlTokenType.BooleanFalse: return SdlValue.fromFalse();
            case SdlTokenType.BooleanTrue: return SdlValue.fromTrue();
            case SdlTokenType.Date: return SdlValue.fromDateTime(reader.token.asDate);
            case SdlTokenType.DateTime: return SdlValue.fromDateTime(reader.token.asDate);
            case SdlTokenType.Null: return SdlValue.fromNull();
            case SdlTokenType.NumberFloat32:
            case SdlTokenType.NumberFloat64:
            case SdlTokenType.NumberFloat128:
            case SdlTokenType.NumberInt32:
            case SdlTokenType.NumberInt64:
                return SdlValue.fromNumber(reader.token.asNumber);
            case SdlTokenType.StringBackQuoted:
            case SdlTokenType.StringDoubleQuoted:
                return SdlValue.fromString(reader.token.text);
            case SdlTokenType.TimeSpan: 
                return SdlValue.fromTimeSpan({ 
                    days: reader.token.days,
                    hours: reader.token.hours,
                    minutes: reader.token.minutes,
                    seconds: reader.token.seconds,
                    milliseconds: reader.token.milliseconds
                });

            default: throw new Error(`Expected a value token, not a token of type ${reader.token.type}`);
        }
    }

    reader.read();
    while(reader.token.type !== SdlTokenType.EndOfFile)
    {
        switch(reader.token.type)
        {
            case SdlTokenType.Binary:
            case SdlTokenType.BooleanFalse:
            case SdlTokenType.BooleanTrue:
            case SdlTokenType.Date:
            case SdlTokenType.DateTime:
            case SdlTokenType.NumberFloat128:
            case SdlTokenType.NumberFloat32:
            case SdlTokenType.NumberFloat64:
            case SdlTokenType.NumberInt32:
            case SdlTokenType.NumberInt64:
            case SdlTokenType.StringBackQuoted:
            case SdlTokenType.StringDoubleQuoted:
            case SdlTokenType.TimeSpan:
                if(startOfLine)
                    visitor.visitStartTag(ANONYMOUS_TAG_NAME, "", ANONYMOUS_TAG_NAME);
                visitor.visitNewValue(valueAsSdlValue(reader));
                break;

            case SdlTokenType.BlockClose: visitor.visitCloseBlock(); break;
            case SdlTokenType.BlockOpen: visitor.visitOpenBlock(); break;
            case SdlTokenType.Comment: visitor.visitComment(reader.token.text); break;
            
            case SdlTokenType.EndOfLine:
                startOfLine = true;
                reader.read();
                continue;

            case SdlTokenType.Identifier:
                copy = reader.clone();
                copy.read();
                if(copy.token.type === SdlTokenType.Equals)
                {
                    if(startOfLine)
                        visitor.visitStartTag(ANONYMOUS_TAG_NAME, "", ANONYMOUS_TAG_NAME);

                    copy.read();
                    visitor.visitNewAttribute(valueAsSdlValue(copy), reader.token.text, reader.token.namespace, reader.token.name);

                    reader.read();
                    reader.read();
                    break;
                }
                if(startOfLine)
                {
                    visitor.visitStartTag(reader.token.text, reader.token.namespace, reader.token.name);
                    break;
                }
                throw new Error(`Orphaned identifier. Were you trying to make an attribute? Name = ${reader.token.text}`);

            default: throw new Error(`Unexpected token of type ${reader.token.type}`);
        }

        startOfLine = false;
        reader.read();
    }
    visitor.visitEndOfFile();
}