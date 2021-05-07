/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it } from "mocha"
import { assert } from "chai"
import { SdlReader, SdlTokenType } from "../src/lexer"

// These tests are direct translations of the SdlangSharp ones.
// I want to keep both libraries in parity to each other.
//
// *very* technically I don't need to do this since the code should be identical,
// however there's no guarantee it actually *is* identical, so this is just safer to do.
describe("Lexer", () => 
{
    describe("Basic", () => {
        it("should parse EndOfFile", () => {
            const parser = new SdlReader("");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
        });
    
        it("should parse identifiers without a namespace", () => {
            const parser = new SdlReader("ello");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.Identifier);
            if(parser.token.type !== SdlTokenType.Identifier) throw ""; // Type guard.
            assert.strictEqual(parser.token.text, "ello");
            assert.strictEqual(parser.token.name, "ello");
            assert.isEmpty(parser.token.namespace);
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
        })

        it("should parse identifier with a namespace", () => {
            const parser = new SdlReader("el:lo");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.Identifier);
            if(parser.token.type !== SdlTokenType.Identifier) throw ""; // Type guard.
            assert.strictEqual(parser.token.text, "el:lo");
            assert.strictEqual(parser.token.namespace, "el");
            assert.strictEqual(parser.token.name, "lo");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
        })

        it("should parse identifiers with only a namespace", () => {
            const parser = new SdlReader("el:");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.Identifier);
            if(parser.token.type !== SdlTokenType.Identifier) throw ""; // Type guard.
            assert.strictEqual(parser.token.text, "el:");
            assert.strictEqual(parser.token.namespace, "el");
            assert.isEmpty(parser.token.name);
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
        });

        const commentSingleLineIsolated = [
            "# This is a comment",
            "-- This is a comment",
            "// This is a comment"
        ];
        commentSingleLineIsolated.forEach(value => {
            it(`should parse an isolated single-line comment for ${value[0]}`, () => {
                const parser = new SdlReader(value);
                parser.read();
                assert.strictEqual(parser.token.type, SdlTokenType.Comment);
                if(parser.token.type !== SdlTokenType.Comment) throw "";
                assert.strictEqual(parser.token.text, " This is a comment");
                parser.read();
                assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
            })
        });

        it("should parse an isolated multi-line comment on one line", () => {
            const parser = new SdlReader("/* This is a comment */");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.Comment);
            if(parser.token.type !== SdlTokenType.Comment) throw "";
            assert.strictEqual(parser.token.text, " This is a comment ");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
        });

        it("should parse a multi-line comment", () => {
            const parser = new SdlReader("/* \nThis\nis\na\ncomment\n */");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.Comment);
            if(parser.token.type !== SdlTokenType.Comment) throw "";
            assert.strictEqual(parser.token.text, " \nThis\nis\na\ncomment\n ");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
        });

        const stringSimple = [
            ["\"Sdlang Rocks!\"", SdlTokenType.StringDoubleQuoted],
            ["`Sdlang Rocks!`", SdlTokenType.StringBackQuoted]
        ];
        stringSimple.forEach(value => {
            it(`should parse strings on a single line for ${(value[0] as string)[0]}`, () => {
                const parser = new SdlReader(value[0] as string);
                parser.read();
                assert.strictEqual(parser.token.type, value[1]);
                if(parser.token.type !== SdlTokenType.StringBackQuoted && parser.token.type !== SdlTokenType.StringDoubleQuoted) throw "";
                assert.strictEqual(parser.token.text, "Sdlang Rocks!");
                parser.read();
                assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
            });
        });

        it("should parse a double quoted string across multiple lines", () => {
            const parser = new SdlReader("\"Hey \\\n   There lol\"");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.StringDoubleQuoted);
            if(parser.token.type !== SdlTokenType.StringDoubleQuoted) throw "";
            assert.strictEqual(parser.token.text, "Hey There lol");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
        });

        it("should parse a back quoted string across multiple lines", () => {
            const parser = new SdlReader("`Hey \\\n   There lol`");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.StringBackQuoted);
            if(parser.token.type !== SdlTokenType.StringBackQuoted) throw "";
            assert.strictEqual(parser.token.text, "Hey \\\n   There lol");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
        });

        it("should parse escaped new lines that use CRLF", () => {
            const parser = new SdlReader("\\\r\nb");
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.Identifier);
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
        })

        const operators = [
            { code: "{", expectedType: SdlTokenType.BlockOpen },
            { code: "}", expectedType: SdlTokenType.BlockClose },
            { code: "=", expectedType: SdlTokenType.Equals },
        ];
        operators.forEach(value => {
            it(`should parse operator ${value.code}`, () => {
                const parser = new SdlReader(value.code);
                parser.read();
                assert.strictEqual(parser.token.type, value.expectedType);
                parser.read();
                assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
            })
        });

        const keywords = [
            { code: "true", expectedType: SdlTokenType.BooleanTrue },
            { code: "on", expectedType: SdlTokenType.BooleanTrue },
            { code: "false", expectedType: SdlTokenType.BooleanFalse },
            { code: "off", expectedType: SdlTokenType.BooleanFalse },
            { code: "null", expectedType: SdlTokenType.Null },
        ];
        keywords.forEach(value => {
            it(`should parse keyword ${value.code}`, () => {
                const parser = new SdlReader(value.code);
                parser.read();
                assert.strictEqual(parser.token.type, value.expectedType);
                parser.read();
                assert.strictEqual(SdlTokenType.EndOfFile, parser.token.type);
            });
        });

        const base64 = [
            { code: "[]", value: "" },
            { code: "[lol\nyomama+\n==]", value: "lol\nyomama+\n==" }
        ];
        base64.forEach(value => {
            it("should parse base64", () => {
                
                const parser = new SdlReader(value.code);
                parser.read();
                assert.strictEqual(parser.token.type, SdlTokenType.Binary);
                assert.strictEqual((parser.token as any).text, value.value);
                parser.read();
                assert.strictEqual(SdlTokenType.EndOfFile, parser.token.type);
            })
        });

        const numbers = [
            { code: "0", expectedType: SdlTokenType.NumberInt32, expectedText: "0", expectedValue: 0 },
            { code: "-69", expectedType: SdlTokenType.NumberInt32, expectedText: "-69", expectedValue: -69 },
            { code: "420L", expectedType: SdlTokenType.NumberInt64, expectedText: "420", expectedValue: 420 },
            { code: "6.9f", expectedType: SdlTokenType.NumberFloat32, expectedText: "6.9", expectedValue: 6.9 },
            { code: "69F", expectedType: SdlTokenType.NumberFloat32, expectedText: "69", expectedValue: 69 },
            { code: "4.20d", expectedType: SdlTokenType.NumberFloat64, expectedText: "4.20", expectedValue: 4.20 },
            { code: "420D", expectedType: SdlTokenType.NumberFloat64, expectedText: "420", expectedValue: 420 },
            { code: "69.420bd", expectedType: SdlTokenType.NumberFloat128, expectedText: "69.420", expectedValue: 69.420 },
        ];
        numbers.forEach(value => {
            it(`should parse number ${value.code}`, () => {
                const parser = new SdlReader(value.code);
                const token = parser.read() as any;
                assert.deepStrictEqual({ a: token.text, b: token.type, c: token.asNumber }, { a: value.expectedText, b: value.expectedType, c: value.expectedValue });
                parser.read();
                assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
            })
        });

        it("Should parse dates", () => {
            const parser = new SdlReader("2021/03/25");
            const token = parser.read() as any;
            assert.strictEqual(token.type, SdlTokenType.Date);
            assert.strictEqual("2021/03/25", token.text);
            assert.strictEqual(token.asDate.getTime(), new Date("2021/03/25").getTime());
            parser.read();
            assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
        });

        const dateTime = [
            // code, year, month, day, hours, minutes, seconds, msecs
            ["2021/03/25 21:19",                    2021, 3, 25, 21, 19, 0, 0],
            ["2021/03/25 21:19:42",                 2021, 3, 25, 21, 19, 42, 0],
            ["2021/03/25 21:19:42.345",             2021, 3, 25, 21, 19, 42, 345],
            ["2021/03/25 21:19:42.345-GMT",         2021, 3, 25, 21, 19, 42, 345],
            ["2021/03/25 21:19:42.345-GMT+01",      2021, 3, 25, 22, 19, 42, 345],
            ["2021/03/25 21:19:42.345-GMT+01:00",   2021, 3, 25, 22, 19, 42, 345],
            ["2021/03/25 21:19:42.345-GMT-01:00",   2021, 3, 25, 20, 19, 42, 345],
        ];
        dateTime.forEach(valueOriginal => {
            const value = valueOriginal as any;
            it(`should parse DateTime ${value[0]}`, () => {
                const expectedTime = new Date(value[1], value[2]-1, value[3], value[4], value[5], value[6], value[7]);
                const parser = new SdlReader(value[0]);
                const token = parser.read() as any;
                assert.strictEqual(token.type, SdlTokenType.DateTime);
                assert.strictEqual(token.text, value[0]);
                assert.strictEqual(token.asDate.getTime(), expectedTime.getTime());
                parser.read();
                assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
            });
        });

        const time = [
            // code, days, hours, minutes, seconds, msecs, isNegative
            ["12:34:56",          0,  12, 34, 56, 0,   false],
            ["10d:12:34:56",      10, 12, 34, 56, 0,   false],
            ["10d:12:34:56.789",  10, 12, 34, 56, 789, false],
            ["-10d:12:34:56.789", 10, 12, 34, 56, 789, true],
        ];
        time.forEach(valueOriginal => {
            const value = valueOriginal as any;
            it(`should parse time ${value[0]}`, () => {
                const expectedTime = { days: value[1], hours: value[2], minutes: value[3], seconds: value[4], milliseconds: value[5], isNegative: value[6] };
                const parser = new SdlReader(value[0]);
                const token = parser.read() as any;
                assert.strictEqual(token.type, SdlTokenType.TimeSpan);
                assert.strictEqual(token.text, value[0]);
                assert.deepStrictEqual({ days: token.days, hours: token.hours, minutes: token.minutes, seconds: token.seconds, milliseconds: token.milliseconds, isNegative: token.isNegative }, expectedTime);
                parser.read();
                assert.strictEqual(parser.token.type, SdlTokenType.EndOfFile);
            });
        });
    });

    describe("Compound", () => {
        const valuesWithLeadingNewLineKeepNewLine = [
            ["#\n",                                  SdlTokenType.Comment],
            ["--\n",                                 SdlTokenType.Comment],
            ["//\n",                                 SdlTokenType.Comment],
            ["a\n",                                  SdlTokenType.Identifier],
            ["\"\"\n",                               SdlTokenType.StringDoubleQuoted],
            ["\"\\\n\"\n",                           SdlTokenType.StringDoubleQuoted],
            ["``\n",                                 SdlTokenType.StringBackQuoted],
            ["`\n`\n",                               SdlTokenType.StringBackQuoted],
            ["0\n",                                  SdlTokenType.NumberInt32],
            ["0l\n",                                 SdlTokenType.NumberInt64],
            ["12.f\n",                               SdlTokenType.NumberFloat32],
            ["12.bd\n",                              SdlTokenType.NumberFloat128],
            [";\n",                                  SdlTokenType.EndOfLine],
            ["1111/11/11\n",                         SdlTokenType.Date],
            ["1111/11/11 11:11:11.11-GMT+11:11\n",   SdlTokenType.DateTime],
            ["1d:11:11:11.11\n",                     SdlTokenType.TimeSpan],
            ["[asbbd\nsaidn]\n",                     SdlTokenType.Binary]
        ];
        valuesWithLeadingNewLineKeepNewLine.forEach(value => {
            it(`should preserve new line after parsing ${value[1]}`, () => {
                const parser = new SdlReader(value[0] as string);
                assert.strictEqual(parser.read().type, value[1]);
                assert.strictEqual(parser.read().type, SdlTokenType.EndOfLine);
                assert.strictEqual(parser.read().type, SdlTokenType.EndOfFile);
            });
        });

        it("should not crash on chain line breaks inside of string", () => {
            const parser = new SdlReader("\"\\\n\\\n\\\n\\\n\\\n\"");
            const token = parser.read() as any;
            assert.strictEqual(token.type, SdlTokenType.StringDoubleQuoted);
            assert.isEmpty(token.text);
            assert.strictEqual(parser.read().type, SdlTokenType.EndOfFile);
        });

        it("should parse tag with value", () => {
            tokenTypeAssert(
                "some:tag `with a value`",
                SdlTokenType.Identifier,
                SdlTokenType.StringBackQuoted,
                SdlTokenType.EndOfFile
            );
        });

        it("should parse tag with values", () => {
            tokenTypeAssert(
                "some:tag `st\nr` \"str\\\n\" 0 0l 1.f 1.0d 1.0bd true on false off [abc] 11:11:11 1111/11/11 1111/11/11 11:11:11.11",
                SdlTokenType.Identifier,
                SdlTokenType.StringBackQuoted,
                SdlTokenType.StringDoubleQuoted,
                SdlTokenType.NumberInt32,
                SdlTokenType.NumberInt64,
                SdlTokenType.NumberFloat32,
                SdlTokenType.NumberFloat64,
                SdlTokenType.NumberFloat128,
                SdlTokenType.BooleanTrue,
                SdlTokenType.BooleanTrue,
                SdlTokenType.BooleanFalse,
                SdlTokenType.BooleanFalse,
                SdlTokenType.Binary,
                SdlTokenType.TimeSpan,
                SdlTokenType.Date,
                SdlTokenType.DateTime,
                SdlTokenType.EndOfFile
            );
        });

        it("should parse tag with attributes", () => {
            tokenTypeAssert(
                "some:tag with:an=`attribute` lol=true",
                SdlTokenType.Identifier,
                SdlTokenType.Identifier,
                SdlTokenType.Equals,
                SdlTokenType.StringBackQuoted,
                SdlTokenType.Identifier,
                SdlTokenType.Equals,
                SdlTokenType.BooleanTrue,
                SdlTokenType.EndOfFile
            );
        });

        it("WeirdCommentEdgeCaseWhereSkipLineReadTooManyCharacters", () => {
            tokenTypeAssert(
                `
# To retrieve the values from the matrix (as a list of lists)
#
#     List rows = tag.getChild(""matrix"").getChildrenValues(""content"");

a
Lorem`,
                SdlTokenType.EndOfLine,
                SdlTokenType.Comment, SdlTokenType.EndOfLine,
                SdlTokenType.Comment, SdlTokenType.EndOfLine,
                SdlTokenType.Comment, SdlTokenType.EndOfLine,
                SdlTokenType.EndOfLine,
                SdlTokenType.Identifier, SdlTokenType.EndOfLine,
                SdlTokenType.Identifier, SdlTokenType.EndOfFile
            );
        });
    });
});

function tokenTypeAssert(code: string, ...types: SdlTokenType[]) 
{
    const parser = new SdlReader(code);
    const got: SdlTokenType[] = [];
    while(parser.token.type !== SdlTokenType.EndOfFile)
    {
        parser.read();
        got.push(parser.token.type);
    }

    assert.sameOrderedMembers(got, types);
}