const maxX = 1000;
const maxY = 1000;
const maxZ = 1000;
const x0 = 500;
const y0 = 500;
const z0 = 500;
var canvas;
var ctx;
var px = 0;
var py = 0;
var angleXY = 0;
var angleYZ = 0;
var pen_down = true;
var mouseDown = false;
var ez = 1000;
var pTab;
var cTab;
var currCol;
var currWid;

window.onload = function () {
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	px = canvas.width / maxX;
	py = canvas.height / maxY;
	document.getElementById("command").onchange = function () {
		execute(document.getElementById("command").value);
		document.getElementById("lastCommand").innerHTML = document.getElementById("command").value;
		document.getElementById("command").value = "";
		let lastPoint = pTab[pTab.length - 1];
		document.getElementById("cords").innerHTML = lastPoint[0] + " " + lastPoint[1] + " " + lastPoint[2];
	};
	reset();
    cube();
	document.getElementById("cords").innerHTML = lastPoint[0] + " " + lastPoint[1] + " " + lastPoint[2];
	canvas.addEventListener('mousemove', mouseMove);
	canvas.addEventListener('mousedown', function (e) { mouseDown = true });
	canvas.addEventListener('mouseup', function (e) { mouseDown = false });
	canvas.addEventListener('wheel', scroll);
}

document.onkeydown = function (e) {
	if (e.keyCode == 109 && ez >= 100) {
		ez -= 100;
	}
	if (e.keyCode == 107) {
		ez += 100;
	}
	redraw();
}

class Conncetion {
	constructor(from, to, width, color) {
		this.from = from;
		this.to = to;
		this.width = width;
		this.color = color;
	}
}

function execute(command) {
	var splited = command.split(" ");
	if (typeof window[splited[0]] === 'function') {
		eval(splited[0])(splited[1], splited[2], splited[3])
	} else {
		alert("Function doesn't exist.");
	}
}

function reset() {
	angleXY = 0;
	angleYZ = 0;
	left(0);
	right(0);
	pTab = [[maxX / 2, maxY / 2, maxZ / 2]];
	cTab = [];
	color("000000");
	width(1);
	on();
	clear();
}

function goto(new_x, new_y, new_z) {
	new_x = parseFloat(new_x);
	new_y = parseFloat(new_y);
	new_z = parseFloat(new_z);
	if (isNaN(new_x) || isNaN(new_y) || isNaN(new_z)) {
		alert("Incorrect x, y or z.");
		return;
	}
	pTab.push([new_x, new_y, new_z]);
	if (pen_down) {
		let connection = new Conncetion(pTab.length - 2, pTab.length - 1, currWid, currCol);
		cTab.push(connection);
		redraw();
	}
}

function left(a) {
	a = parseFloat(a);
	if (isNaN(a)) {
		alert("Incorrect value of angle.");
		return;
	}
	angleXY -= a;
	while (angleXY < 0) {
		angleXY += 360;
	}
	document.getElementById("angleLR").innerHTML = angleXY;
}

function right(a) {
	a = parseFloat(a);
	if (isNaN(a)) {
		alert("Incorrect value of angle.");
		return;
	}
	angleXY += a;
	if (angleXY > 360) {
		angleXY %= 360;
	}
	document.getElementById("angleLR").innerHTML = angleXY;
}

function up(a) {
	a = parseFloat(a);
	if (isNaN(a)) {
		alert("Incorrect value of angle.");
		return;
	}
	angleYZ += a;
	if (angleYZ > 360) {
		angleYZ %= 360;
	}
	document.getElementById("angleUD").innerHTML = angleYZ;
}

function down(a) {
	a = parseFloat(a);
	if (isNaN(a)) {
		alert("Incorrect value of angle.");
		return;
	}
	angleYZ += a;
	if (angleYZ > 360) {
		angleYZ %= 360;
	}
	document.getElementById("angleUD").innerHTML = angleYZ;
}

function forward(d) {
	d = parseFloat(d);
	if (isNaN(d)) {
		alert("Incorrect distance");
		return;
	}
	dx = (d * Math.sin(angleXY * Math.PI / 180) * Math.cos(angleYZ * Math.PI / 180));
	dy = (d * Math.cos(angleXY * Math.PI / 180) * Math.cos(angleYZ * Math.PI / 180));
	dz = d * Math.sin(angleYZ * Math.PI / 180);
	var last = pTab[pTab.length - 1];
	pTab.push([last[0] + dx, last[1] + dy, last[2] + dz]);
	if (pen_down) {
		let connection = new Conncetion(pTab.length - 2, pTab.length - 1, currWid, currCol);
		cTab.push(connection);
		redraw();
	}
}

function clear() {
	lastPoint = pTab[pTab.length - 1];
	pTab = [lastPoint];
	cTab = [];
	clearCanvas();
}

function clearCanvas() {
	ctx.beginPath();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.stroke();
}

function width(w) {
	w = parseInt(w);
	if (isNaN(w)) {
		alert("Incorrect value of width.");
		return;
	}
	document.getElementById("width").innerHTML = w;
	currWid = w;
	ctx.beginPath();
	ctx.lineWidth = w;
	ctx.stroke();
}

function color(c) {
	var color_form = /^(?:[0-9a-f]{3}){1,2}$/i;
	if (!color_form.test(c)) {
		alert("Incorrect vale of color.");
	} else {
		currCol = c;
		document.getElementById("color").innerHTML = c;
		document.getElementById("color").style.color = '#' + c;
		ctx.beginPath();
		ctx.strokeStyle = '#' + c;
		ctx.stroke();
	}
}

function off() {
	pen_down = false;
	document.getElementById("pen_down").innerHTML = "Off";
}

function on() {
	pen_down = true;
	document.getElementById("pen_down").innerHTML = "On";
}

function cY(y) {
	return (maxY - y) * py;
}

function cX(x) {
	return x * px;
}

function cZ(z) {
	if (z < 0) {
		return 0;
	} else if (z > maxZ) {
		return maxZ;
	} else {
		return z;
	}
}

function rotateX(ang) {
	let sina = Math.sin(ang * Math.PI / 180);
	let cosa = Math.cos(ang * Math.PI / 180);
	pTab.forEach(function (p) {
		let y = p[1] - y0;
		let z = p[2] - z0;
		p[1] = y * cosa - z * sina + y0;
		p[2] = y * sina + z * cosa + z0;
	});
}

function rotateY(ang) {
	let sina = Math.sin(ang * Math.PI / 180);
	let cosa = Math.cos(ang * Math.PI / 180);
	pTab.forEach(function (p) {
		let x = p[0] - x0;
		let z = p[2] - z0;
		p[0] = x * cosa + z * sina + x0;
		p[2] = (-x) * sina + z * cosa + z0;
	});
}

function rotateZ(ang) {
	let sina = Math.sin(ang * Math.PI / 180);
	let cosa = Math.cos(ang * Math.PI / 180);
	pTab.forEach(function (p) {
		let x = p[0] - x0;
		let y = p[1] - y0;
		p[0] = x * cosa - y * sina + x0;
		p[1] = x * sina + y * cosa + z0;
	});
}

function scroll(event) {
	if (event.wheelDelta > 0) {
		rotateZ(2);
	} else {
		rotateZ(-2);
	}
	redraw();
}

var oldy = 0;
var oldx = 0;

function mouseMove(e) {
	if (mouseDown) {
		if (e.pageX < oldx) {
			rotateY(-2);
		} else if (e.pageX > oldx) {
			rotateY(2);
		}
		oldx = e.pageX;
		if (e.pageY < oldy) {
			rotateX(-2);
		} else if (e.pageY > oldy) {
			rotateX(2);
		}
		oldy = e.pageY;
	}
	redraw();
}
var stroboscope = false;

function strobo() {
	stroboscope = !stroboscope;
	color("000000");
	if (stroboscope) {
		document.getElementById("type").innerHTML = "Wersja stroboskopowa";
	} else {
		document.getElementById("type").innerHTML = "Wersja monoskopowa";
	}
	redraw();
}

function redraw() {
	clearCanvas();
	if (stroboscope) {
		rotateY(-3);
		drawLines("ff0000");
		rotateY(3);
		drawLines("00ffff");
	} else {
		drawLines("");
	}
}

function drawLines(col) {
	const cx = 500;
	const cy = 500;
	const cz = -500;
	const ex = 500;
	const ey = 500;
	cTab.forEach(function (c) {
		let p1 = pTab[c.from];
		let p2 = pTab[c.to];

		let dx = p1[0] - cx;
		let dy = p1[1] - cy;
		let dz = p1[2] - cz;

		let x = ez / dz * dx + ex;
		let y = ez / dz * dy + ey;
		ctx.beginPath();
		if (stroboscope) {
			ctx.strokeStyle = '#' + col;
			ctx.lineWidth = 1;
		} else {
			ctx.strokeStyle = '#' + c.color;
			ctx.lineWidth = c.width;
		}
		ctx.stroke();
		ctx.moveTo(cX(x), cY(y));

		dx = p2[0] - cx;
		dy = p2[1] - cy;
		dz = p2[2] - cz;

		x = ez / dz * dx + ex;
		y = ez / dz * dy + ey;

		ctx.lineTo(cX(x), cY(y));
		ctx.stroke();
	});
}

function cube() {
	pTab = [[300, 300, 300], [300, 700, 300], [700, 700, 300], [700, 300, 300], [300, 300, 700], [300, 700, 700], [700, 700, 700], [700, 300, 700]];
	let c = "000000";
	cTab = [new Conncetion(0, 1, 1, c), new Conncetion(1, 2, 1, c), new Conncetion(2, 3, 1, c), new Conncetion(3, 0, 1, c),
	new Conncetion(4, 5, 1, c), new Conncetion(5, 6, 1, c), new Conncetion(6, 7, 1, c), new Conncetion(7, 4, 1, c),
	new Conncetion(0, 4, 1, c), new Conncetion(1, 5, 1, c), new Conncetion(2, 6, 1, c), new Conncetion(3, 7, 1, c)];
	redraw();
}

function pyr() {
	pTab = [[300, 300, 300], [700, 300, 300], [700, 300, 700], [300, 300, 700], [500, 700, 500]];
	let c = "000000";
	cTab = [new Conncetion(0, 1, 1, c), new Conncetion(1, 2, 1, c), new Conncetion(2, 3, 1, c), new Conncetion(3, 0, 1, c),
	new Conncetion(0, 4, 1, c), new Conncetion(1, 4, 1, c), new Conncetion(2, 4, 1, c), new Conncetion(3, 4, 1, c)];
	redraw();
}