# Client logic — 23-raid

Source: https://www.westerndigital.com/tools/raid-capacity-calculator · mount `form[name="capacity-form"], #capacity-form, form.capacity-form` · 2026-10-15T15:42:44.379Z

**Compute locus: client.** 3 controls, 0 output mutations, 0 first-party XHR/fetch during the interaction (1 third-party ignored).

## First-party network during the interaction

- none

## Outputs that changed


## Source maps

- none shipped

## Logic candidates (ran on interaction, first-party, framework excluded, ranked)

### 1. `validateQuantity` — scripts/004-raid-capacity-calculator.js:55

calls 3 · 787 B · math ops 0 · mentions "RAID type", "raid-type", "quantity"

```js
function validateQuantity(showError) {
  const raidType = document.getElementById('raid-type').value;
  const quantityInput = document.getElementById('quantity');
  const minDrives = getMinDrives(raidType);
  const quantity = Number(quantityInput.value);
  quantityInput.min = minDrives;
  if (requiresEvenQuantity(raidType)) {
    quantityInput.step = 2;
    if (showError && quantity % 2 !== 0) {
      quantityInput.setCustomValidity('Drive count must be an even number for this RAID type.');
      quantityInput.reportValidity();
      return false;
    }
  }
  else {
    quantityInput.step = 1;
  }
  quantityInput.setCustomValidity('');
  return true;
}

```

### 2. `clearResult` — scripts/004-raid-capacity-calculator.js:78

calls 2 · 363 B · math ops 0 · mentions "raid-type"

```js
function clearResult() {
  ['resultsTotal', 'resultsAvailable', 'resultsRedundancy'].forEach(id => {
    document.getElementById(id).value = PLACEHOLDER;
  });
  validateQuantity(false);
  updateDisclosures(document.getElementById('raid-type').value);
  document.getElementById('resultsAvailableDetail').innerText = '';
}

```

### 3. `oneLine` — scripts/035-inline.js:8428

calls 1 · 85 B · math ops 4

```js
function oneLine(s) {
  return s.replace(/\n/g, "\u21B5").replace(/\t/g, "\u21C6");
}

```

### 4. `(anonymous)` — scripts/035-inline.js:8002

calls 19 · 29 B · math ops 0

```js
(a, b) => a.length - b.length

```

### 5. `(anonymous)` — scripts/004-raid-capacity-calculator.js:36

calls 4 · 32 B · math ops 0

```js
el => el.classList.add('hidden')

```

### 6. `(anonymous)` — scripts/033-inline.js:384

calls 4 · 37 B · math ops 0

```js
(value2) => ({
  fallThrough: value2
})

```

### 7. `(anonymous)` — scripts/004-raid-capacity-calculator.js:107

calls 1 · 46 B · math ops 0

```js
() => {
  validateQuantity(false);
}

```

### 8. `(anonymous)` — scripts/004-raid-capacity-calculator.js:79

calls 6 · 78 B · math ops 0

```js
id => {
  document.getElementById(id).value = PLACEHOLDER;
}

```

### 9. `getMinDrives` — scripts/004-raid-capacity-calculator.js:31

calls 3 · 81 B · math ops 0

```js
function getMinDrives(raidType) {
  return MIN_DRIVES[raidType] ?? 2;
}

```

### 10. `trimStringWithEllipsis` — scripts/035-inline.js:498

calls 1 · 90 B · math ops 0

```js
function trimStringWithEllipsis(input, cap) {
  return trimString(input, cap, "\u2026");
}

```

### 11. `requiresEvenQuantity` — scripts/004-raid-capacity-calculator.js:51

calls 3 · 95 B · math ops 0

```js
function requiresEvenQuantity(raidType) {
  return NESTED_RAID_TYPES.has(raidType);
}

```

### 12. `hideElements` — scripts/004-raid-capacity-calculator.js:35

calls 2 · 102 B · math ops 0

```js
function hideElements(...elements) {
  elements.forEach(el => el.classList.add('hidden'));
}

```
