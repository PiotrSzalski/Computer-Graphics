window.addEventListener('load', main);

var staticVerticles = [];
var offset = 0;
var rx,ry;

const background = {
    points: createRectangle(-1.0, 1.0, 1.0, -1.0),
    color: [0.0, 0.0, 0.0, 0.5],
    depth: 1.0
}

const playground = {
    points: createRectangle(-0.8, 0.8, -1.0, 1.0),
    color: [0.0, 0.0, 0.0, 0.8],
    depth: 0.9
}

const net = {
    points: createRectangle(-0.005, 0.005, 1.0, -1.0),
    color: [1.0, 1.0, 1.0, 1.0],
    depth: 0.8
}

const frame = {
    points: createRectangle(0.795, 0.79, 0.99, -0.99)
        .concat(createRectangle(-0.795, -0.79, 0.99, -0.99))
        .concat(createRectangle(-0.795, 0.795, 0.99, 0.98))
        .concat(createRectangle(-0.795, 0.79, -0.99, -0.98)),
    color: [1.0, 1.0, 1.0, 1.0],
    depth: 0.8
}

const ball = {
    points: [0.0, 0.0],
    color: [0.4, 1.0, 0.2, 1.0],
    depth: 0.5,
    dx: 0.01,
    dy: 0.01
}

const playerLeft = {
    points: createRectangle(-0.78, -0.75, 0.2, -0.2),
    color: [1.0, 1.0, 0.0, 1.0],
    depth: 0.5,
}

const playerRight = {
    points: createRectangle(0.78, 0.75, 0.2, -0.2),
    color: [1.0, 1.0, 0.0, 1.0],
    depth: 0.5
}

function main() {
    initVariables();
    resizeCanvas();
    createBuffers();
    createShaders();
    initializeShadersVars();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    redraw();
}

function initVariables() {
    this.canvas = document.getElementById('my_canvas');
    this.gl = canvas.getContext('webgl');
    this.matrix = mat4.create();
    staticVerticles = staticVerticles.concat(background.points, playground.points, net.points, frame.points);
}

function createBuffers() {
    this.vertex_buffer = gl.createBuffer();
}

function createShaders() {
    var vertShader = gl.createShader(gl.VERTEX_SHADER);
    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertShader, document.getElementById("vertShader").textContent);
    gl.compileShader(vertShader);
    gl.shaderSource(fragShader, document.getElementById("fragShader").textContent);
    gl.compileShader(fragShader);
    shaderProgram = gl.createProgram();
    gl.bindAttribLocation(shaderProgram, 1, "coordinates");
    gl.bindAttribLocation(shaderProgram, 3, "depth");
    gl.bindAttribLocation(shaderProgram, 4, "colors");
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
}

function initializeShadersVars() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1);
    var transformMatrix = gl.getUniformLocation(shaderProgram, "transformMatrix");
    gl.uniformMatrix4fv(transformMatrix, false, matrix);
}

function redraw() {
    refreshPlayers();
    offset = 0;
    var circle = [];
    for(i = 0; i < 180; i++) {
        circle.push(ball.points[0]+rx*Math.cos(i*2 * (Math.PI/180)));
        circle.push(ball.points[1]+ry*Math.sin(i*2 * (Math.PI/180)));
    }
    let allVerticles = staticVerticles.concat(circle, playerLeft.points, playerRight.points);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(allVerticles), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    drawBackground();
    drawBall();
    drawPlayers();
    requestAnimationFrame(function () {
        redraw();
    });
}

function drawBackground() {
    gl.vertexAttrib4fv(4, background.color);
    gl.vertexAttrib1f(3, background.depth);
    gl.drawArrays(gl.TRIANGLES, offset, 6);
    offset += 6;
    gl.vertexAttrib4fv(4, playground.color);
    gl.vertexAttrib1f(3, playground.depth);
    gl.drawArrays(gl.TRIANGLES, offset, 6);
    offset += 6;
    gl.vertexAttrib4fv(4, net.color);
    gl.vertexAttrib1f(3, net.depth);
    gl.drawArrays(gl.TRIANGLES, offset, 6);
    offset += 6;
    gl.vertexAttrib4fv(4, frame.color);
    gl.vertexAttrib1f(3, frame.depth);
    gl.drawArrays(gl.TRIANGLES, offset, 24);
    offset += 24;
}

function drawBall() {
    checkCollision();
    ball.points[0] += ball.dx;
    ball.points[1] += ball.dy;
    gl.vertexAttrib4fv(4, ball.color);
    gl.vertexAttrib1f(3, ball.depth);
    gl.drawArrays(gl.TRIANGLE_FAN, offset, 180);
    offset += 180;
}

function drawPlayers() {
    gl.vertexAttrib4fv(4, playerLeft.color);
    gl.vertexAttrib1f(3, playerLeft.depth);
    gl.drawArrays(gl.TRIANGLES, offset, 6);
    offset += 6;
    gl.vertexAttrib4fv(4, playerRight.color);
    gl.vertexAttrib1f(3, playerRight.depth);
    gl.drawArrays(gl.TRIANGLES, offset, 6);
    offset += 6;
}

function checkCollision() {
    if (ball.points[0] < -1.0 || ball.points[0] > 1.0) {
        ball.points[0] = 0.0;
        ball.points[1] = 0.0;
        ball.dx = 0.01 * Math.sign(Math.random() * 2 - 1);
        ball.dy = 0.01 * Math.sign(Math.random() * 2 - 1);
    } 
    if (ball.points[1] + ry > 0.98) {
        ball.dy = -ball.dy;
    } else if (ball.points[1] - ry < -0.98) {
        ball.dy = -ball.dy
    }
    if (ball.points[0] + rx >= 0.75 && ball.points[0] + rx <= 0.77) {
        if (ball.points[1] < playerRight.points[1] && ball.points[1] > playerRight.points[5]) {
            ball.dx = -ball.dx;
            ball.dy = computeDy(playerRight);
        }
    } else if (ball.points[0] - rx >= -0.77 && ball.points[0] - rx <= -0.75) {
        if (ball.points[1] < playerLeft.points[1] && ball.points[1] > playerLeft.points[5]) {
            ball.dx = -ball.dx;
            ball.dy = computeDy(playerLeft);
        }
    }
}

function computeDy(player) {
    let d = Math.abs(player.points[5] - player.points[1]) / 7;
    let y = ball.points[1];
    let direction = Math.sign(ball.dy);
    if (direction === 0) {
        direction = Math.sign(Math.random() * 2 - 1);
    }
    if (player.points[1] - 3 * d > y && player.points[5] + 3 * d < y) {
        return 0;
    } else if (player.points[1] - 2 * d > y && player.points[5] + 2 * d < y) {
        return direction * 0.005;
    } else if (player.points[1] - d > y && player.points[5] + d < y) {
        return direction * 0.01;
    } else {
        return direction * 0.015;
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth * 0.99;
    canvas.height = window.innerHeight * 0.97;
    rx = 0.015;
    ry = rx * canvas.width / canvas.height;
}

function refreshPlayers() {
    if (keyState.up) {
        for (i = 1; i < 12; i += 2) {
            playerRight.points[i] += 0.03;
        }
    } else if (keyState.down) {
        for (i = 1; i < 12; i += 2) {
            playerRight.points[i] -= 0.03;
        }
    }
    if (keyState.w) {
        for (i = 1; i < 12; i += 2) {
            playerLeft.points[i] += 0.03;
        }
    } else if (keyState.s) {
        for (i = 1; i < 12; i += 2) {
            playerLeft.points[i] -= 0.03;
        }
    }
}

function createRectangle(x1, x2, y1, y2) {
    let rec = [
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y2,
        x2, y1
    ]
    return rec;
}

const keyState = {
    up: false,
    down: false,
    w: false,
    s: false
};

document.addEventListener('keydown', function (e) {
    const keyName = e.key || e["keyIdentifier"];
    if (keyName === "ArrowUp") {
        keyState.up = true;
    }
    if (keyName === "ArrowDown") {
        keyState.down = true;
    }
    if (keyName === "w") {
        keyState.w = true;
    }
    if (keyName === "s") {
        keyState.s = true;
    }
});

document.addEventListener('keyup', function (e) {
    const keyName = e.key || e["keyIdentifier"];
    if (keyName === "ArrowUp") {
        keyState.up = false;
    }
    if (keyName === "ArrowDown") {
        keyState.down = false;
    }
    if (keyName === "w") {
        keyState.w = false;
    }
    if (keyName === "s") {
        keyState.s = false;
    }
});