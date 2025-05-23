
const imageInput = document.getElementById("imageInput");
const canvas = document.getElementById("styledCanvas");
const ctx = canvas.getContext("2d");

let filterMode = "five";
let currentImage = null;

imageInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      drawStylizedImage(img);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

function openCamera() {
  imageInput.setAttribute("capture", "environment");
  imageInput.click();
}

function getLineOptions() {
  const width = parseInt(document.getElementById("lineWidthSelect").value, 10);
  const gap = parseInt(document.getElementById("lineGapSelect").value, 10);
  return { width, gap };
}

function drawStylizedImage(img) {
  currentImage = img;
  canvas.width = 768;
  canvas.height = 1024;
  ctx.fillStyle = "#173D50";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 30, true);
  ctx.fillStyle = "#B3966A";
  roundRect(ctx, 40, 40, canvas.width - 80, canvas.height - 80, 25, true);

  const innerX = 60, innerY = 60;
  const innerW = canvas.width - 120;
  const innerH = canvas.height - 120;

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = innerW;
  tempCanvas.height = innerH;
  tempCtx.drawImage(img, 0, 0, innerW, innerH);

  const { width: lineWidth, gap: lineGap } = getLineOptions();

  let imgData = tempCtx.getImageData(0, 0, innerW, innerH);
  let data = imgData.data;

  for (let y = 0; y < innerH; y++) {
    for (let x = 0; x < innerW; x++) {
      const i = (y * innerW + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const brightness = 0.3 * r + 0.59 * g + 0.11 * b;

      let newColor;
      if (filterMode === "three") {
        if (brightness < 85) newColor = [23, 61, 80];
        else if (brightness < 170) newColor = [255, 255, 255];
        else newColor = [179, 150, 106];
      } else {
        const toggle = Math.floor(y / (lineGap + lineWidth)) % 2;
        if (brightness < 69) newColor = [23, 61, 80];
        else if (brightness < 103) {
          newColor = toggle === 0 ? [23, 61, 80] : [179, 150, 106];
        } else if (brightness < 137) newColor = [179, 150, 106];
        else if (brightness < 171) {
          newColor = toggle === 0 ? [255, 255, 255] : [179, 150, 106];
        } else newColor = [255, 255, 255];
      }

      [data[i], data[i + 1], data[i + 2]] = newColor;
    }
  }

  tempCtx.putImageData(imgData, 0, 0);
  ctx.drawImage(tempCanvas, innerX, innerY);
}

function roundRect(ctx, x, y, width, height, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
}

function downloadImage() {
  const inputName = document.getElementById("filenameInput").value.trim();
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.]/g, "").slice(0, 15);
  const suffix = `_${filterMode}_${timestamp}.png`;
  const filename = inputName ? `${inputName}${suffix}` : `kbk_style${suffix}`;
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function toggleMode() {
  filterMode = filterMode === "five" ? "three" : "five";
  updateModeDisplay();
  if (currentImage) drawStylizedImage(currentImage);
}

function updateModeDisplay() {
  const modeText = filterMode === "five" ? "五階" : "三階";
  document.getElementById("modeDisplay").textContent = `目前濾鏡模式：${modeText}`;
}

updateModeDisplay();
