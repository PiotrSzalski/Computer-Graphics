var width = 0;
var space = 0;
var points = [];

function hilbert(x, y, w, i1, i2) {
    if (w === 1) {
        var px = (width - x) * space;
        var py = (width - y) * space;
        points.push(px, py);
        return;
    }
    w /= 2;
    hilbert(x + i1 * w, y + i1 * w, w, i1, 1 - i2);
    hilbert(x + i2 * w, y + (1 - i2) * w, w, i1, i2);
    hilbert(x + (1 - i1) * w, y + (1 - i1) * w, w, i1, i2);
    hilbert(x + (1 - i2) * w, y + i2 * w, w, 1 - i1, i2);
    return points;
};

function drawHilbert(order) {
	var svg_width = document.getElementById("svg").getAttribute('width');
	points = [];
    width = 2 ** order;
	space = parseInt(svg_width)/width;
	points = hilbert(0, 0, width, 0, 0);
	document.getElementById("svg").setAttribute("viewBox",(space / 2)+" "+(space / 2)+" "+svg_width+" "+svg_width);
	document.getElementById("path").setAttribute("d","M"+points.join(' '));
};

function draw() {
	drawHilbert(document.getElementById("slider").value);
}

function change() {
	document.getElementById("value").innerHTML = "Stopien = "+document.getElementById("slider").value;
}