class Camera {
    constructor(cameraType) {
        this.near = 0.1;
        this.far = 1000;
        this.fov = 60;

        this.eye = new Vector3([0, 0, 5]);
        this.center = new Vector3([0, 0, 0]);
        this.up = new Vector3([0, 1, 0]);

        this.projMatrix = new Matrix4();
        if(cameraType == "perspective") {
            this.projMatrix.setPerspective(this.fov, canvas.width/canvas.height, this.near, this.far);
        }
        // this.projMatrix.setPerspective(60, canvas.width/canvas.height, 0.1, 1000);
        else if(cameraType == "orthographic") {
            this.projMatrix.setOrtho(-1, 1, -1, 1, this.near, this.far)
        }
        this.viewMatrix = new Matrix4();
        this.updateView();
    }
//the worker sinks to the level of a commodity, and moreover the most wretched
//commodity of all; that the misery of the worker is in inverse proportion to the power
//and volume of his production
    moveForward(scale) {
        // Compute forward vector
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();
        forward.mul(scale);

        // Add forward vector to eye and center
        this.eye.add(forward);
        this.center.add(forward);

        this.updateView();
    }
    zoom(scale) {
        this.projMatrix.setPerspective(this.fov * scale, canvas.width/canvas.height, this.near, this.far);
    }
    moveSideways(scale) {
        // Compute the left or right vector with
        // respect to the eye and center (hint: use cross product)
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        forward.normalize();

        let u = Vector3.cross(forward, this.up);
        u.normalize();
        u.mul(scale);

        this.eye.add(u);
        this.center.add(u);

        this.updateView();

        // Add left or right vector vector to eye and center
    }

    pan(angle) {
        // Rotate center point around the up vector
        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(angle, this.up.elements[0],
                                   this.up.elements[1],
                                   this.up.elements[2]);

       // Compute forward vector
       let forward = new Vector3(this.center.elements);
       forward.sub(this.eye);

       // Rotate forward vector around up vector
       let forward_prime = rotMatrix.multiplyVector3(forward);
       this.center.set(forward_prime);

       this.updateView();
    }

    tilt(angle) {
        // Hint: changes the up vector
        let forward = new Vector3(this.center.elements);
        forward.sub(this.eye);
        //forward.normalize();

        let right = Vector3.cross(forward, this.up);
        right.normalize();


        let rotMatrix = new Matrix4();
        rotMatrix.setRotate(angle, right.elements[0],
                                   right.elements[1],
                                   right.elements[2]);
        // Rotate forward vector around up vector
        let forward_prime = rotMatrix.multiplyVector3(forward);
        this.center.set(forward_prime);

        //this.up = Vector3.cross(right, forward_prime);
        this.up = rotMatrix.multiplyVector3(this.up);
        //this.up.normalize();

        this.updateView();
    }
    twirl(radius, t){

      this.eye.elements[0] = radius * Math.cos(2* (Math.PI) * t);
      this.eye.elements[1] = radius * Math.sin(2* (Math.PI) * t);
      this.eye.elements[2] = t;
      let forward = new Vector3(this.eye.elements);
      this.center.elements[0] = 0;
      this.center.elements[1] = 0;
      this.center.elements[2] = 0;
      this.up.elements[0] = 0;
      this.up.elements[1] = 0;
      this.up.elements[2] = 1;
      this.updateView();

    }
    updateView() {
        //center is where camera is looking at
        //eye is the position of the camera
        //up is the up vector
        this.viewMatrix.setLookAt(
            this.eye.elements[0],
            this.eye.elements[1],
            this.eye.elements[2],
            this.center.elements[0],
            this.center.elements[1],
            this.center.elements[2],
            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );
    }
}
