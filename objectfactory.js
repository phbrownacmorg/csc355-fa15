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
    var eyeLoc = new THREE.Vector3();
    eyeLoc.setFromMatrixPosition(camera.matrixWorld);
    
    var diff = new THREE.Vector3();
    diff.subVectors(eyeLoc, objLoc);
    diff.projectOnVector(camera.getWorldDirection());

    return diff.length();
}    

function addTurningAttribs(obj) {
    obj.dTheta = new THREE.Vector3();
}

function makePyramidMaterial() {
    var pyrColor = new THREE.Color(0xffff00);
    var tex = new THREE.ImageUtils.loadTexture('cosine-texture.png');

    var material = new THREE.MeshPhongMaterial( {
         color: pyrColor,
         map: tex
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
        color: 0xffff00
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
  ptLight.position.set(6, 5, 5);
  ptLight.add(new THREE.HemisphereLight(0x4080ff, 0x005000, 0.2));
  ptLight.add(new THREE.AmbientLight(0x202020));
  
  var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 32),
                            new THREE.MeshPhongMaterial({
                              color: 0xffffff,
                              specular: 0xffffff,
                              side: THREE.BackSide,
                              }));
  ptLight.add(bulb);
  
  return ptLight;
}

function makeSkyPlane() {
  var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(10000, 10000),
          new THREE.MeshBasicMaterial( {color: 0x4080ff} ));
  plane.translateZ(-990);
  return plane;
}

function makeGroundPlane() {
  var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(10000, 10000),
          new THREE.MeshBasicMaterial( {color: 0x005000} ));
  plane.translateY(-5);        
  plane.rotateOnAxis(new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(-90));
  return plane;
}

function makeIceCreamCone() {
  var geom = new THREE.CylinderGeometry(1, 0, 2, 120, 1, true);
  var coneTex = new THREE.ImageUtils.loadTexture('waffle-texture-256.jpg');
  var mat = new THREE.MeshLambertMaterial( { color: new THREE.Color(0x5d4934).multiplyScalar(5),
                                             map: coneTex } );
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

function getCheekSpots(pikachu) {
    var result = new Object();
    var head = pikachu.children[0];
    console.log('head: ' + JSON.stringify(head));
    var rotAxis = new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(0, 0, THREE.Math.degToRad(20))).normalize();
    var right = new THREE.Vector3(0, 0, 0.7).applyAxisAngle(rotAxis, THREE.Math.degToRad(-50));
    //console.log('right: ' + JSON.stringify(right));
    rotAxis = new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler(0, 0, THREE.Math.degToRad(-20))).normalize();
    var left = new THREE.Vector3(0, 0, 0.7).applyAxisAngle(rotAxis, THREE.Math.degToRad(50));
    pikachu.updateMatrixWorld(true);
    //console.log('center: ' + JSON.stringify(head.localToWorld(new THREE.Vector3())));
    result.right = head.localToWorld(right);
    result.left = head.localToWorld(left);
    console.log('result.right: ' + JSON.stringify(result.right));
    return result;
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

    torso.zap = function(target) {
	target.updateMatrixWorld(true);
	var targetPt = target.localToWorld(target.geometry.center());
	torso.lookAt(targetPt);
	return makeLightningFork(torso, targetPt);
    }

    return torso;
}

function makeMarioTexture() {
    var tex = THREE.ImageUtils.loadTexture('mario-sprite-sheet.png');
    tex.minFilter = THREE.NearestFilter;
    tex.numFrames = 4;
    tex.frame = tex.numFrames;
    tex.frameX = [-0.003, 0.071, 0.138, 0.204, 0.327];
    tex.repeat.set(1/15, 0.19);
    tex.offset.set(tex.frameX[tex.frame], 0.81);
    return tex;
}

function makeBillboard() {
    var tex = makeMarioTexture();
    var board = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 2),
                               new THREE.MeshLambertMaterial({ 
                                   color: 0xffffff,
                                   map: tex }));
    board.tex = board.tex;
    addTurningAttribs(board);
    return board;
}

function makeBillboardSprite() {
    var tex = makeMarioTexture();
    var board = new THREE.Sprite(new THREE.SpriteMaterial( { map: tex} ));
    board.scale.setY(2);
    board.tex = tex;
    addTurningAttribs(board);
    return board;
}

function makeIgnatzMaterial(tex) {
    var result = new THREE.MeshPhongMaterial( {
                        color: 0xffcc00,
                        transparent: true,
                        opacity: 1 } );
    if (tex !== undefined) {
        result.map = tex;
    }
    return result;
}

function makeIgnatzFoot(r, isLeft) {
    var sideFactor = 1; // right foot
    if (isLeft) {
        sideFactor = -1;
    }
    
    var foot = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32,
                                                    0, Math.PI * 2,
                                                    0, Math.PI / 2), 
                              makeIgnatzMaterial());
    foot.translateX(sideFactor * 0.5 * r);
    foot.translateY(-1.1 * r);
    foot.rotation.y = sideFactor * 0.3;
    foot.scale.set(0.4, 0.4, 1);
    foot.renderOrder = 10;

    return foot;
}

function makeTextureOffsets() {
    var rowLength = 7;
    var result = new Array();
    var xOff = 0;
    var yOff = 0;
    for (var row = 1; row < 5; row++) {
        for (var col = 0; col < rowLength; col++) {
            xOff = col / rowLength;
            yOff = 1 - (row / rowLength);
            result.push(new THREE.Vector2(xOff, yOff));
        }
    }
    // Last row
    yOff = 1 - 5 / rowLength;
    for (var col = 0; col < rowLength-1; col++) {
        xOff = (0.5 + col) / rowLength;
        result.push(new THREE.Vector2(xOff, yOff));
    }
    return result;
}

function makeIgnatzCTPlane(r, i, offsets) {
    var tex = THREE.ImageUtils.loadTexture( "CT-slices-1.png" );
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    var freq = 1.0 / 7;
    tex.repeat.set(freq, freq);
    tex.offset.copy(offsets[i]);
    var material = new THREE.MeshBasicMaterial( { transparent: true,
                       side: THREE.DoubleSide, alphaMap: tex, map: tex
                                                } );
    var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(2 * r, 2 * r),
                               material);
    return plane;
}

function makeIgnatzPlaneArray(head, r) {
    var numPlanes = 34; // Dependent on texture used
    var texOffsets = makeTextureOffsets();
    var result = new Array();
    for (var i = 0; i < numPlanes; i++) {
        var newPlane = makeIgnatzCTPlane(r, i, texOffsets);
        newPlane.translateY((r) * (i/numPlanes));
        newPlane.rotateX(Math.PI/2);
        head.add(newPlane);
        result.push(newPlane);
    }
    return result.reverse();
}

function makeIgnatz() {
    var r = 1;
    var tex = THREE.ImageUtils.loadTexture( "Day-template-edit.svg" );
    tex.repeat.set(3, 1.5);
    tex.offset.set(-0.25, -0.2);
    var material = makeIgnatzMaterial(tex);
    var head = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32),
                               material);
    head.mtrl = material;
    
    head.rightFoot = makeIgnatzFoot(r, true);
    head.add(head.rightFoot);
    head.leftFoot = makeIgnatzFoot(r, false);
    head.add(head.leftFoot);

    head.planes = makeIgnatzPlaneArray(head, r);
    head.currentSlice = -1;
    head.renderOrder = 0;
    head.translateY(1.1*r);
    addTurningAttribs(head);
    return head;
}

function makePlane(width, height, col) {
    var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height),
                               new THREE.MeshLambertMaterial( {
                                   color: new THREE.Color(col),
                                   transparent: true,
                                   opacity: 0.5 }));
    addTurningAttribs(plane);
    return plane;
}

function makeLightning(start, end) {
    var numJags = 30;
    var curve = new THREE.SplineCurve3([start, end]);
    var points = curve.getPoints(numJags);
    //console.log(points);
    var length = start.distanceTo(end);
    var jagScale = length / (numJags * Math.sqrt(3));
    for (var i = 1; i < (points.length - 1); i++) {
	var offset = new THREE.Vector3(Math.random(), Math.random(),
				       Math.random());
	offset.multiplyScalar(jagScale);
	points[i].add(offset);
	//console.log(i + ": " + offset + " " + points[i]);
    }
    curve = new THREE.SplineCurve3(points);
    //console.log(curve);
    var geom = new THREE.TubeGeometry(curve, 64, 0.1);
    //console.log(geom);
    var bolt = new THREE.Mesh(geom,
			      new THREE.MeshBasicMaterial( {
				  side: THREE.DoubleSide
			      }));
    // bolt = new THREE.Mesh(new THREE.SphereGeometry(0.1),
    // 			  new THREE.MeshBasicMaterial());
    // bolt.translateX(start.x);
    // bolt.translateY(start.y);
    // bolt.translateZ(start.z);
    //console.log(bolt);
    return bolt;
}

function makeLightningFork(pikachu, targetPt) {
    var spots = getCheekSpots(pikachu);
    var leftBolt = makeLightning(spots.left, targetPt);
    var rightBolt = makeLightning(spots.right, targetPt);
    var result = new THREE.Object3D();
    result.add(leftBolt);
    result.add(rightBolt);
    return result;
}
