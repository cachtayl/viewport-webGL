class Cylinder extends Model{

    constructor(color) {
      super(color);
      let n = document.getElementById("n").value;
      n = parseInt(n);
      console.log(n);

      this.vertices = new Float32Array(36*n);
      this.indices = new Uint16Array(12*n);
      this.normals = new Float32Array(36*n);
      this.smooth_normals = new Float32Array(36*n);

      this.createOrderOfIndices(n);
      // console.log("INDICES");
      // for(let i = 0; i < this.indices.length; i+=3){
      //     console.log(this.indices[i], this.indices[i+1], this.indices[i+2]);
      // }

      this.createVertAndNormals(n);

      this.createSmoothNormals(n);


      // // console.log("VERTICES");
      // // for(i = 0; i < this.vertices.length; i+=3){
      // //     console.log("X: ", this.vertices[i], "Y: ", this.vertices[i+1], "Z: ",
      // //      this.vertices[i+2], "\n");
      // // }
      // console.log("NORMALS");
      // for(i = 0; i < this.normals.length; i+=3){
      //     console.log("X: ", this.normals[i], "Y: ", this.normals[i+1], "Z: ",
      //      this.normals[i+2], "\n");
      // }
    }
    createVertAndNormals(n){
      let new_vertices = new Float32Array(2* (n*3)+6);
      const two_pi = 2*Math.PI;
      let angle = two_pi/n;

      console.log("Angle", angle);
      let q = angle;
      let midway = parseInt(new_vertices.length/2);
      //Setting up coordinates array with Caps
      new_vertices[0] = 0;
      new_vertices[1] = 0;
      new_vertices[2] = 0;

      new_vertices[3] = 1;
      new_vertices[4] = 0;
      new_vertices[5] = 0;

      new_vertices[midway] = 0;
      new_vertices[midway+1] = 0;
      new_vertices[midway+2] = 1;

      new_vertices[midway+3] = 1;
      new_vertices[midway+4] = 0;
      new_vertices[midway+5] = 1;

      //vertices
      for(let i = 6; i < midway;){
        new_vertices[i] = Math.cos(q);
        new_vertices[i+1] = Math.sin(q);
        new_vertices[i+2] = 0;
        new_vertices[i + midway] = new_vertices[i];
        new_vertices[i + 1 + midway] = new_vertices[i+1];
        new_vertices[i+2 + midway] = 1;
        q += angle;
        i += 3;
      }
      // for(let i = 0; i < new_vertices.length; i+=3){
      //     console.log("Index: ", i/3, "--- X: ", new_vertices[i], "Y: ", new_vertices[i+1], "Z: ",
      //      new_vertices[i+2], "\n");
      // }
      let w = 0;
      let u = 0;
      let norm;
      //switched vertices and new_vertices
      for(let i = 0; i < this.indices.length; i+=3){
        let a = this.indices[i];
        let b = this.indices[i + 1];
        let c = this.indices[i + 2];

        //console.log("index: ", a, " index*3: ", a*3);
        this.vertices[w] = new_vertices[a*3];
        this.vertices[w + 1] = new_vertices[a*3 + 1];
        this.vertices[w + 2] = new_vertices[a*3 + 2];
        let a_x = this.vertices[w];
        let a_y = this.vertices[w + 1];
        let a_z = this.vertices[w + 2];

        // console.log("new vert: ",   this.vertices[w]);
        // console.log("new vert: ",   this.vertices[w + 1]);
        // console.log("new vert: ", this.vertices[w + 2]);
        w = w + 3;

        this.vertices[w] = new_vertices[b*3];
        this.vertices[w + 1] = new_vertices[b*3 + 1];
        this.vertices[w + 2] = new_vertices[b*3 + 2];
        // console.log("new vert: ",   this.vertices[w]);
        // console.log("new vert: ",   this.vertices[w + 1]);
        // console.log("new vert: ", this.vertices[w + 2]);
        let ab = new Vector3( [this.vertices[w] - a_x,
                              this.vertices[w + 1] - a_y,
                              this.vertices[w + 2] - a_z]);
        w = w + 3;

        this.vertices[w] = new_vertices[c*3];
        this.vertices[w + 1] = new_vertices[c*3 + 1];
        this.vertices[w + 2] = new_vertices[c*3 + 2];
        // console.log("new vert: ",   this.vertices[w]);
        // console.log("new vert: ",   this.vertices[w + 1]);
        // console.log("new vert: ", this.vertices[w + 2]);
        let ac = new Vector3( [this.vertices[w] - a_x,
                              this.vertices[w + 1] - a_y,
                              this.vertices[w + 2] - a_z]);
        w = w + 3;
        //create and put normals in
        norm = Vector3.cross(ab, ac);
        norm.normalize();
        for(let j = u; j < u + 9; j+=3){
          this.normals[j] = norm.elements[0];
          this.normals[j + 1] = norm.elements[1];
          this.normals[j + 2] = norm.elements[2];
        }
        u = u + 9;
      }
    }
    createOrderOfIndices(n){
      let a = 0;
      let b = 1;
      let c = 2;
      this.indices[0] = a;
      this.indices[1] = c;
      this.indices[2] = b;
      for(var j = 3; j < this.indices.length/2; j += 3){
        b = c;
        if(c == n){
          c = 1;
        }else{
          c += 1;
        }
        this.indices[j] = a;
        this.indices[j+1] = c;
        this.indices[j+2] = b;
      }
      a = +n + 1;
      b = +n + 2;
      c = +n + 3;
      this.indices[+n*3] = a;
      this.indices[+n*3 + 1] = b;
      this.indices[+n*3 + 2] = c;
      for(var i = +n*3 + 3; i < (+n*6); i+=3){
        b = c;

        if(b == (n*2 + 1)){
          c = +n + 2;

        }else{
          c += 1;
        }
        this.indices[i] = a;
        this.indices[i+1] = b;
        this.indices[i+2] = c;
      }
      let curr = this.indices.length/2;
      for(var k = 1; k < (+n + 1); k++){
        let tL = k;
        let tR = k+1;
        let bL = +tL + (+n + 1);
        let bR = +tR + (+n + 1);

        if(tL == n){
           bR = 2 + +n;
           tR = 1;
        }
        //sides are now divided into two triangles with hypotenuses from TR to BL
        this.indices[curr] = tR
        this.indices[curr + 1] = bR;
        this.indices[curr + 2] = bL;
        curr +=3;
        //tri2 tR, tl, bl
        this.indices[curr] = tR;
        this.indices[curr + 1] = bL;
        this.indices[curr + 2] = tL;
        curr +=3;
      }
    }

    createSmoothNormals(n){
        //from 0 to number of vertices
        for(let i = 0; i < 2*n + 2; i++){
          //temp will be the combination of all the normal vector's at this vertex
          let temp = new Vector3([0, 0, 0]);
          //running through all indices
          for(let j = 0; j < this.indices.length; j++){
            if(this.indices[j] == i){
                let x = this.normals[j*3];
                let y = this.normals[j * 3 + 1];
                let z = this.normals[j * 3 + 2];
                let adding = new Vector3([x,y,z]);
                temp.add(adding);

            }
          }
          // console.log("TEMP");
          // console.log("TEMP", temp.elements[0], temp.elements[1], temp.elements[2]);
          temp.normalize();
          for(let k = 0; k < this.indices.length; k++){
            if(this.indices[k] == i){
              this.smooth_normals[k*3] = temp.elements[0];
              this.smooth_normals[k*3 + 1] = temp.elements[1];
              this.smooth_normals[k*3 + 2] = temp.elements[2];
            }
          }

        }
        // console.log("NORMALS");
        // for(let i = 0; i < this.smooth_normals.length; i+=3){
        //     console.log("X: ", this.smooth_normals[i], "Y: ", this.smooth_normals[i+1], "Z: ",
        //      this.smooth_normals[i+2], "\n");
        // }
        for(let i = 0; i < this.indices.length;i++){
          this.indices[i] = i;
        }

    }

}
