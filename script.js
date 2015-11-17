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
    //          + '), (' + elt.clientWidth + ',' + elt.clientHeight 
    //          + ') = (' + mouse.x + ',' + mouse.y + ')');
    return mouse;
}

function setIgnatzOpacities(ignatz) {
    if (ignatz.currentSlice < 0) {
	ignatz.material.opacity = 1;
	ignatz.renderOrder = 0;
    }
    else {
	ignatz.material.opacity = 0.4;
	ignatz.renderOrder = 10;
    }

    // Set the planes
    for (var i = 0; i < ignatz.currentSlice; i++) {
	ignatz.planes[i].material.opacity = 0.05;
	ignatz.planes[i].renderOrder = 8;
    }
    for (i = ignatz.currentSlice; i < ignatz.planes.length; i++) {
	ignatz.planes[i].material.opacity = 1;
	ignatz.planes[i].renderOrder = 0;
    }
}

function drawstuff() {
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 2000 );
    var objects = new Array();

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    var elt = renderer.domElement;
    // alert(elt.clientWidth + " x " + elt.clientHeight + " : "
    //    + elt.scrollWidth + " x " + elt.scrollHeight + " : "
    //    + elt.offsetWidth + " x " + elt.offsetHeight);
  
    var theta = 0;
    var dTheta = 0.03;
    var t = 0;
    var dt = 0.005;
    
    // Make a cube
    var cube = makeCube();
    cube.traverse(function (obj) { objects.push(obj); });
    scene.add( cube );
    cube.translateX(-2);
    cube.translateZ(-5);
  
  // Add an axis jack
    var helperjack = new THREE.AxisHelper();
    addTurningAttribs(helperjack);
    helperjack.traverse(function (obj) { objects.push(obj); });
    helperjack.translateX(2);
    helperjack.translateY(-1.5);
    helperjack.translateZ(-5);
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
    cone.translateZ(-8);
    cone.add(new THREE.AxisHelper());
    scene.add(cone);
    
    // Add background planes
    var skyPlane = makeSkyPlane();
    scene.add(skyPlane);
    var groundPlane = makeGroundPlane()
    scene.add(groundPlane);
    
    var pyrMaterial = makePyramidMaterial();
    var cylPyramid = makeCylinderPyramid(pyrMaterial);
    cylPyramid.traverse(function (obj) { objects.push(obj); });
    //cylPyramid.translateZ();
    cylPyramid.translateX(3);
    cylPyramid.translateY(5);
    cylPyramid.translateZ(-5);
    scene.add(cylPyramid);
    
    var pyramid = makePolygonPyramid();
    pyramid.traverse(function (obj) { objects.push(obj); });
    pyramid.translateY(0.5);
    cube.add( pyramid );

    var pikachu = makePikachu();
    pikachu.traverse(function (obj) { objects.push(obj); });
    pikachu.translateZ(-8);
    pikachu.translateX(6.5);
    //pikachu.translateY(-1);
    scene.add(pikachu);
    
    var mario2 = makeBillboardSprite();
    objects.push(mario2);
    mario2.translateX(-5);
    scene.add(mario2);
    mario2.running = false;
    
    // Add an ignatz
    var ignatz = makeIgnatz();
    ignatz.traverse(function (obj) { objects.push(obj); });
    ignatz.translateX(-7);
    scene.add(ignatz);

    // Add a transparent plane
    var p = makePlane(1.5, 1, "rgb(255, 0, 0)");
    objects.push(p);
    scene.add(p);
    p.translateZ(-10 - 5);
    p.translateY(1);
    p.translateX(-5 + -.8);

    var p = makePlane(3, 1, "rgb(0, 0, 255)");
    objects.push(p);
    scene.add(p);
    p.translateZ(-10 - 2);
    p.translateY(1);
    p.translateX(-5);

    p = makePlane(3, 1, "rgb(255, 0, 0)");
    objects.push(p);
    scene.add(p);
    p.translateZ(-10 + 2);
    p.translateY(1);
    p.translateX(-5);

    p = makePlane(1.5, 1, "rgb(255, 0, 0)");
    objects.push(p);
    scene.add(p);
    p.translateZ(-10 - 5);
    p.translateY(1);
    p.translateX(-5 + .8);

    // Make lightning, just for trial
    //scene.add(makeLightning(new THREE.Vector3(0,0,0),
    //			    new THREE.Vector3(5,5,5)));

    // Add some lights
    var ptLight = makeLights();
    scene.add(ptLight);
    
    camera.position.y = 5;
    camera.position.z = 25;  // Sets the eyepoint to (0, 0, 5)
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    // View direction (view vector) defaults to negative Z (i.e., (0, 0, -1))
    // Up vector (which way is up for the camera?) defaults to positive Y (i.e., (0, 1, 0))
  
    ptLight.oscillating = false;
  
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
            if (pickedItem === pikachu) {
                pikachu.animating = false;
            }
            pickedItem.traverse(showPicked);
        }
    };
    elt.addEventListener('mousedown', handleClick);
    
    var dragObject = function(event) {
        //console.log(event.type);
        if ((event.buttons & 1) && (pickedItem !== undefined)) {
            var newMouse = screenToNDC(event, elt);
            // Difference between mouse position and click in screen space.
            var drag = new THREE.Vector2();
            drag.subVectors(newMouse, mouse);
            mouse = newMouse; // Update mouse
    
            // Counteract the perspective depth scaling
            drag.multiplyScalar(depthScalingFactor(pickedItem, camera));
    
            // Empirically-derived kludge and fudge factors
            // I bet there's a relationship between kludge and the
            // camera's FOV, which I will figure out iff I have to
            var kludge = elt.clientWidth * .770;  
                // 990 on lab machine, 1280 x 643 window
                // 770 on home Linux machine, 1003 x 637 window;
            // Fudge has to do with the fact that NDC isn't square in screen space
            var fudge = new THREE.Vector2(kludge / elt.clientHeight,
                                          kludge / elt.clientWidth);
            drag.multiply(fudge);
            //console.log(diff.x + " " + diff.y);
    
            // Vectors along which to translate are world-space X and Y
            var worldX = undoObjRot(new THREE.Vector3(1, 0, 0), pickedItem);
            worldX.normalize();
            var worldY = undoObjRot(new THREE.Vector3(0, 1, 0), pickedItem);
            worldY.normalize();
                //console.log('worldX: ' + JSON.stringify(worldX));
    
                // Translate pickedItem along the worldX and worldY vectors
            pickedItem.translateOnAxis(worldX, drag.x);
            pickedItem.translateOnAxis(worldY, drag.y);
        }
    }
    renderer.domElement.addEventListener('mousemove', dragObject, false);
    
    var turnObject = function(event) {
        if ((event.buttons & 1) && (pickedItem !== undefined)) {
            //alert('Turn, turn, turn');
            // Mouse to NDC
            var newMouse = screenToNDC(event, elt);
            
            // Difference between mouse position and click in screen space.
            var drag = new THREE.Vector2();
            drag.subVectors(newMouse, mouse);
            mouse = newMouse; // Update mouse

            // Empirically-derived kludge and fudge factors
            // I bet there's a relationship between kludge and the
            // camera's FOV, which I will figure out iff I have to
            var kludge = elt.clientWidth;  // lab machine, 1280 x 643 window
            // Fudge has to do with the fact that NDC isn't square in screen space
            var fudge = new THREE.Vector2((kludge * .5) / elt.clientHeight,
                                          kludge / elt.clientWidth);
            drag.multiply(fudge);

            // NDC to X and Y Euler angles
            var rotX = -drag.y * Math.PI;
            var rotY = drag.x * Math.PI;
            //alert(rotX);

            // Vectors about which to rotate are world-space X and Y
            var worldX = undoObjRot(new THREE.Vector3(1, 0, 0), pickedItem);
            worldX.normalize();
            var worldY = undoObjRot(new THREE.Vector3(0, 1, 0), pickedItem);
            worldY.normalize();

            // Do the actual rotation
            pickedItem.rotateOnAxis(worldX, rotX);
            pickedItem.rotateOnAxis(worldY, rotY);
        }
    }
    //elt.addEventListener('mousemove', turnObject, false);
    
    var diff = new THREE.Vector2(0, 0);
    var startDrag = function(event) {
        //console.log('Start drag');
        elt.addEventListener('mousemove', controlObject, false);
    }
    
    var finishDrag = function(event) {
        //console.log('End drag');
        elt.removeEventListener('mousemove', controlObject, false);
        diff.set(0, 0);
    }
    
    var controlObject = function(event) {
        if ((event.buttons & 1) && (pickedItem !== undefined)) {
            // Mouse to NDC
            var newMouse = screenToNDC(event, elt);
            
            // Difference between mouse position and click in screen space.
            diff.subVectors(newMouse, mouse);
            //console.log(JSON.stringify(diff));
        }
        else if (event.buttons === 0) { // Oops!  Missed a mouseup
            finishDrag();
        }
    };
    
    
    // Key handler
    var handleKeys = function (event) {
	var char = event.charCode;
	switch (String.fromCharCode(event.charCode)) {
	case '-':
	    ignatz.currentSlice++;
	    setIgnatzOpacities(ignatz);
	    break;
	case '+':
	    ignatz.currentSlice--;
	    setIgnatzOpacities(ignatz);
	    break;
	case 'a':
            pikachu.animating = !pikachu.animating;
            if (pikachu.animating === true) {
                t = 0;
            }
            break;
        case 'l':
            ptLight.oscillating = !ptLight.oscillating;
            break;
	case 'm':
            mario2.running = !mario2.running;
            mario2.tex.frame = mario2.tex.numFrames;
            //mario2.tex.offset.copy(mario2.tex.initialOffset);
            //mario2.running = true;
            //mario2.tex.frame = (mario2.tex.frame + 1) % mario2.tex.numFrames;
            break;
        case 'p':
            window.setTimeout(function () {
                    cylPyramid.dTheta.setY(-cylPyramid.dTheta.y);
                }, 5000);
            break;
	case 'r':
            elt.removeEventListener('mousemove', dragObject, false);
            elt.removeEventListener('mousedown', startDrag);
            elt.removeEventListener('mouseup', finishDrag, false);
            elt.addEventListener('mousemove', turnObject, false);
            $('.dragging').addClass('hidden');
            $('.control').addClass('hidden');
            $('.turning').removeClass('hidden');
            break;
        case 's':
            if (pickedItem !== undefined) {
                pickedItem.scale = pickedItem.scale.multiplyScalar(2);
            }
            break;
	case 't':
            elt.removeEventListener('mousemove', turnObject, false);
            elt.removeEventListener('mousedown', startDrag);
            elt.removeEventListener('mouseup', finishDrag, false);
            elt.addEventListener('mousemove', dragObject, false);
            $('.dragging').removeClass('hidden');
            $('.control').addClass('hidden');
            $('.turning').addClass('hidden');
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
	case '0':
            //alert('0 detected');
            if (pickedItem !== undefined) {
                pickedItem.rotation.setFromVector3(new THREE.Vector3(0, 0, 0));
            }
            break;
	case '1':
            // Mouse control of the selected object, *not* using pointer lock
            $('.dragging').addClass('hidden');
            $('.control').removeClass('hidden');
            $('.turning').addClass('hidden');
            elt.removeEventListener('mousemove', dragObject, false);
            elt.removeEventListener('mousemove', turnObject, false);
            elt.addEventListener('mousedown', startDrag);
            elt.addEventListener('mouseup', finishDrag, false);
            dragStarted = false;
            break;
	case '2':
            // Mouse control of selected object using pointer lock
            $('.dragging').addClass('hidden');
            $('.control').removeClass('hidden');
            $('.turning').addClass('hidden');
            break;
        case '?':
            //console.log('? detected');
            toggleHelp();
            break;
        }
    }
    document.addEventListener('keypress', handleKeys, false);
  
    var lum = ptLight.intensity;
    var dz = 0.1;
    //cylPyramid.dTheta.setY(dTheta);
    //cube.dTheta.setY(dTheta);

    var drawsPerFrame = 3;
    var i = 0;
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
    
        // If we're controlling the picked object as a character...
        if ((pickedItem !== undefined) && (diff.x !== 0 || diff.y !== 0)) {
            //console.log('render: ' + JSON.stringify(diff) + ' ' + pickedItem);
            pickedItem.rotation.y += diff.x * dTheta;
            pickedItem.translateZ(diff.y * dz);
        }

        if (mario2.running) {
            i = (i + 1) % drawsPerFrame;
            if (i === 0) {
                mario2.tex.frame = (mario2.tex.frame + 1) % mario2.tex.numFrames;   
            }
        }
        mario2.tex.offset.setX(mario2.tex.frameX[mario2.tex.frame]); // + (mario2.tex.initialOffset.x % mario2.tex.incrX));

        if (pikachu.animating) {
             // Update t
            t += dt;
            if ((t <= 0) || (t >= 1)) {
                dt = -dt;
            }
                
            if (t <= 0.1) {
                pikachu.position.setY(pikachu.initialY * (1 + 10 * t));
                pikachu.position.setX(0);
            }
            else if (t <= 0.2) {
                pikachu.position.setY(pikachu.initialY * (2 - 10 * (t - 0.1)));
                pikachu.position.setX(0);
            }
            else if (t <= 0.3) {
                pikachu.position.setY(pikachu.initialY * (1 + 10 * (t - 0.2)));
                pikachu.position.setX(0);
            }
            else if (t <= 0.4) {
                pikachu.position.setY(pikachu.initialY * (2 - 10 * (t - 0.3)));
                pikachu.position.setX(0);
            }
            else if (t <= 0.5) {
                pikachu.position.setY(pikachu.initialY * (1 + 10 * (t - 0.4)));
                pikachu.position.setX(0);
            }
            else if (t <= 0.6) {
                pikachu.position.setY(pikachu.initialY * (2 - 10 * (t - 0.5)));
                pikachu.position.setX(0);
            }
            else if (t <= 0.7) {
                pikachu.position.setY(pikachu.initialY * (1 + 10 * (t - 0.6)));
                pikachu.position.setX(-10 * (t - 0.6));
            }
            else {
                pikachu.position.setX(-10 * (t - 0.6));
            }
            
        }

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

