// Object that pops up and down at random intervals

function makeDuration() {
    var minTime = 1500;
    var maxTime = 5000;
    return minTime + (Math.random() * (maxTime - minTime));
}

function BouncingObject(r, x, z, obj) {
    var hole = new THREE.Mesh(new THREE.CircleGeometry(r, 32),
			      new THREE.MeshBasicMaterial({ color: 0x000000 }));
    var xlate = obj.position.clone();
    obj.translateX(-xlate.x);
    obj.translateY(-xlate.y);
    obj.translateZ(-xlate.z);
    obj.rotateX(Math.PI / 2);
    obj.translateX(xlate.x);
    obj.translateY(xlate.y);
    obj.translateZ(xlate.z);
    
    hole.add(obj);
    hole.rotateX(-Math.PI / 2);
    hole.translateX(x);
    hole.translateZ(z);

    hole.up = false;

    hole.fried = false;
    
    hole.popDown = function() {
	if (!hole.fried) {
	    obj.translateY(-100);
	    hole.up = false;
	    window.setTimeout(function() {
		hole.popUp();
	    }, makeDuration());
	}
    }

    hole.popUp = function() {
	obj.translateY(100);
	hole.up = true;
	window.setTimeout(function() {
	    hole.popDown();
	}, makeDuration());
    }

    hole.popDown();
    
    return hole;
}

