const PLACEHOLDER = '---';
const NESTED_RAID_TYPES = new Set(['raid10', 'raid50', 'raid60']);
const JBOD_SPANNING_TYPES = new Set(['jbod', 'spanning']);
const USABLE_CAPACITY = {
  raid0: (drives, capacity) => drives * capacity, raid1: (drives, capacity) => capacity, raid5: (drives, capacity) => drives * capacity - capacity, raid6: (drives, capacity) => drives * capacity - capacity * 2, raid10: (drives, capacity) => (drives * capacity) / 2, raid50: (drives, capacity) => drives * capacity - capacity * 2, raid60: (drives, capacity) => drives * capacity - capacity * 4, jbod: (drives, capacity) => drives * capacity, spanning: (drives, capacity) => drives * capacity,
};
const MIN_DRIVES = {
  raid0: 2, raid1: 2, raid5: 3, raid6: 4, raid10: 4, raid50: 6, raid60: 8, jbod: 2, spanning: 2,
};
function getMinDrives(raidType) {
  return MIN_DRIVES[raidType] ?? 2;
}
function hideElements(...elements) {
  elements.forEach(el => el.classList.add('hidden'));
}
function getDisclosureId(raidType) {
  if (NESTED_RAID_TYPES.has(raidType)) return 'nested-raid-disclosure';
  if (JBOD_SPANNING_TYPES.has(raidType)) return 'jbod-spanning-disclosure';
  return null;
}
function updateDisclosures(raidType) {
  hideElements(...document.querySelectorAll('.raid-disclosures'));
  const disclosureId = getDisclosureId(raidType);
  if (disclosureId) document.getElementById(disclosureId).classList.remove('hidden');
}
function requiresEvenQuantity(raidType) {
  return NESTED_RAID_TYPES.has(raidType);
}
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
function clearResult() {
  ['resultsTotal', 'resultsAvailable', 'resultsRedundancy'].forEach(id => {
    document.getElementById(id).value = PLACEHOLDER;
  });
  validateQuantity(false);
  updateDisclosures(document.getElementById('raid-type').value);
  document.getElementById('resultsAvailableDetail').innerText = '';
}
function resetForm() {
  clearResult();
  updateDisclosures(false);
}
window.addEventListener('load', () => {
  document.querySelectorAll('#results input').forEach(input => {
    input.readOnly = true;
  });
  validateQuantity(false);
});
document.getElementById('quantity').addEventListener('keydown', e => {
  if (['.', ',', '-', '+', 'e', 'E'].includes(e.key)) event.preventDefault();
});
document.getElementById('quantity').addEventListener('change', () => {
  validateQuantity(true);
});
document.getElementById('raid-type').addEventListener('change', () => {
  validateQuantity(false);
});
document.getElementById('capacity-form').addEventListener('submit', e => {
  e.preventDefault();
  if (!validateQuantity(true)) return;
  const raidTypeInput = document.getElementById('raid-type');
  const raidType = raidTypeInput.value;
  console.log(raidTypeInput.selectedIndex);
  console.log(raidTypeInput.options[raidTypeInput.selectedIndex]);
  console.log(raidTypeInput.options[raidTypeInput.selectedIndex].text);
  const raidTypeLabel = raidTypeInput.options[raidTypeInput.selectedIndex].text;
  const drives = Number(document.getElementById('quantity').value);
  const capacity = Number(document.getElementById('capacity').value);
  const calcUsable = USABLE_CAPACITY[raidType];
  if (!calcUsable) return;
  const totalCapacity = drives * capacity;
  const availableCapacity = calcUsable(drives, capacity);
  const redundancyCapacity = totalCapacity - availableCapacity;
  document.getElementById('resultsTotal').value = totalCapacity + ' TB';
  document.getElementById('resultsTotal').focus();
  document.getElementById('resultsAvailable').value = availableCapacity + ' TB';
  document.getElementById('resultsAvailableDetail').innerText = `${drives} x ${capacity}TB in ${raidTypeLabel}  = ${availableCapacity}TB Usable (${availableCapacity},000GB)`;
  document.getElementById('resultsRedundancy').value = redundancyCapacity + ' TB';
});
