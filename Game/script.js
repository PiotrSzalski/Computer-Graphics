const CUBE_LINES = [[0, 1], [1, 3], [3, 2], [2, 0], [2, 6], [3, 7], [0, 4], [1, 5], [6, 7], [6, 4], [7, 5], [4, 5]];
const CUBE_VERTICES = [[-1, -1, -1],[1, -1, -1],[-1, 1, -1],[1, 1, -1],[-1, -1, 1],[1, -1, 1],[-1, 1, 1],[1, 1, 1]];
const cz = 0;
const ex = 500;
const ey = 500;
const ez = 1000;
const maxZ = 2000;
var canvas;
var ctx;
var maxX = 0;
var maxY = 0;
var cubes = [];
var stop = true;
var cx = 500;
var cy = 500;
var speed = 5;
var LEFT = false; 
var RIGHT = false;
var UP = false; 
var DOWN = false;
var points = 0;

window.onload = function() {
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	canvas.width = document.body.clientWidth-5; 
    canvas.height = document.body.clientHeight-5;
	maxX = canvas.width;
	maxY = canvas.height;
	ctx.font = "20px Georgia";
	ctx.beginPath();
	ctx.strokeStyle = "#00ff00";
	ctx.stroke();
	canvas.addEventListener('click', function(e) {
		if(stop) {
			newGame();
		}
	}, false);
	newGame();
}

document.onkeydown = function(e) {
	if(e.keyCode == 37) LEFT = true;
	if(e.keyCode == 39) RIGHT = true;
	if(e.keyCode == 38) UP = true;
	if(e.keyCode == 40) DOWN = true;
}

document.onkeyup = function(e) {
	if(e.keyCode == 37) LEFT = false;
	if(e.keyCode == 39) RIGHT = false;
	if(e.keyCode == 38) UP = false;
	if(e.keyCode == 40) DOWN = false;
}

class Cube {
	constructor() {
		this.x = Math.floor(Math.random() * maxX);
		this.y = Math.floor(Math.random() * maxY);
		this.z = Math.floor(Math.random() * 3000) + 1000;
	}
	
	draw() {
		for(let i = 0; i < CUBE_LINES.length; i++) {
			let p1 = CUBE_VERTICES[CUBE_LINES[i][0]];
			let p2 = CUBE_VERTICES[CUBE_LINES[i][1]];
			let verticle1 = [p1[0]*100+this.x,p1[1]*100+this.y,p1[2]*100+this.z];
			let varticle2 = [p2[0]*100+this.x,p2[1]*100+this.y,p2[2]*100+this.z];
			
			let dx = verticle1[0] - cx;
			let dy = verticle1[1] - cy;
			let dz = verticle1[2] - cz;
			
			if(dz - 100 < 0) {
				dz = 1;
			}

			let x = ez / dz * dx + ex;
			let y = ez / dz * dy + ey;
		
			ctx.moveTo(x, y);

			dx = varticle2[0] - cx;
			dy = varticle2[1] - cy;
			dz = varticle2[2] - cz;
		
			if(dz - 100 < 0) {
				dz = 1;
			}

			x = ez / dz * dx + ex;
			y = ez / dz * dy + ey;

			ctx.lineTo(x, y);
			ctx.stroke();
		}
	}
}

function clearCanvas() {
	ctx.beginPath();
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.stroke();
}

function render() {
	clearCanvas();
	ctx.fillStyle = "#ffffff";
	ctx.fillText("points: " + points, 10, 25);
	ctx.fillText("speed: " + speed.toFixed(3), 200, 25);
	speed += 0.01;
	points += 1;
	for(let i = 0; i < cubes.length; i++) {
		if(cubes[i].z < -300) {
			cubes.splice(i,1);
			cubes.push(new Cube());
			continue;
		}
		cubes[i].z -= speed;
		cubes[i].draw();
		if(cx > cubes[i].x - 100 && cx < cubes[i].x + 100 && cy > cubes[i].y - 100 && 
				cy < cubes[i].y + 100 && cubes[i].z - 200 < 0 && cubes[i].z + 200 > 0) {
			stop = true;
		}
	}
	move();
	if(!stop) {
		window.requestAnimationFrame(render);
	}
}

function move() {
	if (LEFT && cx > 0) {
		cx -= 10;
	}
	if (RIGHT && cx < maxX) {
		cx += 10;
	}
	if (UP && cy > 0) {
		cy -= 10;
	}
	if (DOWN && cy < maxY) {
		cy += 10;
	}
}

function newGame() {
	stop = false;
	cubes = [];
	points = 0;
	speed = 5;
	for(let i = 0; i < 20; i++) {
		cubes.push(new Cube(false));
	}
	window.requestAnimationFrame(render);
}