let PVSHADER =`
    precision mediump float;

    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;

    varying vec3 n;
    varying vec4 worldPos;

    void main(){
      vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);
      //worldpos is the vertex

      vec3 n = normalize(u_NormalMatrix * vec4(a_Normal, 0.0)).xyz; // Normal
      gl_Position = worldPos;
    }
`;
let PFSHADER=`
  precision mediump float;
  varying vec3 n;
  varying vec4 worldPos;

  uniform vec3 u_eyePosition;
  uniform vec3 u_Color;
  uniform vec3 u_diffuseColor;
  uniform vec3 u_ambientColor;
  uniform vec3 u_specularColor;
  uniform float u_specularAlpha;
  uniform vec3 u_lightPosition;

  void main(){
      vec3 l = normalize(u_lightPosition - worldPos.xyz); // Light direction
      vec3 v = normalize(u_eyePosition - worldPos.xyz);   // View direction
      vec3 r = reflect(l, n); // Reflected light direction

      // reflect uses this formula to calculate the reflection Vector, r
      // I = incident vector, N = normal vector
      // r = I - 2.0*(dot(I, normalize(N))*normalize(N);

      // Ambient light (flat shading)
      vec3 ambient = u_ambientColor * u_Color;

      // Diffuse light (flat shading)
      float nDotL = max(dot(l, n), 0.0);
      vec3 diffuse = u_diffuseColor * u_Color * nDotL;

      // Specular light
      float rDotV = max(dot(r, v), 0.0);
      float rDotVPowAlpha = pow(rDotV, u_specularAlpha);
      vec3 specular = u_specularColor * u_Color * rDotVPowAlpha;

      // Final light color
      gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
  }
`;
let GVSHADER=`
    precision mediump float;
    attribute vec3 a_Position;
    attribute vec3 a_Normal;

    uniform vec3 u_eyePosition;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_NormalMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjMatrix;

    uniform vec3 u_Color;

    uniform vec3 u_diffuseColor;
    uniform vec3 u_ambientColor;
    uniform vec3 u_specularColor;
    uniform float u_specularAlpha;
    uniform vec3 u_lightPosition;
    uniform vec3 u_pointLight;
    uniform vec3 u_directionalLight;
    varying vec4 v_Color;
    uniform float u_pointToggle;
    uniform float u_dirToggle;

    void main() {
        //If all of these calculations are in the vertex shader than it is Gourade
        // Mapping obj coord system to world coord system
        vec4 worldPos = u_ModelMatrix * vec4(a_Position, 1.0);
        //worldpos is the vertex

        vec3 n = normalize(u_NormalMatrix * vec4(a_Normal, 0.0)).xyz; // Normal
        vec3 pointL = normalize(u_pointLight - worldPos.xyz); // Light direction
        vec3 dirL = normalize(u_directionalLight);
        vec3 v = normalize(u_eyePosition - worldPos.xyz);   // View direction
        vec3 pointRefl = reflect(pointL, n); // Reflected point light direction
        vec3 dirRefl = reflect(dirL, n); // Reflected point light direction

        // reflect uses this formula to calculate the reflection Vector, r
        // I = incident vector, N = normal vector
        // r = I - 2.0*(dot(I, normalize(N))*normalize(N);

        // Ambient light (flat shading)
        vec3 ambient = u_ambientColor * u_Color;

        // Diffuse light (flat shading)
        float point_nDotL = max(dot(pointL, n), 0.0);
        float dir_nDotL = max(dot(dirL, n), 0.0);
        vec3 pointDiffuse = u_diffuseColor * u_Color * point_nDotL;
        vec3 dirDiffuse = u_diffuseColor * u_Color * dir_nDotL;
        vec3 diffuse = pointDiffuse*u_pointToggle + dirDiffuse*u_dirToggle;


        // Specular light
        float prDotV = max(dot(pointRefl, v), 0.0);
        float drDotV = max(dot(dirRefl, v), 0.0);
        float prDotVPowAlpha = pow(prDotV, u_specularAlpha);
        float drDotVPowAlpha = pow(drDotV, u_specularAlpha);
        vec3 pointSpecular = u_specularColor * u_Color * prDotVPowAlpha;
        vec3 dirSpecular = u_specularColor * u_Color * drDotVPowAlpha;
        vec3 specular = pointSpecular*u_pointToggle + dirSpecular*u_dirToggle;

        // Final light color
        v_Color = vec4(ambient + diffuse + specular, 1.0);

        gl_Position = u_ProjMatrix * u_ViewMatrix * worldPos;
    }
`;

let GFSHADER=`
    //If all of these calculations are in the fragment shader than it is Phong
    precision mediump float;
    uniform vec3 u_Color;
    varying vec4 v_Color;

    void main() {
        gl_FragColor = v_Color;
    }
`;
let wireframe = false;
let modelMatrix = new Matrix4();
let normalMatrix = new Matrix4();

// Models in the world
let lightPosition = new Vector3([1.0, 1.0, -1.0]);
let directionalLight = new Vector3([1.0, 3.0, -3.0]);
let pointLight = new Vector3([0.0, 1.0, 2.0]);

let eyePosition = new Vector3([0.0, 0.0, 0.0]);
let models = [];

// Uniform locations
let u_ModelMatrix = null;
let u_NormalMatrix = null;
let u_ViewMatrix = null;
let u_ProjMatrix = null;

let u_Color = null;
let u_diffuseColor = null;
let u_ambientColor = null;
let u_specularColor = null;
let u_specularAlpha = null;

let u_lightPosition = null;
let u_eyePosition = null;
let u_directionalLight = null;
let u_pointLight = null;
let u_pointToggle = 1.0;
let u_dirToggle = 1.0;
function drawModel(model){

  modelMatrix.setIdentity();
  // Apply translation for this part of the animal
  modelMatrix.translate(model.translate[0], model.translate[1], model.translate[2]);

  // Apply rotations for this part of the animal
  modelMatrix.rotate(model.rotate[0], 1, 0, 0);
  modelMatrix.rotate(model.rotate[1], 0, 1, 0);
  modelMatrix.rotate(model.rotate[2], 0, 0, 1);

  // Apply scaling for this part of the animal
  modelMatrix.scale(model.scale[0], model.scale[1], model.scale[2]);

  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

  // Compute normal matrix N_mat = (M^-1).T
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  gl.uniform3f(u_Color, model.color[0], model.color[1], model.color[2]);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
  if(document.getElementById("shadingSelect").value == "flat"){
  // if(document.getElementById("smooth").checked == false){
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
  }else{
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, model.smooth_normals, gl.STATIC_DRAW);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indices, gl.STATIC_DRAW);
  if(document.getElementById("shadingSelect").value != "wireframe"){
    gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
  }else{
    gl.drawElements(gl.LINE_LOOP, model.indices.length, gl.UNSIGNED_SHORT, 0);
  }


}
function initBuffer(attibuteName, n) {
    let shaderBuffer = gl.createBuffer();
    if(!shaderBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, shaderBuffer);

    let shaderAttribute = gl.getAttribLocation(gl.program, attibuteName);
    gl.vertexAttribPointer(shaderAttribute, n, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderAttribute);

    return shaderBuffer;
}
let t = 0;
let twirl = false;
function draw(){
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //cameraRotation = cameraRotation.multiplyVector3(camera.eye.elementts);

  // // Update eye position in the shader
  gl.uniform3fv(u_eyePosition, camera.eye.elements);

  // Update View matrix in the shader
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);

  // Update Projection matrix in the shader
  gl.uniformMatrix4fv(u_ProjMatrix, false, camera.projMatrix.elements);

  for(let m of models) {
      drawModel(m);
  }
  if(twirl == true && t <= 1){
    camera.twirl(3, t);
    t += 0.001;
  } else {
    t = 0;
    twirl = false;
  }
  requestAnimationFrame(draw);
}
function onZoomInput(value) {
    console.log(1.0 + value/10);
    camera.zoom(1.0 + value/10);
}
window.addEventListener("keydown", function(event) {
    let speed = 0.1;

    switch (event.key) {
        case "w":
            console.log("forward");
            camera.moveForward(speed);
            break;
        case "a":
            console.log("left");
            camera.moveSideways(-speed);
            break;
        case "s":
            console.log("back");
            camera.moveForward(-speed);
            break;
        case "d":
            console.log("right");
            camera.moveSideways(speed);
            break;

        case "q":
            console.log("pan left");
            camera.pan(5);
            break;
        case "e":
            console.log("pan right");
            camera.pan(-5);
            break;
        case "z":
            console.log("tilt up");
            camera.tilt(5);
            break;
        case "x":
            console.log("tilt down");
            camera.tilt(-5);
            break;
        case "t":
            if(twirl == true){
              twirl = false;
            }else{
              twirl = true;
            }


    }
});
window.addEventListener("mousemove", function(event) {
     //console.log(event.movementX, event.movementY);
})

function addModel(color, shapeType) {
    let model = null;
    switch (shapeType) {
        case "cube":
            model = new Cube(color);
            break;
        case "sphere":
            model = new Sphere(color, 13);
            break;
        case "cylinder":
            model = new Cylinder(color);
    }

    if(model) {
        models.push(model);

        // Add an option in the selector
        let selector = document.getElementById("modelSelect");
        let modelOption = document.createElement("option");
        modelOption.text = shapeType + " " + models.length;
        modelOption.value = models.length - 1;
        selector.add(modelOption);

        // Activate the cylinder we just created
        selector.value = modelOption.value;
    }

    return model;
}
function deleteModel(){
  let selector = document.getElementById("modelSelect");
  let index = selector.selectedIndex;
  //console.log(selector.selectedIndex);
  models.splice(selector.selectedIndex, 1);
  selector.remove(index);
}
function addCylinderEvent(){

  let cylinder = addModel([0.9, 0.9, 0.9], "cylinder");
  //let cylinder = new Cylinder([1.0, 0.0, 0.0]);
  // Display the default slider value
  var translateX = document.getElementById("translateX").value/100.0;
  var translateY = document.getElementById("translateY").value/100.0;
  var translateZ = document.getElementById("translateZ").value/100.0;
  var rotateX = document.getElementById("rotateX").value;
  var rotateY = document.getElementById("rotateY").value;
  var rotateZ = document.getElementById("rotateZ").value;
  var scaleX = document.getElementById("scaleX").value/100.0;
  var scaleY = document.getElementById("scaleY").value/100.0;
  var scaleZ = document.getElementById("scaleZ").value/100.0;
  cylinder.setTranslate(translateX, translateY, translateZ);
  cylinder.setRotate(rotateX, rotateY, rotateZ);
  cylinder.setScale(scaleX, scaleY, scaleZ);
  draw();
}
function addSphereEvent(){

  let sphere = addModel([0.9, 0.9, 0.9], "sphere");
  //let cylinder = new Cylinder([1.0, 0.0, 0.0]);
  // Display the default slider value
  var translateX = document.getElementById("translateX").value/100.0;
  var translateY = document.getElementById("translateY").value/100.0;
  var translateZ = document.getElementById("translateZ").value/100.0;
  var rotateX = document.getElementById("rotateX").value;
  var rotateY = document.getElementById("rotateY").value;
  var rotateZ = document.getElementById("rotateZ").value;
  var scaleX = document.getElementById("scaleX").value/100.0;
  var scaleY = document.getElementById("scaleY").value/100.0;
  var scaleZ = document.getElementById("scaleZ").value/100.0;
  sphere.setTranslate(translateX, translateY, translateZ);
  sphere.setRotate(rotateX, rotateY, rotateZ);
  sphere.setScale(scaleX, scaleY, scaleZ);

  draw();
}
function addCubeEvent(){

  let cube = addModel([0.9, 0.9, 0.9], "cube");
  //let cylinder = new Cylinder([1.0, 0.0, 0.0]);
  // Display the default slider value
  var translateX = document.getElementById("translateX").value/100.0;
  var translateY = document.getElementById("translateY").value/100.0;
  var translateZ = document.getElementById("translateZ").value/100.0;
  var rotateX = document.getElementById("rotateX").value;
  var rotateY = document.getElementById("rotateY").value;
  var rotateZ = document.getElementById("rotateZ").value;
  var scaleX = document.getElementById("scaleX").value/100.0;
  var scaleY = document.getElementById("scaleY").value/100.0;
  var scaleZ = document.getElementById("scaleZ").value/100.0;
  cube.setTranslate(translateX, translateY, translateZ);
  cube.setRotate(rotateX, rotateY, rotateZ);
  cube.setScale(scaleX, scaleY, scaleZ);
  draw();
}


function main() {
    // Retrieving the canvas tag from html document
    canvas = document.getElementById("canvas");

    // Get the rendering context for 2D drawing (vs WebGL)
    gl = canvas.getContext("webgl");
    if(!gl) {
        console.log("Failed to get webgl context");
        return -1;
    }

    // Clear screen
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      if(!initShaders(gl, GVSHADER, GFSHADER)) {
          console.log("Failed to initialize shaders.");
          return -1;
      }


    // Retrieve uniforms from shaders
    u_Color = gl.getUniformLocation(gl.program, "u_Color");
    u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    u_ambientColor = gl.getUniformLocation(gl.program, "u_ambientColor");
    u_diffuseColor = gl.getUniformLocation(gl.program, "u_diffuseColor");
    u_specularColor = gl.getUniformLocation(gl.program, "u_specularColor");
    u_specularAlpha = gl.getUniformLocation(gl.program, "u_specularAlpha");
    u_lightPosition = gl.getUniformLocation(gl.program, "u_lightPosition");
    u_pointLight = gl.getUniformLocation(gl.program, "u_pointLight");
    u_directionalLight = gl.getUniformLocation(gl.program, "u_directionalLight");
    u_Gourade = gl.getUniformLocation(gl.program, "u_Gourade");
    u_pointToggle = gl.getUniformLocation(gl.program, "u_pointToggle");
    u_dirToggle = gl.getUniformLocation(gl.program, "u_dirToggle");
    u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");

    vertexBuffer = initBuffer("a_Position", 3);
    normalBuffer = initBuffer("a_Normal", 3);

    indexBuffer = gl.createBuffer();
    if(!indexBuffer) {
        console.log("Can't create buffer.")
        return -1;
    }
    // Set light data
    gl.uniform3f(u_ambientColor, 0.2, 0.2, 0.2);
    gl.uniform3f(u_diffuseColor, 0.8, 0.8, 0.8);
    gl.uniform3f(u_specularColor, 1.0, 1.0, 1.0);

    gl.uniform1f(u_specularAlpha, 32.0);
    gl.uniform1f(u_pointToggle, 1.0);
    gl.uniform3fv(u_eyePosition, eyePosition.elements);
    gl.uniform3fv(u_lightPosition, lightPosition.elements);
    gl.uniform3fv(u_directionalLight, directionalLight.elements);
    gl.uniform3fv(u_pointLight, pointLight.elements);

    camera = new Camera("perspective");
    //gl.uniform3f(u_lightDirection, 0.5, 3.0, -4.0);
    draw();

}
function cameraType(){
  if(document.getElementById("orthographic").checked == false){
      camera = new Camera("perspective");
  }else{
    camera = new Camera("orthographic");
  }
}
function toggleLight(){
  if(document.getElementById("point").checked == false){
    pointLight = new Vector3([0.0, 0.0, 0.0]);
    gl.uniform1f(u_pointToggle, 0.0);
  }else{
    pointLight = new Vector3([0.0, 1.0, 2.0]);
    gl.uniform1f(u_pointToggle, 1.0);
  }
  if(document.getElementById("directional").checked == false){
    directionalLight = new Vector3([0.0, 0.0, 0.0]);
    gl.uniform1f(u_dirToggle, 0.0);
  }else {
    directionalLight = new Vector3([1.0, 3.0, -3.0]);
    gl.uniform1f(u_dirToggle, 1.0);
  }
  gl.uniform3fv(u_directionalLight, directionalLight.elements);
  gl.uniform3fv(u_pointLight, pointLight.elements);
}
function malet(){
  document.getElementById("n").value = 20;
  let cyl1 = addModel([1.0, 0.0, 0.0], "cylinder");
  cyl1.setTranslate(-0.3, 0.0, 0.0);
  cyl1.setRotate(45,90,0);
  cyl1.setScale(0.15, 0.15, 0.75);
  document.getElementById("n").value = 30;
  let cyl2 = addModel([0.36, 0.21, 0.039], "cylinder");
  cyl2.setTranslate(0.05, 0.25,0.0);
  cyl2.setRotate(90, 0, 0);
  cyl2.setScale(0.05, 0.05, 1.0);
}
function colorpicker(value) {
    // Get the selected cylinder
    let selector = document.getElementById("modelSelect");
    let selectedModel = models[selector.value];
    let red = value.substring(1,3);
    let green = value.substring(3, 5);
    let blue = value.substring(5, 7);
    r = parseInt("0x" + red);
    g = parseInt("0x" + green);
    b = parseInt("0x" + blue);
    r= r/255.0;
    g = g/255.0;
    b = b/255.0;
    selectedModel.color[0] = r;
    selectedModel.color[1] = g;
    selectedModel.color[2] = b;
}
function ambient(value){
   gl.uniform3f(u_ambientColor, value/100.0, value/100.0, value/100.0);
}
function diffuse(value){
   gl.uniform3f(u_diffuseColor, value/100.0, value/100.0, value/100.0);
}
function specular(value){
   gl.uniform3f(u_specularColor, value/100.0, value/100.0, value/100.0);
}
function onTranX(value) {
    // Get the selected cylinder
    let selector = document.getElementById("modelSelect");
    let selectedModel = models[selector.value];

    selectedModel.setTranslate(value/100.0,
                                document.getElementById("translateY").value/100.0,
                                document.getElementById("translateZ").value/100.0);
}
function specAlpha(value){
  gl.uniform1f(u_specularAlpha, value);
}
function onTranY(value) {
    // Get the selected cylinder
    let selector = document.getElementById("modelSelect");
    let selectedModel = models[selector.value];

    selectedModel.setTranslate(document.getElementById("translateX").value/100.0,
                              value/100.0,
                              document.getElementById("translateZ").value/100.0);
}
function onTranZ(value) {
    // Get the selected cylinder
    let selector = document.getElementById("modelSelect");
    let selectedModel = models[selector.value];

    selectedModel.setTranslate( document.getElementById("translateX").value/100.0,
                                document.getElementById("translateY").value/100.0,
                                value/100.0);
}
function onRotX(value) {
    // Get the selected cylinder
    let selector = document.getElementById("modelSelect");
    let selectedModel = models[selector.value];

    selectedModel.setRotate(value, document.getElementById("rotateY").value,
                              document.getElementById("rotateZ").value);
}
function onRotY(value) {
    // Get the selected cylinder
    let selector = document.getElementById("modelSelect");
    let selectedModel = models[selector.value];

    selectedModel.setRotate(document.getElementById("rotateX").value,
                  value, document.getElementById("rotateZ").value);
}
function onRotZ(value) {
    // Get the selected cylinder
    let selector = document.getElementById("modelSelect");
    let selectedModel = models[selector.value];

    selectedModel.setRotate(document.getElementById("rotateX").value,
    document.getElementById("rotateY").value, value);
}
function onScaleX(value) {
    // Get the selected cylinder
    let selector = document.getElementById("modelSelect");
    let selectedModel = models[selector.value];

    selectedModel.setScale(value/100.0,
                                document.getElementById("scaleY").value/100.0,
                                document.getElementById("scaleZ").value/100.0);
}
function onScaleY(value) {
    // Get the selected cylinder
    let selector = document.getElementById("modelSelect");
    let selectedModel = models[selector.value];

    selectedModel.setScale(document.getElementById("scaleX").value/100.0,
                              value/100.0,
                              document.getElementById("scaleZ").value/100.0);
}
function onScaleZ(value) {
    // Get the selected cylinder
    let selector = document.getElementById("modelSelect");
    let selectedModel = models[selector.value];
    console.log(value/100.0);
    selectedModel.setScale( document.getElementById("scaleX").value/100.0,
                                document.getElementById("scaleY").value/100.0,
                                value/100.0);
}
