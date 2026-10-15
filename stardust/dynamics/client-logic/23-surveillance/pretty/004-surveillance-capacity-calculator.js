window.addEventListener("load", () => {
  document.getElementById("required_total_disk_space").readOnly = true;
});
document.getElementById("capacity-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const resolution = Number(formData.get("resolution"));
  const fps = Number(formData.get("fps"));
  const cameraCount = Number(formData.get("number_of_cameras"));
  const daysToStore = Number(formData.get("days_to_store"));
  const hoursPerDay = Number(formData.get("hours_per_day"))/24;
  const quality = formData.get("quality");
  const activity = formData.get("activity");
  const codec = formData.get("codec");
  const colorDepth = resolution > 8294399 ? 30 : 16;
  const compressionRatio = getCompressionRatio(codec, quality, activity);
  const bandwidth = resolution * colorDepth * fps * cameraCount / compressionRatio;
  const totalBytes = bandwidth / 8 * 86400 * daysToStore * hoursPerDay;
  const totalTerabytes = (totalBytes / 1e12).toFixed(3);
  document.getElementById("required_total_disk_space").value = totalTerabytes;
  document.getElementById("required_total_disk_space").focus();
});
function getCompressionRatio(codec, quality, activity) {
  const ratios = {
    mpeg: {
      high: 16, medium: 25, low: 31
    }, h264: {
      high: {
        high: 98, medium: 102, low: 105
      }, medium: {
        high: 160, medium: 173, low: 181
      }, low: {
        high: 220, medium: 242, low: 260
      }
    }, h265: {
      high: {
        high: 260, medium: 272, low: 282
      }, medium: {
        high: 480, medium: 510, low: 536
      }, low: {
        high: 620, medium: 670, low: 710
      }
    }, h265plus: {
      high: {
        high: 335, medium: 351, low: 364
      }, medium: {
        high: 590, medium: 621, low: 643
      }, low: {
        high: 776, medium: 834, low: 833
      }
    }
  };
  const codecRatios = ratios[codec];
  if (!codecRatios) return 1;
  const qualityRatios = codecRatios[quality];
  if (typeof qualityRatios === "number") return qualityRatios;
  return qualityRatios[activity] || 1;
}
function clearResult() {
  document.getElementById("required_total_disk_space").value = "---";
}
document.querySelectorAll('.tooltip-trigger').forEach(btn => {
  const content = btn.nextElementSibling;
  function show() {
    content.classList.remove('hidden');
    content.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  }
  function hide() {
    content.classList.add('hidden');
    content.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
  }
  function toggle() {
    if (content.classList.contains('hidden')) {
      show();
    }
    else {
      hide();
    }
  }
  btn.addEventListener('click', toggle);
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
    if (e.key === 'Escape') {
      hide();
    }
  });
  btn.addEventListener('focusout', e => {
    if (!btn.contains(e.relatedTarget) && !content.contains(e.relatedTarget)) {
      hide();
    }
  });
});
