window.addEventListener('load', main);

var selected, item;
var hilberts = [];
var points = [];

function main() {
    initVariables();
    resizeCanvas();
    bindBuffers();
    createShaders();
    initializeShadersVars();
    canvas.addEventListener('wheel', scroll);
    document.getElementById("color").addEventListener("input", changeColor);
    document.getElementById("order").addEventListener("input", setOrder);
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    addHilbert(3);
    selected = hilberts[0];
    item = document.getElementById("0");
    redraw();
}

function initVariables() {
    this.canvas = document.getElementById('my_canvas');
    this.gl = canvas.getContext('webgl');
}

function bindBuffers() {
    this.vertex_buffer = gl.createBuffer();
    this.color_buffer = gl.createBuffer();
}

function createShaders() {
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertShader, document.getElementById("vertShader").textContent);
    gl.compileShader(vertShader);
    gl.shaderSource(fragShader, document.getElementById("fragShader").textContent);
    gl.compileShader(fragShader);
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
}

function initializeShadersVars() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);
}

function resizeCanvas() {
    canvas.width = 700;
    canvas.height = 700;
}

function generateHilbert(x, y, w, i1, i2) {
    if (w === 1) {
        let px = (x * space + space / 2) / 350 - 1;
        let py = (y * space + space / 2) / 350 - 1;
        pts.push(px);
        pts.push(py);
        return;
    }
    w /= 2;
    generateHilbert(x + i1 * w, y + i1 * w, w, i1, 1 - i2);
    generateHilbert(x + i2 * w, y + (1 - i2) * w, w, i1, i2);
    generateHilbert(x + (1 - i1) * w, y + (1 - i1) * w, w, i1, i2);
    generateHilbert(x + (1 - i2) * w, y + i2 * w, w, 1 - i1, i2);
	return pts;
};

function addHilbert(order) {
	pts = [];
    wwidth = 2 ** order;
    space = parseInt(700)/wwidth;
    let hilbert = generateHilbert(0, 0, wwidth, 0, 0);
    hilberts.push(new Hilbert(hilberts.length,points.length,hilbert,[1.0,1.0,1.0,1.0],1.0,order,0.0,0.0));
    points = points.concat(hilbert);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    var iDiv = document.createElement('div');
    var textnode = document.createTextNode("Hilbert " + hilberts.length);
    iDiv.id = hilberts.length - 1;
    iDiv.addEventListener('click', chooseHilbert);
    iDiv.className = "hilbert"; 
    iDiv.appendChild(textnode);
    document.getElementsByTagName('div')[0].appendChild(iDiv);
    redraw();
}

function chooseHilbert(event) {
    item = event.target;
    hilberts.forEach(hilb => {
        if(hilb.index == item.id) {
            selected = hilb;
            return;
        }
    })
    document.getElementById("order").value = selected.order;
    document.getElementById("orderText").innerHTML = "Stopień krzywej: " + selected.order;
}

class Hilbert {
    constructor(index,offset,points,colors,depth,order,dx,dy) {
        this.index = index;
        this.points = points;
        this.colors = colors;
        this.depth = depth;
        this.order = order;
        this.offset = offset;
        this.dx = dx;
        this.dy = dy;
    }
}

function redraw() {
    hilberts.sort(function(a,b) {
        if (a.depth < b.depth) {
            return -1;
        }
        if (b.depth > a.depth) {
            return 1;
        }
        return 0;
    });
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    for(i = 0; i < hilberts.length; i++) {
        var colorUni = gl.getUniformLocation(shaderProgram, "colors");
        gl.uniform4fv(colorUni, hilberts[i].colors);
        var depth = gl.getAttribLocation(shaderProgram, "depth");
        gl.vertexAttrib1f(depth, hilberts[i].depth);
        var dx = gl.getAttribLocation(shaderProgram, "dx");
        gl.vertexAttrib1f(dx, hilberts[i].dx);
        var dy = gl.getAttribLocation(shaderProgram, "dy");
        gl.vertexAttrib1f(dy, hilberts[i].dy);
        gl.drawArrays(gl.LINE_STRIP, hilberts[i].offset/2, hilberts[i].points.length/2);
    }
}

function changeColor() {
    selected.colors = hexToRgb(document.getElementById("color").value);
    item.style.background = document.getElementById("color").value;
    redraw();
}

function changeDepth() {
    selected.depth = document.getElementById("depth").value;
    redraw();
}

function setOrder() {
    order = document.getElementById("order").value;
    document.getElementById("orderText").innerHTML = "Stopień krzywej: " + order;
    points = [];
    index = -1;
    deleted = null;
    for(i = 0; i < hilberts.length; i++) {
        if(JSON.stringify(selected) === JSON.stringify(hilberts[i])) {
            index = i;
            deleted = hilberts[i];
        } else {
            hilberts[i].offset = points.length;
            points = points.concat(hilberts[i].points);
        }
    }
    pts = [];
    wwidth = 2 ** order;
    space = parseInt(700)/wwidth;
    let hilbert = generateHilbert(0, 0, wwidth, 0, 0);
    selected = new Hilbert(deleted.index,points.length,hilbert,deleted.colors,deleted.depth,order,deleted.dx,deleted.dy);
    hilberts.push(selected);
    points = points.concat(hilbert);
    hilberts.splice(index,1);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    redraw();
}

function scroll(event) {
	if (event.wheelDelta > 0 && selected.depth < 9) {
        selected.depth += 0.5;
	} else if(selected.depth > 0) {
		selected.depth -= 0.5;
	}
	redraw();
}

document.onkeyup = function(e) {
    if(e.keyCode == 39) {
        selected.dx += 0.1;
    } else if(e.keyCode == 40) {
        selected.dy -= 0.1;
    } else if(e.keyCode == 38) {
        selected.dy += 0.1;
    } else if(e.keyCode == 37) {
        selected.dx -= 0.1;
    }
    redraw();
};

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return [parseInt(result[1], 16) / 255,parseInt(result[2], 16) / 255,parseInt(result[3], 16) / 255,1.0];
}
  