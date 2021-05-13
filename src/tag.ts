import { SdlValue, SdlAttribute, SdlTimeSpan } from "./index";
import { SdlNamedBased } from "./named";
import { SdlValueType } from "./value";

// I'm not particularly bothered about keeping this overly readable, since:
//  1. You can look at SdlangSharp's code if you want the commented, readable (citation needed) version.
//  2. This is very boilerplate-esque & straightforward code that will pretty much never change.
//  3. Who's even going to look at my shitty library code anyway.

export class SdlTag extends SdlNamedBased
{
    private _children : SdlTag[];
    public get children() : SdlTag[] {
        return this._children;
    }
    public set children(v : SdlTag[]) {
        this._children = v;
    }
    
    private _attributes : Record<string, SdlAttribute>;
    public get attributes() : Record<string, SdlAttribute> {
        return this._attributes;
    }
    public set attributes(v : Record<string, SdlAttribute>) {
        this._attributes = v;
    }
    
    private _values : SdlValue[];
    public get values() : SdlValue[] {
        return this._values;
    }
    public set values(v : SdlValue[]) {
        this._values = v;
    }

    constructor(qualifiedName: string)
    {
        super(qualifiedName);
        this._children = [];
        this._attributes = {};
        this._values = [];
    }

    public hasValueAt(valueIndex: number)  : boolean { return valueIndex < this.values.length; }
    public hasAttributeCalled(name: string): boolean { return name in this.attributes; }
    public hasChildAt(childIndex: number)  : boolean { return childIndex < this.children.length; }
    public hasChildCalled(name: string)    : boolean { return this.children.find(c => c.qualifiedName === name) !== undefined; }

    public getChildrenCalled(name: string) : SdlTag[] { return this.children.filter(c => c.qualifiedName === name); }

    public getValue(valueIndex: number)         : SdlValue    { return this.values[valueIndex]; }
    public getValueNumber(valueIndex: number)   : number      { return this.values[valueIndex].number; }
    public getValueBoolean(valueIndex: number)  : boolean     { return this.values[valueIndex].boolean; }
    public getValueBinary(valueIndex: number)   : string      { return this.values[valueIndex].binary; }
    public getValueString(valueIndex: number)   : string      { return this.values[valueIndex].string; }
    public getValueDateTime(valueIndex: number) : Date        { return this.values[valueIndex].dateTime; }
    public getValueTimeSpan(valueIndex: number) : SdlTimeSpan { return this.values[valueIndex].timeSpan; }

    public getValueOrDefault(valueIndex: number, defaultValue : SdlValue | null = null)           : SdlValue | null     { return (valueIndex >= this._values.length) ? defaultValue : this._values[valueIndex]; }
    public getValueNumberOrDefault(valueIndex: number, defaultValue = 0)                          : number              { return this.getValueOrDefault(valueIndex)?.number ?? defaultValue; }
    public getValueBooleanOrDefault(valueIndex: number, defaultValue = false)                     : boolean             { return this.getValueOrDefault(valueIndex)?.boolean ?? defaultValue; }
    public getValueBinaryOrDefault(valueIndex: number, defaultValue: string | null = null)        : string | null       { return this.getValueOrDefault(valueIndex)?.binary ?? defaultValue; }
    public getValueStringOrDefault(valueIndex: number, defaultValue = "")                         : string              { return this.getValueOrDefault(valueIndex)?.string ?? defaultValue; }
    public getValueDateTimeOrDefault(valueIndex: number, defaultValue: Date | null = null)        : Date | null         { return this.getValueOrDefault(valueIndex)?.dateTime ?? defaultValue; }
    public getValueTimeSpanOrDefault(valueIndex: number, defaultValue: SdlTimeSpan | null = null) : SdlTimeSpan | null  { return this.getValueOrDefault(valueIndex)?.timeSpan ?? defaultValue; }

    public getAttribute(attribName: string)         : SdlAttribute{ return this._attributes[attribName];}
    public getAttributeValue(attribName: string)    : SdlValue    { return this._attributes[attribName].value; }
    public getAttributeNumber(attribName: string)   : number      { return this._attributes[attribName].value.number; }
    public getAttributeBoolean(attribName: string)  : boolean     { return this._attributes[attribName].value.boolean; }
    public getAttributeBinary(attribName: string)   : string      { return this._attributes[attribName].value.binary; }
    public getAttributeString(attribName: string)   : string      { return this._attributes[attribName].value.string; }
    public getAttributeDateTime(attribName: string) : Date        { return this._attributes[attribName].value.dateTime; }
    public getAttributeTimeSpan(attribName: string) : SdlTimeSpan { return this._attributes[attribName].value.timeSpan; }

    public getAttributeValueOrDefault(attribName: string, defaultValue : SdlValue | null = null)      : SdlValue | null     { return !(attribName in this._attributes) ? defaultValue : this._attributes[attribName].value; }
    public getAttributeNumberOrDefault(attribName: string, defaultValue = 0)                          : number              { return this.getAttributeValueOrDefault(attribName)?.number ?? defaultValue; }
    public getAttributeBooleanOrDefault(attribName: string, defaultValue = false)                     : boolean             { return this.getAttributeValueOrDefault(attribName)?.boolean ?? defaultValue; }
    public getAttributeBinaryOrDefault(attribName: string, defaultValue: string | null = null)        : string | null       { return this.getAttributeValueOrDefault(attribName)?.binary ?? defaultValue; }
    public getAttributeStringOrDefault(attribName: string, defaultValue = "")                         : string              { return this.getAttributeValueOrDefault(attribName)?.string ?? defaultValue; }
    public getAttributeDateTimeOrDefault(attribName: string, defaultValue: Date | null = null)        : Date | null         { return this.getAttributeValueOrDefault(attribName)?.dateTime ?? defaultValue; }
    public getAttributeTimeSpanOrDefault(attribName: string, defaultValue: SdlTimeSpan | null = null) : SdlTimeSpan | null  { return this.getAttributeValueOrDefault(attribName)?.timeSpan ?? defaultValue; }

    // This is the code for SdlAstToTextConverter.
    // It's easier in JS/TS land to just put it here I think.
    public toString(isRootNode = true, _indent = 0) : string
    {
        // jeez, I hope JS engines can optimise strings well.
        let output = "";

        writeTag(this);
        function writeTag(tag: SdlTag)
        {
            if(isRootNode)
            {
                isRootNode = false;
                _indent++;
                tag.children.forEach(c => writeTag(c));
                _indent--;
                return;
            }

            output += "    ".repeat(_indent); // 4 spaces per indent.

            if(tag.qualifiedName !== "content")
            {
                output += tag.qualifiedName;
                output += ' ';
            }

            tag.values.forEach(v => writeValue(v));
            for(const [_, attrib] of Object.entries(tag.attributes))
                writeAttribute(attrib);

            if(tag.children.length === 0)
            {
                output += '\n';
                return;
            }

            output += "{\n";

            _indent++;
            tag.children.forEach(c => writeTag(c));
            _indent--;

            output += "    ".repeat(_indent);
            output += "}\n";
        }

        function writeAttribute(attribute: SdlAttribute)
        {
            output += attribute.qualifiedName;
            output += '=';
            writeValue(attribute.value);
        }

        function writeValue(value: SdlValue)
        {
            switch(value.type)
            {
                case SdlValueType.Binary:
                    output += "/*TODO, sorry!*/";
                    output += value.binary;
                    break;

                case SdlValueType.Boolean:
                    output += value.boolean ? "true" : "false";
                    break;

                case SdlValueType.DateTime:
                    output += `${value.dateTime.getUTCFullYear().toString().padStart(4, '0')}/`
                        + `${(value.dateTime.getUTCMonth() + 1).toString().padStart(2, '0')}/`
                        + `${value.dateTime.getUTCDay().toString().padStart(2, '0')} `
                        + `${value.dateTime.getUTCHours().toString().padStart(2, '0')}:`
                        + `${value.dateTime.getUTCMinutes().toString().padStart(2, '0')}:`
                        + `${value.dateTime.getUTCSeconds().toString().padStart(2, '0')}.`
                        + `${value.dateTime.getUTCMilliseconds().toString().padStart(3, '0')}-GMT+0`
                    break;

                case SdlValueType.Null:
                    output += "null";
                    break;

                case SdlValueType.Number:
                    output += value.number.toString(10);
                    if(value.number % 1 === 0) // Int
                    {
                        if(value.number > 2147483647)
                            output += 'L';
                    }
                    else // Float
                    {
                        output += (value.number > 3.402823466E+38 || value.number < 1.175494351E-38)
                                  ? 'd' : 'f';
                    }
                    break;

                case SdlValueType.String:
                    output += `"${value.string}"`;
                    break;

                case SdlValueType.TimeSpan:
                    output += `${value.timeSpan.days}d:`
                        + `${value.timeSpan.hours.toString().padStart(2, '0')}:`
                        + `${value.timeSpan.minutes.toString().padStart(2, '0')}:`
                        + `${value.timeSpan.seconds.toString().padStart(2, '0')}`;
                    break;

                default: throw new Error(`Unhandled value type: ${value.type}`);
            }

            output += ' ';
        }
        
        return output;
    }
}