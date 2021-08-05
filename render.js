

const gameCanvas = document.getElementById("game");
const gameWidth = gameCanvas.width;
const gameHeight = gameCanvas.height;

const gctx= gameCanvas.getContext("2d");

const netCanvas = document.getElementById("neural-net");
const netWidth = netCanvas.width;
const netHeight = netCanvas.height;

const nctx= netCanvas.getContext("2d");

const graphCanvas = document.getElementById("graph");
const graphWidth = graphCanvas.width;
const graphHeight = graphCanvas.height;

const grctx= graphCanvas.getContext("2d");

gctx.fillStyle = "black";
gctx.fillRect(0, 0, gameWidth, gameHeight);

nctx.fillStyle = 'white';
nctx.fillRect(0, 0, netWidth, netHeight);

grctx.fillStyle = "white";
grctx.fillRect(0, 0, graphWidth, graphHeight);
