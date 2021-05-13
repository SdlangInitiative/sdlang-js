/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it } from "mocha"
import { assert } from "chai"
import { SdlReader } from "../src/index"

describe("AST", () => {

    it("should parse a simple tag", () => {
        let node = new SdlReader("this:is a=`simple` 1 line=\"tag\" on 2021/03/27").toAst();
        assert.lengthOf(node.children, 1);
        assert.isTrue(node.hasChildAt(0));
        assert.isTrue(node.hasChildCalled("this:is"));

        node = node.children[0];
        assert.lengthOf(Object.keys(node.attributes), 2);
        assert.equal(node.values.length, 3);
        assert.equal(node.name, "is");
        assert.equal(node.namespace, "this");
        assert.equal(node.qualifiedName, "this:is");
        assert.isTrue(node.hasAttributeCalled("a"));
        assert.equal(node.getAttributeString("a"), "simple");
        assert.isTrue(node.hasAttributeCalled("line"));
        assert.equal(node.getAttributeString("line"), "tag");
        assert.isTrue(node.hasValueAt(0) && node.hasValueAt(1) && node.hasValueAt(2));
        assert.equal(node.getValueNumber(0), 1);
        assert.isTrue(node.getValueBoolean(1));
    });

    it("should parse a simple matrix", () => {
        const node = new SdlReader(`
            matrix {
                1 1 1
                2 2 2
                3 3 3
            }
        `).toAst();

        const matrix = node.children[0];
        assert.equal(matrix.children.length, 3); // 3 anonymous tags.
        assert.equal(matrix.getChildrenCalled("content")
                           .map(c => c.values.map(v => v.number))
                           .reduce<number>((s, na) => s + na.reduce((s, n) => s + n), 0),
                           18
        );
    });

    it("should parse a node with children", () => {
        const node = new SdlReader(`
            parent name="unga" {
                child id=1 name="ugu"
                child id=2 name="gaga"
                siblings {
                    brother name="bunga"
                }
            }
        `).toAst().children[0];

        assert.equal(node.getAttributeString("name"), "unga");

        let expectedId = 1;
        for(const child of node.getChildrenCalled("child"))
            assert.equal(child.getAttributeNumber("id"), expectedId++);

        const brother = node.getChildrenCalled("siblings")[0].children[0];
        assert.equal(brother.getAttributeString("name"), "bunga");
    });
});