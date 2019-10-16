const canvas = document.querySelector("canvas");
const fpsMeter = document.querySelector("p");
const ctx = canvas.getContext("2d");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Events Managing

canvas.addEventListener("mousedown", e => {
  e.preventDefault();
  e.stopPropagation();
  if (e.button === 0) {
    params.color = Please.make_color();
  } else if (e.button === 2) {
    bootstrapPoints();
  }
  return false;
});
document.querySelector("canvas").addEventListener("contextmenu", e => {
  e.preventDefault();
  e.stopPropagation();
  return false;
});

// GUI

const gui = new dat.GUI({
  load: {
    remembered: {
      Default: {
        "0": {}
      },
      "Windows XP-like": {
        "0": {
          changeColorEachTime: true,
          speed: 15.4,
          play: true,
          autoSwitchPointsPositionIntervalTime: 0.5,
          autoSwitchColorIntervalTime: 0,
          pointSize: 0
        }
      },
      "Knick Knack (Disney)": {
        "0": {
          changeColorEachTime: true,
          speed: 0.8,
          play: true,
          autoSwitchPointsPositionIntervalTime: 0.4,
          autoSwitchColorIntervalTime: 0,
          pointSize: 0
        }
      },
      "Rainbow ribbons": {
        "0": {
          changeColorEachTime: true,
          speed: 0.8,
          play: true,
          autoSwitchPointsPositionIntervalTime: 0.8,
          autoSwitchColorIntervalTime: 0.05,
          pointSize: 2
        }
      },
      Spirograph: {
        "0": {
          changeColorEachTime: false,
          speed: 4.2,
          play: true,
          autoSwitchPointsPositionIntervalTime: 0,
          autoSwitchColorIntervalTime: 0
        }
      },
      "Colored spirograph": {
        "0": {
          changeColorEachTime: false,
          speed: 4.2,
          play: true,
          autoSwitchPointsPositionIntervalTime: 0,
          autoSwitchColorIntervalTime: 0.6900000000000001
        }
      }
    },
    closed: false,
    folders: {}
  }
});

const params = {
  color: Please.make_color(),
  changeColor: () => (params.color = Please.make_color()),
  changePointsPosition: () => bootstrapPoints(),
  autoSwitchPointsPositionIntervalTime: 0,
  autoSwitchPointPositionInterval: null,
  autoSwitchColorIntervalTime: 0,
  autoSwitchColorInterval: null,
  changeColorEachTime: true,
  speed: 0.9,
  play: true,
  pointSize: 2,
  clear: () => init()
};

gui.add(params, "speed", 0, 30, 0.1);
gui.add(params, "pointSize", 0, 10, 0.1);
const playController = gui.add(params, "play");
const intervalController = gui.add(
  params,
  "autoSwitchPointsPositionIntervalTime",
  0,
  5,
  0.1
);
const colorIntervalController = gui.add(
  params,
  "autoSwitchColorIntervalTime",
  0,
  5,
  0.01
);
gui.add(params, "changeColorEachTime");
gui.add(params, "changeColor");
gui.add(params, "changePointsPosition");
gui.add(params, "clear");
gui.remember(params);

// GUI Events managing

playController.onFinishChange(val => {
  if (val === true) {
    animate(fps);
  }
});
intervalController.onFinishChange(val => {
  window.clearInterval(params.autoSwitchPointPositionInterval);
  if (val > 0) {
    params.autoSwitchPointPositionInterval = window.setInterval(
      bootstrapPoints,
      val * 1000
    );
  }
});
colorIntervalController.onFinishChange(val => {
  window.clearInterval(params.autoSwitchColorInterval);
  if (val > 0) {
    params.autoSwitchColorInterval = window.setInterval(
      params.changeColor,
      val * 1000
    );
  }
});

// Variables init

let currentTime = Date.now();
let lastTime = currentTime;
let points = [];
let fps = 60;

class Point {
  constructor(pos) {
    this.pos = pos;
    this.random = { x: Math.random(), y: Math.random() };
    this.mvmtVector = new Victor(
      this.random.x * params.speed - params.speed / 2,
      this.random.y * params.speed - params.speed / 2
    );
  }
  update(fpsCoeff) {
    const newPos = this.pos
      .clone()
      .add(
        this.mvmtVector.clone().multiply(new Victor(1 / fpsCoeff, 1 / fpsCoeff))
      );
    if (newPos.x < 0 || newPos.x >= canvas.width) {
      this.mvmtVector.invertX();
    }
    if (newPos.y < 0 || newPos.y >= canvas.height) {
      this.mvmtVector.invertY();
    }
    this.pos = this.pos.add(this.mvmtVector);
    return this;
  }
  draw() {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, params.pointSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
  }
}

function bootstrapPoints() {
  points = [];
  if (params.changeColorEachTime) params.changeColor();
  for (let i = 0; i < 2; i++) {
    points.push(
      new Point(
        new Victor(
          Math.random() * canvas.clientWidth,
          Math.random() * canvas.clientHeight
        )
      )
    );
  }
}

calcFPS({
  count: 30,
  callback: fps => {
    fps = fps;
    init(fps);
  }
});

function init(fps) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#333333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  bootstrapPoints();
  animate(fps);
}

function animate(expectedFPS) {
  lastTime = currentTime;
  currentTime = Date.now();
  const fps = 1000 / (currentTime - lastTime);

  for (let index = 0; index < points.length; index++) {
    const element = points[index];
    element.update(fps / expectedFPS).draw();
  }
  for (let n = 0; n < points.length - 1; n++) {
    const elementN = points[n];
    const elementN1 = points[n + 1];

    ctx.strokeStyle = params.color;
    // ctx.globalAlpha = convertRange(DISTANCE - distance, [0, 100], [0, 1]);
    ctx.beginPath();
    ctx.moveTo(elementN.pos.x, elementN.pos.y);
    // ctx.lineWidth = clamp(DISTANCE / distance, 0, 1) * 1;
    ctx.lineTo(elementN1.pos.x, elementN1.pos.y);
    ctx.stroke();
    ctx.closePath();
    // ctx.globalAlpha = 1;
  }
  if (params.play) {
    requestAnimationFrame(() => animate(expectedFPS));
  }
}

function clamp(number, min, max) {
  return Math.max(min, Math.min(number, max));
}
function convertRange(value, r1, r2) {
  return ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
}

function calcFPS(opts) {
  var requestFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame;
  if (!requestFrame) return true; // Check if "true" is returned;
  // pick default FPS, show error, etc...
  function checker() {
    if (index--) requestFrame(checker);
    else {
      // var result = 3*Math.round(count*1000/3/(performance.now()-start));
      var result = (count * 1000) / (performance.now() - start);
      if (typeof opts.callback === "function") opts.callback(result);
      console.log("Calculated: " + result + " frames per second");
    }
  }
  if (!opts) opts = {};
  var count = opts.count || 60,
    index = count,
    start = performance.now();
  checker();
}
