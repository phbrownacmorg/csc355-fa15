// Code goes here

function toggleHelp() {
    $('.helptext').toggleClass('hidden');
    var button = document.getElementById('helpbutton');
    if (button.value === 'Help') {
        button.value = 'Hide help';
    }
    else {
        button.value = 'Help';
    }
    //$('#helpbutton')
}

function showPicked(obj) {
    obj.material.colorSpec = obj.material.color.getStyle();
    obj.material.color.set( 0xff0000 );
    // for (var i = 0; i < obj.children.length; i++) {
    //     showPicked(obj.children[i]);
    // }
}

function clearPicked(obj) {
    obj.material.color.setStyle(obj.material.colorSpec);
    // for (var i = 0; i < obj.children.length; i++) {
    //     clearPicked(obj.children[i]);
    // }
}

function screenToNDC(event, elt) {
    var mouse = new THREE.Vector2();
    // Click coordinates in normalized device coordinates (NDC)
    mouse.x = (event.clientX / elt.clientWidth) * 2 - 1;
    mouse.y = (event.clientY / elt.clientHeight) * -2 + 1;
    // console.log('screenToNDC((' + event.clientX + ',' + event.clientY
    // 		+ '), (' + elt.clientWidth + ',' + elt.clientHeight 
    // 		+ ') = (' + mouse.x + ',' + mouse.y + ')');
    return mouse;
}

function drawstuff() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    var objects = new Array();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var elt = renderer.domElement;
    // alert(elt.clientWidth + " x " + elt.clientHeight + " : "
    // 	  + elt.scrollWidth + " x " + elt.scrollHeight + " : "
    // 	  + elt.offsetWidth + " x " + elt.offsetHeight);
  
    var theta = 0;
    var dTheta = 0.03;
    
    // Make a cube
    var cube = makeCube();
    objects = thisAndDescendants(cube);
    scene.add( cube );
    cube.translateX(-2);
    cube.translateZ(-5);
  
  // Add an axis jack
    var helperjack = new THREE.AxisHelper();
    addTurningAttribs(helperjack);
    objects = objects.concat(thisAndDescendants(helperjack));
    helperjack.translateX(2);
    helperjack.translateY(-1.5);
    helperjack.scale.x = 0.25;  // Locally applied; order is unimportant
    helperjack.scale.y = 1.25;
    scene.add(helperjack);
    
    // Add a jack with arrows
    arrowjack = makeArrowJack();
    //objects = objects.concat(thisAndDescendants(arrowjack));
    //arrowjack.translateY(-1.5); // Local Y
    //arrowjack.translateX(-0.5); // Local X
    //arrowjack.rotateOnAxis(new THREE.Vector3(1, 0, 0), THREE.Math.degToRad(-90));
    scene.add(arrowjack);
  
    // Add an ice-cream cone
    cone = makeIceCreamCone();
    cone.traverse(function(obj) {
	objects.push(obj);
    });
    //objects = objects.concat(thisAndDescendants(cone));
    cone.translateX(3);
    cone.translateZ(-3);
    cone.add(new THREE.AxisHelper());
    scene.add(cone);
    
    // Add background planes
    var skyPlane = makeSkyPlane();
    scene.add(skyPlane);
    var groundPlane = makeGroundPlane()
    scene.add(groundPlane);
    
    var pyrMaterial = makePyramidMaterial();
    var cylPyramid = makeCylinderPyramid(pyrMaterial);
    objects = objects.concat(thisAndDescendants(cylPyramid));
    //cylPyramid.translateZ();
    cylPyramid.translateY(3);
    scene.add(cylPyramid);
    
    var pyramid = makePolygonPyramid();
    objects = objects.concat(thisAndDescendants(pyramid));
    pyramid.translateY(0.5);
    cube.add( pyramid );
    
    // Add some lights
    var ptLight = makeLights();
    scene.add(ptLight);
    
    camera.position.y = 1;
    camera.position.z = 5;  // Sets the eyepoint to (0, 0, 5)
    // View direction (view vector) defaults to negative Z (i.e., (0, 0, -1))
    // Up vector (which way is up for the camera?) defaults to positive Y (i.e., (0, 1, 0))
  
    ptLight.oscillating = true;
  
    var raycaster = new THREE.Raycaster();
    var pickedItem = undefined;
    var mouse = new THREE.Vector2();
    var handleClick = function(event) {
        mouse = screenToNDC(event, elt);
        if (pickedItem !== undefined) {
            pickedItem.traverse(clearPicked);
        }
        pickedItem = undefined;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(objects);
        //alert('Intersecting ' + intersects.length + ' objects');
        
        // Take advantage of the fact that the intersections are sorted closest-first
        if (intersects.length > 0) {
            pickedItem = intersects[0].object;
            while (pickedItem.parent !== scene) {
                pickedItem = pickedItem.parent;
            }
            pickedItem.traverse(showPicked);
        }
    };
    elt.addEventListener('mousedown', handleClick, false);
    
    var dragObject = function(event) {
	//console.log(event.type);
        if ((event.buttons & 1) && (pickedItem !== undefined)) {
            var newMouse = screenToNDC(event, elt);
            // Difference between mouse position and click in screen space.
            var diff = new THREE.Vector2();
	    diff.subVectors(newMouse, mouse);
	    mouse = newMouse; // Update mouse

	    // Counteract the perspective depth scaling
	    diff.multiplyScalar(depthScalingFactor(pickedItem, camera));

	    // Empirically-derived kludge and fudge factors
	    // I bet there's a relationship between kludge and the
	    // camera's FOV, which I will figure out iff I have to
	    var kludge = 770;
	    var fudge = new THREE.Vector3(kludge / elt.clientHeight,
					  kludge / elt.clientWidth, 1);
	    diff.multiply(fudge);
	    //console.log(diff.x + " " + diff.y);

	    // Vectors along which to translate are world-space X and Y
	    var worldX = undoObjRot(new THREE.Vector3(1, 0, 0), pickedItem);
	    worldX.normalize();
            var worldY = undoObjRot(new THREE.Vector3(0, 1, 0),	pickedItem);
	    worldY.normalize();
            //console.log('worldX: ' + JSON.stringify(worldX));

            // Translate pickedItem along the worldX and worldY vectors
	    pickedItem.translateOnAxis(worldX, diff.x);
	    pickedItem.translateOnAxis(worldY, diff.y);
        }
    }
    renderer.domElement.addEventListener('mousemove', dragObject, false);
  
    // Key handler
    var handleKeys = function (event) {
	var char = event.charCode;
	switch (String.fromCharCode(event.charCode)) {
	case 'l':
            ptLight.oscillating = !ptLight.oscillating;
            break;
	case 's':
            if (pickedItem !== undefined) {
                pickedItem.scale = pickedItem.scale.multiplyScalar(2);
            }
            break;
	case 'x':
            if (pickedItem !== undefined) {
		if (pickedItem.dTheta.x === 0) {
                    pickedItem.dTheta.setX(dTheta);
		}
		else pickedItem.dTheta.setX(0);
            }
            break;
	case 'y':
            if (pickedItem !== undefined) {
		if (pickedItem.dTheta.y === 0) {
                    pickedItem.dTheta.setY(dTheta);
		}
		else pickedItem.dTheta.setY(0);
            }
            break;
	case 'z':
            if (pickedItem !== undefined) {
		if (pickedItem.dTheta.z === 0) {
                    pickedItem.dTheta.setZ(dTheta);
		}
		else pickedItem.dTheta.setZ(0);
            }
            break;
	case 'p':
            window.setTimeout(function () {
		cylPyramid.dTheta.setY(-cylPyramid.dTheta.y);
            }, 5000);
            break;
	case '?':
            //console.log('? detected');
            toggleHelp();
            break;
	}
    }
    document.addEventListener('keypress', handleKeys, false);
  
    var lum = ptLight.intensity;
    cylPyramid.dTheta.setY(dTheta);
    cube.dTheta.setY(dTheta);

    function render() {
	requestAnimationFrame( render );
	
	if (ptLight.oscillating) {
            theta += dTheta;
            ptLight.intensity = lum * (0.25 * Math.cos(theta) + 0.75);
	}
	else {
            ptLight.intensity = lum;
            theta = 0;
	}
      
	objects.forEach(function (obj) {
	    if (obj.parent === scene) {
		var rotVec = obj.rotation.toVector3();
		rotVec.add(obj.dTheta);
		obj.rotation.setFromVector3(rotVec);
            }
	});

	skyPlane.material.color = new THREE.Color(0x102040).lerp(new THREE.Color(0x4080ff), ptLight.intensity);
	groundPlane.material.color = new THREE.Color(0x001000).lerp(new THREE.Color(0x005000), ptLight.intensity);
	renderer.render( scene, camera );
    }

    //var v1 = new THREE.Vector3(2, 3, 5);
    //var v2 = new THREE.Vector3(7, 11, 13);
    //v1.multiply(v2);
    //console.log(JSON.stringify(v1));
    // 1003x637 (no console)
    
    render();
}

