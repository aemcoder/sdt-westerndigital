# Client logic — 23-surveillance

Source: https://www.westerndigital.com/tools/surveillance-capacity-calculator · mount `form[name="capacity-form"], #capacity-form, form.capacity-form` · 2026-10-15T15:48:57.892Z

**Compute locus: client.** 15 controls, 0 output mutations, 0 first-party XHR/fetch during the interaction (12 third-party ignored).

## First-party network during the interaction

- none

## Outputs that changed


## Source maps

- none shipped

## Logic candidates (ran on interaction, first-party, framework excluded, ranked)

### 1. `previewNode` — scripts/035-inline.js:7986

calls 4 · 1294 B · math ops 3 · mentions "Low"

```js
previewNode(node) {
  if (node.nodeType === Node.TEXT_NODE) return oneLine(`#text=${node.nodeValue || ""}`);
  if (node.nodeType !== Node.ELEMENT_NODE) return oneLine(`<${node.nodeName.toLowerCase()} />`);
  const element = node;
  const attrs = [];
  for (let i = 0;
  i < element.attributes.length;
  i++) {
    const {
      name, value
    }
    = element.attributes[i];
    if (name === "style") continue;
    if (!value && this._booleanAttributes.has(name)) attrs.push(` ${name}`);
    else attrs.push(` ${name}="${value}"`);
  }
  attrs.sort((a, b) => a.length - b.length);
  const attrText = trimStringWithEllipsis(attrs.join(""), 500);
  if (this._autoClosingTags.has(element.nodeName)) return oneLine(`<${element.nodeName.toLowerCase()}${attrText}/>`);
  const children = element.childNodes;
  let onlyText = false;
  if (children.length <= 5) {
    onlyText = true;
    for (let i = 0;
    i < children.length;
    i++) onlyText = onlyText && children[i].nodeType === Node.TEXT_NODE;
  }
  const text = onlyText ? element.textContent || "" : children.length ? "\u2026" : "";
  return oneLine(`<${element.nodeName.toLowerCase()}${attrText}>${trimStringWithEllipsis(text, 50)}</${element.nodeName.toLowerCase()}>`);
}

```

### 2. `oneLine` — scripts/035-inline.js:8428

calls 4 · 85 B · math ops 4

```js
function oneLine(s) {
  return s.replace(/\n/g, "\u21B5").replace(/\t/g, "\u21C6");
}

```

### 3. `(anonymous)` — scripts/035-inline.js:8002

calls 117 · 29 B · math ops 0

```js
(a, b) => a.length - b.length

```

### 4. `(anonymous)` — scripts/033-inline.js:384

calls 16 · 37 B · math ops 0

```js
(value2) => ({
  fallThrough: value2
})

```

### 5. `trimStringWithEllipsis` — scripts/035-inline.js:498

calls 4 · 90 B · math ops 0

```js
function trimStringWithEllipsis(input, cap) {
  return trimString(input, cap, "\u2026");
}

```

### 6. `clearResult` — scripts/004-surveillance-capacity-calculator.js:61

calls 1 · 106 B · math ops 0

```js
function clearResult() {
  document.getElementById("required_total_disk_space").value = "---";
}

```

### 7. `safeJson` — scripts/033-inline.js:387

calls 8 · 127 B · math ops 0

```js
(value2) => {
  try {
    return this.jsonValue(true, value2);
  }
  catch (e) {
    return void 0;
  }
}

```

### 8. `isURL` — scripts/033-inline.js:50

calls 4 · 162 B · math ops 0

```js
function isURL(obj) {
  try {
    return obj instanceof URL || Object.prototype.toString.call(obj) === "[object URL]";
  }
  catch (error) {
    return false;
  }
}

```

### 9. `isRegExp` — scripts/033-inline.js:36

calls 4 · 171 B · math ops 0

```js
function isRegExp(obj) {
  try {
    return obj instanceof RegExp || Object.prototype.toString.call(obj) === "[object RegExp]";
  }
  catch (error) {
    return false;
  }
}

```

### 10. `isDate` — scripts/033-inline.js:43

calls 4 · 165 B · math ops 0

```js
function isDate(obj) {
  try {
    return obj instanceof Date || Object.prototype.toString.call(obj) === "[object Date]";
  }
  catch (error) {
    return false;
  }
}

```

### 11. `jsonValue` — scripts/033-inline.js:381

calls 8 · 166 B · math ops 0

```js
jsonValue(returnByValue, value) {
  if (value === void 0) return void 0;
  return serializeAsCallArgument(value, (value2) => ({
    fallThrough: value2
  }));
}

```

### 12. `isArrayBuffer` — scripts/033-inline.js:72

calls 4 · 186 B · math ops 0

```js
function isArrayBuffer(obj) {
  try {
    return obj instanceof ArrayBuffer || Object.prototype.toString.call(obj) === "[object ArrayBuffer]";
  }
  catch (error) {
    return false;
  }
}

```
