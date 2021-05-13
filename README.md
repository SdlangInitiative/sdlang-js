# Overview

This is the official TS/JS port of [SdlangSharp](https://github.com/BradleyChatha/SdlangSharp) which aims to behave and keep as close to the API
of SdlangSharp as possible.

The `npm build` command will produce both an ESM module, as well as a UMD module, so it *should maybe I think* work in most major JS environments. *maybe*, it confuses
me still.

Since this library is mostly a port (even the tests!), I'd like to ask you to refer to SdlangSharp's README as it will apply for this library as well. However,
I will still note all the differences between the two libraries. If there's something specific to this library that should be explained, make a PR/Issue about it please.

You can contribute to either repo, and I should be able to handle the translation to the best of my ability if you're not able to.

# Documentation

Other than the differences listed below, most of the functionality and usage is logically-identical to the C# version, so please, as a I said, read
that one's README.

The JS code isn't even documented either as the C#'s documentation + the provided TS typings should suffice.

For example, this is a code sample from C#:

```csharp
var root = new SdlTag("root");

var person = new SdlTag("person");
root.Children.Add(person);
person.Values.Add(new SdlValue("Bradley Chatha"));
person.Attributes.Add(new SdlAttribute("age", new SdlValue(21)));

var pet = new SdlTag("pet:dog");
person.Children.Add(pet);
pet.Values.Add(new SdlValue("Cooper"));
pet.Attributes.Add(new SdlAttribute("cute", SdlValue.True)); // or new SdlValue(true)

var numbers = new SdlTag("numbers")
{
    Children = new[]
    {
        new SdlTag("content"){ Values = new[]{ new SdlValue(1), new SdlValue(1), new SdlValue(1) } },
        new SdlTag("content"){ Values = new[]{ new SdlValue(2), new SdlValue(2), new SdlValue(2) } },
        new SdlTag("content"){ Values = new[]{ new SdlValue(3), new SdlValue(3), new SdlValue(3) } }
    }
};
root.Children.Add(numbers);
```

And the JS translation would be:

```typescript
const root = new SdlTag("root");

const person = new SdlTag("person");
root.children.push(person);
person.values.push(SdlValue.from("Bradley Chatha"));
person.attributes["age"] = new SdlAttribute("age", SdlValue.from(21));

const pet = new SdlTag("pet:dog");
person.children.push(pet);
pet.values.push(SdlValue.from("Cooper"));
pet.attributes["cute"] = new SdlAttribute("cute", SdlValue.fromTrue()); // or SdlValue.from(true)

const numbers = new SdlTag("numbers",
{
    children: [
        new SdlTag("content", { values: [SdlValue.from(1), SdlValue.from(1), SdlValue.from(1)] }),
        new SdlTag("content", { values: [SdlValue.from(2), SdlValue.from(2), SdlValue.from(2)] }),
        new SdlTag("content", { values: [SdlValue.from(3), SdlValue.from(3), SdlValue.from(3)] })
    ]
});
root.children.push(numbers);
```

# Differences

To preface, all function and variable names have been turned into camel-case, since that's just the default style for JS code.

If there are any differences between the two versions that are not listed here, feel free to open an issue about it.
It could be a bug, or I just forgot to put it here. Doesn't hurt to make sure >x3.

* [SdlReader has a different API](#sdlreader-has-a-different-api)
* [SdlReader will always escape double-quoted strings](#sdlreader-will-always-escape-double-quoted-strings)
* [SdlToken has line information](#sdltoken-has-line-information)
* [ISdlTokenVisitor is different](#isdltokenvisitor-is-different)
* [SdlReader uses different parsing algorithms](#sdlreader-uses-different-parsing-algorithms)
* [Integer and Float have been merged into Number](#integer-and-float-have-been-merged-into-number)
* [SdlAstToTextConverter and SdlHelper have been removed](#sdlasttotextconverter-and-sdlhelper-have-been-removed)
* [SdlAttribute.value is no longer nullable](#sdlattributevalue-is-no-longer-nullable)
* [SdlValue has static functions for constructors](#sdlvalue-has-static-functions-for-constructors)
* [SdlTag has an extra optional parameter](#sdltag-has-an-extra-optional-parameter)

## SdlReader has a different API

In the C# version of the library, `SdlReader` takes on a similar API as C#'s `Utf8JsonReader`.

In this version of the library, `SdlReader` stores will generate a new `SdlToken` object for every token it reads, instead of reusing
the memory. I've done this as it seems to be more natural for JS code.

Certain fields are accessed differently. For example, `SdlReader.TokenType` is now `SdlReader.token.type`.

## SdlReader will always escape double-quoted strings

In C#, it is an opt-in process to actually construct an escaped string. This is for power-users who know that there's no point wasting time and memory
in their specific case.

However, in JS land convenience is king (I think), so SdlReader will always escape strings.

## SdlReader uses different parsing algorithms

For the most part, the C# and JS versions should have the exact same behaviour and parse values the same way, buuut there might be a difference
here and there because:

* For `DateTime` values, the parser has to do its own parsing due to JS's built-in date parsing being a bit limited.
* For `TimeSpan` values, JS doesn't have a time span type from what I can tell, so that's also being done manually.
  * This library also provides a new type: `SdlTimeSpan`, to make up the lack for a native JS one.
* The internal parsing structure is slightly different. `peekChar` has different behaviour due to `commitPeek` being new.
* For double-quoted `string` values, because we don't have SIMD, the parser uses a more straight-forward algorithm.
* Number parsing is much more relaxed due to laziness and the fact JS numbers are always doubles.

## SdlToken has line information

In C#, no line information is tracked or provided due to laziness/performance/difficulties when using SIMD.

In JS however, since we don't really have SIMD instructions it was easy enough to add in. All `SdlToken`s now have a `.line` and `.column` field.

I think `.line` might be off sometimes, not too sure. File an issue if it happens.

## ISdlTokenVisitor is different

In C#, there are two types of token visitors, the "raw" visitor and the "easy to use" visitor.

In JS there's only the singular `ISdlTokenVisitor` interface, as the "raw" visitor provides no benefit in JS.

The parameters are also slightly different between the two, but it's pretty self-explanatory when you see it.

## Integer and Float have been merged into Number

Because in JS having separate functions and types for  mostly useless, instead of things like `SdlValueType.Integer` and `SdlTag.GetValueFloat`, they have all
been merged into things like `SdlValueType.number` and `SdlTag.getValueNumber`.

## SdlAstToTextConverter and SdlHelper have been removed

In C#, these two classes provided extension methods such as `SdlTag.ToSdlString` and `SdlReader.ToAst`.

Extension methods in JS aren't nice, so I've instead directly implemented these methods inside of the appropriate classes.

Note that `SdlTag.ToSdlString` is now `SdlTag.toString`.

## SdlAttribute.value is no longer nullable

It makes a bit of sense in the C# version since I wanted that library to be efficient. So instead of having to allocate `SdlValue.Null`, you can
just use a native `null` value.

In JS however it's not really much of a concern, and can actually be kind of annoying, so this field can no longer be null (if you obey the TS typings that is).

## SdlValue has static functions for constructors

In C#, we simply use constructor overloads for each possible type that `SdlValue` can use.

In JS there's no such thing as constructor overloads, and we can't detect some value types properly using things like `typeof`, so we
have special static constructors instead of a single normal one.

For automatic behaviour similar to C# you can use `v = SdlValue.from("Some value")`, but there
are specific constructors now, for example `v = SdlValue.fromNumber(20)`.

Also, `SdlValue.True`, `SdlValue.Null`, etc. are now `SdlValue.fromTrue()` and `SdlValue.fromNull()`.

## SdlTag has an extra optional parameter

C# has a feature called [object initialisers](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/how-to-initialize-objects-by-using-an-object-initializer) which allows a clean way to create classes and set their properties
without having to make a million different constructors.

JS doesn't really have this, so instead you can optionally pass an object into the second parameter for `SdlTag.constructor`.

In other words, this C# code:

```csharp
var tag = new SdlTag("")
{
    Children = new[]{...},
    Attributes = new[]{...},
    Values = new[]{...}
}
```

Becomes this JS code:

```js
const tag = new SdlTag("", {
    children: [...],
    attributes: {...}, // attributes is an object/dictionary, not an array.
    values: [...]
})
```

# Warning

I am a super noob to the JS ecosystem, and I'm not 100% sure the packaged distribution is even working as expected.

Please bear with me, and even help me. JS' ecosystem burns my mind, soul, and brain cells.

`npm install some_library` -> `Added 1000 packages by 2 authors`. Excellent.