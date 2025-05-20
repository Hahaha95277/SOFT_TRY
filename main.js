
const imageInput = document.getElementById("imageInput");
const canvas = document.getElementById("styledCanvas");
const ctx = canvas.getContext("2d");

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

function drawStylizedImage(img) {
  canvas.width = 768;
  canvas.height = 1024;

  // 塗底色（深藍色）
  ctx.fillStyle = "#456C82";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 畫圓角白框
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, 20, 20, canvas.width - 40, canvas.height - 40, 30, true);

  // 畫圓角金色框
  ctx.fillStyle = "#8F7150";
  roundRect(ctx, 40, 40, canvas.width - 80, canvas.height - 80, 25, true);

  // 畫內層圖片位置（遮罩留白）
  const innerX = 60, innerY = 60;
  const innerW = canvas.width - 120;
  const innerH = canvas.height - 120;

  // 建立濾鏡效果：縮小畫面做像素處理
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  tempCanvas.width = innerW;
  tempCanvas.height = innerH;

  tempCtx.drawImage(img, 0, 0, innerW, innerH);

  let imgData = tempCtx.getImageData(0, 0, innerW, innerH);
  let data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const brightness = 0.3*r + 0.59*g + 0.11*b;
    let newColor;
    if (brightness < 85) newColor = [69, 108, 130];       // 深藍色
    else if (brightness < 170) newColor = [255, 255, 255]; // 白色
    else newColor = [143, 113, 80];                   // 金色
    [data[i], data[i+1], data[i+2]] = newColor;
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
  const link = document.createElement("a");
  link.download = "kbk_style.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}
