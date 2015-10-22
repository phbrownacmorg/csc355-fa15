// Rotate THREE.Vector3 'vec' by the inverse of the rotation of 
// THREE.Object3D 'obj'.  Returns the rotated vector.
// 'obj' and 'vec' are not changed.
function undoObjRot(vec, obj) {
    // Find the inverse of the object's rotation
    var q = obj.quaternion.clone().inverse();
    var result = vec.clone().applyQuaternion(q);
    return result;
}

// Find and return the perspective depth scaling factor for 
// THREE.Object3D 'obj', from the point of view of THREE.Camera 'camera'.
// 'obj' and 'camera' are not changed.
function depthScalingFactor(obj, camera) {
    // pickedItem.parent === scene, so 
    //   pickedItem.matrix === pickedItem.matrixWorld
    var objLoc = new THREE.Vector3();
    objLoc.setFromMatrixPosition(obj.matrixWorld);
    //console.log(JSON.stringify(obj.matrix));
    //console.log(JSON.stringify(obj.matrixWorld));
    //console.log(JSON.stringify(objLoc));
    var eyeLoc = new THREE.Vector3();
    eyeLoc.setFromMatrixPosition(camera.matrixWorld);
    
    var diff = new THREE.Vector3();
    diff.subVectors(eyeLoc, objLoc);
    // var dir = camera.getWorldDirection();
    // console.log(JSON.stringify(dir));
    diff.projectOnVector(camera.getWorldDirection());
    //console.log(JSON.stringify(diff));

    return diff.length();
}    

function addTurningAttribs(obj) {
    obj.dTheta = new THREE.Vector3();
}

function thisAndDescendants(obj) {
    var result = new Array(obj);
    //console.log('Starting with ' + result.length);
    for (var i = 0; i < obj.children.length; i++) {
        //console.log('Child ' + i);
        result = result.concat(thisAndDescendants(obj.children[i]));
    }
    //console.log('Returning ' + result.length);
    return result;
}

function makePyramidMaterial() {
    var pyrColor = new THREE.Color(0xffff00);
    //var material = new THREE.MeshBasicMaterial( { color: pyrColor } );
    var tex = new THREE.ImageUtils.loadTexture('cosine-texture.png');

    var material = new THREE.MeshPhongMaterial( {
         color: pyrColor,
         map: tex //,
         //side: THREE.DoubleSide
         } );

    return material;
}

// Make a pyramid like a cone, just by restricting the number of faces
// around the circumference
function makeCylinderPyramid(material) {
    var geom = new THREE.CylinderGeometry(0, 1, 1, 4);
    var pyramid = new THREE.Mesh(geom, material);
    addTurningAttribs(pyramid);
    return pyramid;
}

function makePolygonPyramid() {
    var material = new THREE.MeshLambertMaterial( {
        color: 0xffff00 //,
        //side: THREE.DoubleSide
    } );
    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3(0.5, 0, 0.5));   // 0
    geom.vertices.push(new THREE.Vector3(0.5, 0, -0.5));  // 1
    geom.vertices.push(new THREE.Vector3(-0.5, 0, -0.5)); // 2
    geom.vertices.push(new THREE.Vector3(-0.5, 0, 0.5));  // 3
    geom.vertices.push(new THREE.Vector3(0, 0.5, 0));     // 4

    // Vertices are listed in counter-clockwise order when seen from
    //   outside the solid (in "front" of the face)
    geom.faces.push(new THREE.Face3(3, 0, 4));
    geom.faces.push(new THREE.Face3(0, 1, 4));
    geom.faces.push(new THREE.Face3(1, 2, 4));
    geom.faces.push(new THREE.Face3(2, 3, 4));
    geom.faces.push(new THREE.Face3(0, 3, 2)); // Bottom made from
    geom.faces.push(new THREE.Face3(2, 1, 0)); // two triangles

    // Auto-compute the normals
    geom.computeFaceNormals();   // Must happen first
    geom.computeVertexNormals();
      
    var pyramid = new THREE.Mesh(geom, material);
    //pyramid.rotation.y = Math.PI/8;
    addTurningAttribs(pyramid);

    return pyramid;
}

function makeLights() {
  var ptLight = new THREE.PointLight( 0xffffff, 2, 10000);
  ptLight.position.set(3, 3, 0.8);
  ptLight.add(new THREE.HemisphereLight(0x4080ff, 0x005000, 0.2));
  ptLight.add(new THREE.AmbientLight(0x202020));
  
  var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32),
                            new THREE.MeshPhongMaterial({
                              color: 0xffffff,
                              specular: 0xffffff,
                              side: THREE.BackSide,
                              }));
  ptLight.add(bulb);
  //ptLight.add(new THREE.PointLightHelper(ptLight, 0.05));
  
  return ptLight;
}

function makeSkyPlane() {
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000),
          new THREE.MeshBasicMaterial( {color: 0x4080ff} ));
  plane.translateZ(-990);
  return plane;
}

function makeGroundPlane() {
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000),
          new THREE.MeshBasicMaterial( {color: 0x005000} ));
  plane.translateY(-5);        
  plane.rotateOnAxis(new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(-90));
  //plane.translateZ(-990);
  return plane;
}

function makeIceCreamCone() {
  var geom = new THREE.CylinderGeometry(1, 0, 2, 120, 1, true);
  var coneTex = new THREE.ImageUtils.loadTexture('waffle-texture-256.jpg');
  var mat = new THREE.MeshLambertMaterial( { color: new THREE.Color(0x5d4934).multiplyScalar(5),
                                             map: coneTex } );
  //mat.transparent = true;
  //mat.opacity = 0.0;
  var cone = new THREE.Mesh(geom, mat);
  
  var icTex = new THREE.ImageUtils.loadTexture('Haveaniceday-512.jpg');
  icTex.wrapS = THREE.RepeatWrapping;
  //icTex.wrapT = THREE.RepeatWrapping;
  icTex.repeat.set(3, 1.5);
  icTex.offset.set(-0.1, -0.25);
  var icecream = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16),
            new THREE.MeshPhongMaterial( { color: 0xffffff, map: icTex }));
  icecream.translateY(1.25);
  cone.add(icecream);
  addTurningAttribs(cone);
  return cone;
}

function makeArrowJack() {
  var ball = new THREE.Mesh(new THREE.SphereGeometry(0.03),
          new THREE.MeshBasicMaterial( { color: 0x808080 }));
                            
  var origin = new THREE.Vector3(0, 0, 0);
  ball.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0),
                                 origin, 1, 0xff0000));
  ball.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0),
                                 origin, 1, 0x00ff00));
  ball.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1),
                                 origin, 1, 0x0000ff));
  addTurningAttribs(ball);
  return ball;                            
}

function makeCube() {
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var tex = new THREE.ImageUtils.loadTexture('waffle-texture-256.jpg');
    var material = new THREE.MeshLambertMaterial( { color: new THREE.Color(0x49176d).multiplyScalar(5),
                                                  map: tex } );
    var cube = new THREE.Mesh( geometry, material );
    addTurningAttribs(cube);
    return cube;
}

function makePikachuEar(rightEar) {
    var tip = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.08, .6),
                             new THREE.MeshLambertMaterial({ color: 0x000000 }));
    tip.translateY(0.451);
                             
    var ear = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.2, 1.5),
                             new THREE.MeshLambertMaterial({ color: 0xffff00 }));
    ear.add(tip);
    ear.translateY(1);
    var dx = 0.1 + 0.75;
    if (rightEar) { dx = -dx; }
    ear.translateX(dx);
    var rz = Math.PI/4;
    if (!rightEar) { rz = -rz; }
    ear.rotateZ(rz);
    return ear;
}

function makePikachu() {
    
    var face = new THREE.ImageUtils.loadTexture('pikachu-face.jpg');
    face.repeat.set(2, 1);
    //face.offset.set(0.15, 0);
    var head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32),
                              new THREE.MeshLambertMaterial(
                                { color: 0xffff00,
                                  map: face }));
    head.add(makePikachuEar(true)); // right ear
    head.add(makePikachuEar(false)); // left ear
    head.translateY(1.3);
    
    var torso = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32),
                               new THREE.MeshLambertMaterial({ color: 0xffff00 })
                               );
    addTurningAttribs(torso);
    torso.add(head);

    torso.initialY = 1;
    torso.translateY(torso.initialY);
    torso.animating = false;
    return torso;
}
