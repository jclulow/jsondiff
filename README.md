# jsondiff

This is a first cut of a simple JSON diff utility, inspired by the usefulness
and simplicity of [trentm/json](https://github.com/trentm/json).

## Usage

Install node.js, then simply call the script on two JSON files, like so:

```bash
jsondiff left.json right.json
```

## License

ISC.  See the header in the source.

## Examples

### Array Diff

Left:

```json
[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
```

Right:

```json
[1,2,6,7,8,9,10,11,12,13,14,15,16,17,18,5,5,5,19,20]
```

Diff:

```diff
[
   1,
   2,
-  3,
-  4,
-  5,
   6,
   7,
   8,
   9,
   10,
   11,
   12,
   13,
   14,
   15,
   16,
   17,
   18,
+  5,
+  5,
+  5,
   19,
   20
]
```

### Object Diff

Left:

```json
{
  "c": 6,
  "aa": 7,
  "y": "diff all the things!",
  "z": true,
  "removed": {
    "red": true,
    "green": false,
    "blue": false
  },
  "common": {
    "john": 4,
    "still here": true
  },
  "equal": "!!!!",
  "wasarray": [ 1, 2 ,3 ,4],
  "stillisarray": [ 1, 1, 2, 5, 3, 4, 0, 2, 3, 2, 3, 5, 9]
}
```

Right:

```json
{
  "y": "DIFF ALL THE THINGS!",
  "c": null,
  "aa": 5,
  "b": false,
  "z": true,
  "e": {
    "john": 5,
    "mary": 6,
    "stephen": 8
  },
  "common": {
    "john": null,
    "mary": 5,
    "still here": true
  },
  "equal": "!!!!",
  "wasarray": { "test": "5" },
  "stillisarray": [ 3, 4, 0, 2, 3, 4, 6, 4, 2, 3, 5, 9]
}
```

Diff:

```diff
{
-  aa: 7,
+  aa: 5,
+  b: false,
-  c: 6,
+  c: null,
   common: {
-    john: 4,
+    john: null,
+    mary: 5,
     still here: true
   },
+  e: {
+    john: 5,
+    mary: 6,
+    stephen: 8
+  },
   equal: "!!!!",
-  removed: {
-    blue: false,
-    green: false,
-    red: true
-  },
   stillisarray: [
-    1,
-    1,
-    2,
-    5,
     3,
     4,
     0,
     2,
     3,
+    4,
+    6,
+    4,
     2,
     3,
     5,
     9
   ],
-  wasarray: [
-    1,
-    2,
-    3,
-    4
-  ],
+  wasarray: {
+    test: "5"
+  },
-  y: "diff all the things!",
+  y: "DIFF ALL THE THINGS!",
   z: true
}
```
