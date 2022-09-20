# viewport-webGL 
<body onload="main()">
    <br>
    <br>
    <h2> WebGL Project 5/23/21 </h2>
    <h3> Instructions </h3>
    1.) Read this page<br>
    2.) Clone the Repo<br>
    3.) Click on driver.html<br>
    <p>
    <h3>Purpose:</h3> This project can render customizable cylinders,
    cubes, and spheres in real time. The user's abilities range from assigning object's <br>
    RGB color, changing between rendering modes, toggling lights in the scene, being <br>
    able to manipulate the objects with translating, rotating, and scaling<br>
    in the xyz axes, moving the camera, and choosing what kind of projection.
    <br><br>
    Note: X axis is horizontal, Y axis is vertical, Z axis is forwards/away<br><br>
    <h2>Screenshot</h2>
    <img src="Proj4.PNG" alt="Scene" width="1000" height="800"><br>
    <h3> User Guide:</h3>
    -Sphere Add button: puts a sphere into the Scene<br>
    -Cube Add button: puts a cube into the Scene<br>
    -N text box: to specify the amount of sides you want your cylinder to be<br>
    -Press the Add button to create a cylinder with N: #sides<br>
    -Render Type Selctor Box: choose between three commonly used rendering modes, Wireframe,<br>
    Flat shading, and Smooth Gourade shading.<br>
    -Orthographic Checkbox- if checked the camera will be using orthographic projection <br>
    if not checked it will be using perspective projection.
    -Draw Malet button: Used to put a pre-made Malet into the scene<br>
    -Drop Down menu: Used to select which cylinder you want to customize<br>
    -Delete button: press to delete the object selected in the drop down menu<br>
    -Color Picker: can assign any color to the cylinder currently selected<br>
    -Point light Checkbox: One can toggle on and off a Point light at position (1.0, 1.0, -1.0)<br>
    -Directional Light checkbox: One can toggle on and off a Directional light <br>
    with Vector [1.0, 3.0, -3.0]<br>
    -Ambient Slider: general lighting<br>
    -Diffuse Slider: scattered lighting<br>
    -Specular Slider: surface reflectance<br>
    -Shininess Slider: affects the shininess of surface<br>
    -Translate, Rotate, Scale sliders: can T.R.S the selected cylinder on any axis<br>
    -Zoom Out slider: One can zoom out of the scene<br>
    Keys:<br>
    W/S- Move camera forwards/backwards<br>
    A/D- Move camera left/right<br>
    Q/E- Pan camera left/right<br>
    Z/X- tilt Camera up/down<br>
    T- Camera spiraling Animation around the origin
</body>

