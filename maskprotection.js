const canvas = document.getElementById('gasCloudCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gasCloudCenterX = canvas.width / 2;
const gasCloudCenterY = canvas.height / 2;
const gasCloudRadius = 300;

function drawBubble(x, y, radius, color, shadowBlur) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = shadowBlur;
  ctx.fill();
}

function drawGasCloud() {

  var color = "rgba(144, 238, 144, 0.9)"

  drawBubble(gasCloudCenterX - 100, gasCloudCenterY, 120, color, 20); 
  drawBubble(gasCloudCenterX + 50, gasCloudCenterY - 50, 100, color, 20);
  drawBubble(gasCloudCenterX, gasCloudCenterY + 80, 80, color, 15);
  drawBubble(gasCloudCenterX + 150, gasCloudCenterY + 20, 70, color, 10);

  drawBubble(gasCloudCenterX - 170, gasCloudCenterY - 50, 50, color, 10);
  drawBubble(gasCloudCenterX + 200, gasCloudCenterY + 80, 40, color, 8);
  drawBubble(gasCloudCenterX - 150, gasCloudCenterY + 120, 30, color, 5);
  drawBubble(gasCloudCenterX + 250, gasCloudCenterY - 60, 25, color, 5);
  drawBubble(gasCloudCenterX + 300, gasCloudCenterY + 40, 20, color, 3);
}

function drawLinePlot() {
  const plotWidth = gasCloudRadius * 2; 
  const plotHeight = 100;
  const plotX = gasCloudCenterX - gasCloudRadius; 
  const plotY = gasCloudCenterY + 150; 
  const percentages = [64, 54, 17]; 

  ctx.beginPath();
  ctx.moveTo(plotX, plotY);
  ctx.lineTo(plotX + plotWidth, plotY);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i <= 100; i += 10) {
    const x = plotX + ((100 - i) / 100) * plotWidth; 

    // Label
    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`${i}%`, x - 10, plotY + 20);

    // Tick mark
    ctx.beginPath();
    ctx.moveTo(x, plotY - 5);
    ctx.lineTo(x, plotY + 5);
    ctx.strokeStyle = "black";
    ctx.stroke();
  }

  let i = 0;
  percentages.forEach((percentage) => {
    let label = "mask1";
    const x = plotX + ((100 - percentage) / 100) * plotWidth;
    const lineTopY = gasCloudCenterY - 150;

    ctx.beginPath();
    ctx.moveTo(x, plotY);
    ctx.lineTo(x, lineTopY);
    ctx.strokeStyle = "rgba(0, 128, 0, 0.7)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();

    if (i === 0) label = "Cloth Mask";
    if (i === 1) label = "Surgical Mask";
    if (i === 2) label = "N59 Mask";

    ctx.font = "14px Arial";
    ctx.fillStyle = "black";
    if (i === 1) {
      ctx.fillText(label + " " + `${percentage}%`, x - 15, lineTopY - 10);
      ctx.fillText("Infection Rate Based on Mask Type", x - 100, lineTopY - 100);
    } else {
      ctx.fillText(label + " " + `${percentage}%`, x - 70, lineTopY - 10);
    }
    i++;
  });
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); 
  drawGasCloud();
  drawLinePlot();
}

drawScene();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawScene();
});
