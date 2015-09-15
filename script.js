// Code goes here

function makePyramidMaterial() {
    var pyrColor = new THREE.Color(0xffff00);
    //var material = new THREE.MeshBasicMaterial( { color: pyrColor } );

    var material = new THREE.MeshLambertMaterial( {
         color: pyrColor,
         //side: THREE.DoubleSide
         } );

    return material;
}

function makePyramid(material) {      
    var geom = new THREE.Geometry();
    geom.vertices.push(new THREE.Vector3(0.5, 0, 0.5));   // 0
    geom.vertices.push(new THREE.Vector3(0.5, 0, -0.5));  // 1
    geom.vertices.push(new THREE.Vector3(-0.5, 0, -0.5)); // 2
    geom.vertices.push(new THREE.Vector3(-0.5, 0, 0.5));  // 3
    geom.vertices.push(new THREE.Vector3(0, 1, 0));       // 4

    // Vertex winding is counter-clockwise viewed from outside the solid
    geom.faces.push(new THREE.Face3(3, 0, 4));
    geom.faces.push(new THREE.Face3(0, 1, 4));
    geom.faces.push(new THREE.Face3(1, 2, 4));
    geom.faces.push(new THREE.Face3(2, 3, 4));
    geom.faces.push(new THREE.Face3(0, 3, 2));
    geom.faces.push(new THREE.Face3(2, 1, 0));

    // Auto-compute the normals
    geom.computeFaceNormals();   // Must happen first
    geom.computeVertexNormals();
      
    var pyramid = new THREE.Mesh(geom, material);
    //pyramid.rotation.y = Math.PI/8;
    return pyramid;
}

function makePyramidCone(material) {
    var geom = new THREE.CylinderGeometry(0, 0.5, 1, 4, 1);
    var pyramid = new THREE.Mesh(geom, material);
    return pyramid;
}

function makeLights() {
  var ptLight = new THREE.PointLight( 0xffffff, 3, 10000);
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
  var cone = new THREE.Mesh(geom, mat);
  
  var icTex = new THREE.ImageUtils.loadTexture('ice-cream-texture-256.jpg');
  var icecream = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 16),
            new THREE.MeshPhongMaterial( { color: 0xffffff, map: icTex }));
  icecream.translateY(1.25);
  cone.add(icecream);
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
  return ball;                            
}

function drawstuff() {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  
  // Make a cube
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var tex = new THREE.ImageUtils.loadTexture('waffle-texture-256.jpg');
  var material = new THREE.MeshLambertMaterial( { color: new THREE.Color(0x49176d).multiplyScalar(5),
                                                  map: tex } );
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  cube.translateX(-2);
  
  // Add an axis jack
  var helperjack = new THREE.AxisHelper();
  helperjack.translateX(2);
  helperjack.translateY(-1.5);
  helperjack.scale.x = 0.25;  // Locally applied; order is unimportant
  helperjack.scale.y = 1.25;
  scene.add(helperjack);
  
  // Add a jack with arrows
  arrowjack = makeArrowJack();
  // arrowjack.translateY(-1.5); // Local Y
  // arrowjack.translateX(-0.5); // Local X
  // arrowjack.rotateOnAxis(new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(-90));
  scene.add(arrowjack);
  
  // Add an ice-cream cone
  cone = makeIceCreamCone();
  cone.translateX(1);
  cone.translateZ(-3);
  scene.add(cone);
  
  // Add background planes
  var skyPlane = makeSkyPlane();
  scene.add(skyPlane);
  var groundPlane = makeGroundPlane()
  scene.add(groundPlane);
  
  var pyrMaterial = makePyramidMaterial();
  var pyramid = makePyramid(pyrMaterial);
  pyramid.translateX(2);
  pyramid.translateY(-1);
  pyramid.translateZ(-1);
  scene.add(pyramid);
  
  // Add some lights
  var ptLight = makeLights();
  scene.add(ptLight);
  
  camera.position.y = 1;
  camera.position.z = 5;  // Sets the eyepoint to (0, 0, 5)
  // View direction (view vector) defaults to negative Z (i.e., (0, 0, -1))
  // Up vector (which way is up for the camera?) defaults to positive Y (i.e., (0, 1, 0))
  

  var theta = 0;
  var dTheta = 0.03;
  var lum = ptLight.intensity;
  function render() {
	  requestAnimationFrame( render );
	  
	  //cube.rotation.x += 0.1;
	  cube.rotation.y += dTheta;  // changes the modeling trasformation
	  
	  theta += dTheta;
	  ptLight.intensity = lum * (0.25 * Math.sin(theta)) + 0.75;

    skyPlane.material.color = new THREE.Color(0x102040).lerp(new THREE.Color(0x4080ff), ptLight.intensity);
    groundPlane.material.color = new THREE.Color(0x001000).lerp(new THREE.Color(0x005000), ptLight.intensity);
	  renderer.render( scene, camera );
  }
  render();
  
}
