/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it } from "mocha"
import { assert } from "chai"
import { SdlReader, ISdlTokenVisitor, parseAndVisit, SdlValue } from "../src/index"

enum VisitType
{
    ERROR,
    OpenBlock,
    CloseBlock,
    Comment,
    StartTag,
    NewValue,
    NewAttribute,
    EndOfFile
}

class AssertingVisitor implements ISdlTokenVisitor
{
    constructor(private _expected: VisitType[])
    {
    }

    private assertIsExpected(type: VisitType)
    {
        assert.isNotEmpty(this._expected);
        const expected = this._expected[0];
        this._expected = this._expected.slice(1);
        assert.equal(expected, type);
    }

    public assertIsEmpty()
    {
        assert.isEmpty(this._expected);
    }

    reset(): void {}
    visitOpenBlock(): void { this.assertIsExpected(VisitType.OpenBlock) }
    visitCloseBlock(): void { this.assertIsExpected(VisitType.CloseBlock) }
    visitComment(_commentText: string): void { this.assertIsExpected(VisitType.Comment) }
    visitStartTag(_qualifiedName: string, _namespace: string, _name: string): void { this.assertIsExpected(VisitType.StartTag) }
    visitEndOfFile(): void { this.assertIsExpected(VisitType.EndOfFile) }
    visitNewValue(_value: SdlValue): void { this.assertIsExpected(VisitType.NewValue) }
    visitNewAttribute(_value: SdlValue, _qualifiedName: string, _namespace: string, _name: string): void {
        this.assertIsExpected(VisitType.NewAttribute);
    }
}

function assertCorrectVisit(code: string, expectedTypes: VisitType[])
{
    const reader = new SdlReader(code);
    const visitor = new AssertingVisitor(expectedTypes);
    parseAndVisit(reader, visitor);
    visitor.assertIsEmpty();
}

describe("Pusher", () => {
    it("should parse a single tag", () => {
        assertCorrectVisit("some:tag", [VisitType.StartTag, VisitType.EndOfFile]);
    });

    [
        "tag:one ; tag:two",
        "tag:one\ntag:two"
    ].forEach(value => {
        it("should parse multiple tags across lines", () => {
            assertCorrectVisit(value, [ VisitType.StartTag, VisitType.StartTag, VisitType.EndOfFile ]);
        });
    });

    [
        "\"value\"",
        "`value`",
        "69",
        "420.0f",
        "true",
        "1111/11/11",
        "1111/11/11 11:11:11-GMT+01",
        "1d:11:11:11"
    ].forEach(value => {
        it(`should parse anonymous tag value ${value}`, () => {
            assertCorrectVisit(value, [ VisitType.StartTag, VisitType.NewValue, VisitType.EndOfFile ]);
        });
    });

    it("should parse complex tag with children", () => {
        assertCorrectVisit(
            "tag with=`children` on {\nchild with:value=420\nchild with:value=off\n}",
            [
                VisitType.StartTag, VisitType.NewAttribute, VisitType.NewValue, 
                VisitType.OpenBlock,
                    VisitType.StartTag, VisitType.NewAttribute,
                    VisitType.StartTag, VisitType.NewAttribute,
                VisitType.CloseBlock,
                VisitType.EndOfFile
            ]
        );
    });

    [
        "# comment\ntag\n# comment\ntag",
        "-- comment\ntag\n-- comment\ntag",
        "// comment\ntag\n// comment\ntag",
        "/* comment*/\ntag\n/* comment*/\ntag",
        "//\ntag /* comment*/\ntag"
    ].forEach(value => {
        it("should parse comments mixed with tags", () => {
            assertCorrectVisit(value, [ VisitType.Comment, VisitType.StartTag, VisitType.Comment, VisitType.StartTag, VisitType.EndOfFile ]);
        });
    });
});