window.addEventListener('load', main);

function main() {
    initVariables();
    resizeCanvas();
    bindBuffers();
    createShaders();
    initializeShadersVars();
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    draw();
    
    console.log("ATTRIBUTES:");
    const numAttribs = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < numAttribs; ++i) {
        const info = gl.getActiveAttrib(shaderProgram, i);
        console.log('name:', info.name, 'type:', info.type, 'size:', info.size);
    }
    console.log("UNIFORMS:");
    const numUniforms = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < numUniforms; ++i) {
        const info = gl.getActiveUniform(shaderProgram, i);
        console.log('name:', info.name, 'type:', info.type, 'size:', info.size);
    }
}

function initVariables() {
    this.colors = [0.0, 0.0, 0.0, 1.0];
    this.vertices = [
        0.9, -0.25, -0.2,
        0.9, 0.25, 0,
        0.9, -0.25, 0.2,
    
        0.6, -0.25, 0.7,
        0.45, 0.25, 0.8,
        0.3, -0.25, 0.9,
    
        -0.3, -0.25, 0.9,
        -0.45, 0.25, 0.8,
        -0.6, -0.25, 0.7,
    
        -0.9, -0.25, 0.2,
        -0.9, 0.25, 0,
        -0.9, -0.25, -0.2,
    
        -0.6, -0.25, -0.7,
        -0.45, 0.25, -0.8,
        -0.3, -0.25, -0.9,
    
        0.3, -0.25, -0.9,
        0.45, 0.25, -0.8,
        0.6, -0.25, -0.7,
    ];
    this.canvas = document.getElementById('my_canvas');
    this.gl = canvas.getContext('webgl');
    this.matrix = mat4.create();
    this.sign = [true, true, true];
    this.type = gl.TRIANGLES;
}

function bindBuffers() {
    this.vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
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
    gl.bindAttribLocation(shaderProgram, 2, "pointSize");
    gl.attachShader(shaderProgram, vertShader);
    gl.attachShader(shaderProgram, fragShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
}

function initializeShadersVars() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1);
    var transformMatrix = gl.getUniformLocation(shaderProgram, "transformMatrix");
    gl.uniformMatrix4fv(transformMatrix, false, matrix);
    var colorUni = gl.getUniformLocation(shaderProgram, "colors");
    gl.uniform4fv(colorUni, colors);
    gl.vertexAttrib1f(2, 10.0);
}

function draw() {
    mat4.rotateX(matrix, matrix, 0.001);
    mat4.rotateY(matrix, matrix, 0.01);
    mat4.rotateZ(matrix, matrix, 0.005);
    changeColors();

    var colorUni = gl.getUniformLocation(shaderProgram, "colors");
    gl.uniform4fv(colorUni, this.colors);

    var transformMatrix = gl.getUniformLocation(shaderProgram, "transformMatrix");
    gl.uniformMatrix4fv(transformMatrix, false, matrix);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    gl.drawArrays(this.type, 0, vertices.length / 3);

    requestAnimationFrame(function () {
        draw();
    });
}

function changeColors() {
    for(i = 0; i < 3; i++) {
        if(sign[i]) {
            colors[i] += 0.003 * ( i + 1 ); 
        } else {
            colors[i] -= 0.003 * ( i + 1 ); 
        }
        if(colors[i] > 1.0) {
            colors[i] = 1.0;
            sign[i] = !sign[i];
        } else if (colors[i] < 0.0) {
            colors[i] = 0.0;
            sign[i] = !sign[i];
        }
    }  
}

function setType(button) {
    var expr = button.innerHTML;
    switch (expr) {
        case 'LINES':
            this.type = gl.LINES;
        break;
        case 'POINTS':
            this.type = gl.POINTS;
        break;
        case 'LINE_STRIP':
            this.type = gl.LINE_STRIP;
        break;
        case 'LINE_LOOP':
            this.type = gl.LINE_LOOP;
        break;
        case 'TRIANGLE_STRIP':
            this.type = gl.TRIANGLE_STRIP;
        break;
        case 'TRIANGLE_FAN':
            this.type = gl.TRIANGLE_FAN;
        break;
        case 'TRIANGLES':
            this.type = gl.TRIANGLES;
        break;
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth*0.75;
    canvas.height = window.innerHeight*0.98;
}