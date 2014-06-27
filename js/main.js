var stats, scene, renderer;
var camera, cameraControls;
var celestialBodies= [];
var controls;
var cameracenter;
var time=1;
var gui;
var no_webgl_url = "../../../error/nowebgl";
var followableBodies = [];

var controls= function() {
   this.distance=60;
   this.speed=10;
   this.horizontal_rotation=0;
   this.selected_planet="earth";
};

if(!init())animate();
// init the scene
function init()
{
	renderer = new THREE.WebGLRenderer
	({
		antialias		: true,	// to get smoother output
		preserveDrawingBuffer	: true	// to allow screenshot
	});
	renderer.setClearColorHex( 0xBBBBBB, 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.getElementById('container').appendChild(renderer.domElement);

	// add Stats.js - https://github.com/mrdoob/stats.js
	stats = new Stats();
	stats.domElement.style.position	= 'absolute';
	stats.domElement.style.bottom	= '0px';
	document.body.appendChild( stats.domElement );

	// create a scene
	scene = new THREE.Scene();

	// put a camera in the scene
	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.position.set(0, 0, 100);
	scene.add(camera);


	// transparently support window resize
	THREEx.WindowResize.bind(renderer, camera);
	// allow 'p' to make screenshot
	THREEx.Screenshot.bindKey(renderer);
	// allow 'f' to go fullscreen where this feature is supported
	if( THREEx.FullScreen.available() )
	{
		THREEx.FullScreen.bindKey();		
		document.getElementById('inlineDoc').innerHTML	+= "- <i>f</i> for fullscreen";
	}

	// here you add your objects
	// - you will most likely replace this part by your own
	initGui();
	createSkyBox();
	initCelestialBodies();
	initFollowablePlanets();
	initPointLight();
	initAmbientLight();
}
function initPointLight()
{
	// create a point pointLight
	var pointLight =new THREE.PointLight(0xFFFFFF);
	pointLight.position.x = 0;
	pointLight.position.y = 0;
	pointLight.position.z = 0;
	pointLight.intensity=1.25;
	scene.add(pointLight)
}
function initAmbientLight()
{
	//create an ambientlight
	var ambientLight = new THREE.AmbientLight(0xFFFFFF);
	ambientLight.intensity=0.75;
    	scene.add(ambientLight);
}


  function initGui()
  {
   controls= new controls();
   gui = new dat.GUI();
   gui.add(controls,'distance',0,900);
   gui.add(controls,'speed',1,500);
   gui.add(controls,"horizontal_rotation",0,360);
	};



function createSkyBox()
{
	//load all 6 skybox images into a cubematerial
	var urlPrefix = "textures/";
	var urls = [ urlPrefix + "skybox_right1.png", urlPrefix + "skybox_left2.png",
	    urlPrefix + "skybox_top3.png", urlPrefix + "skybox_bottom4.png",
	    urlPrefix + "skybox_front5.png", urlPrefix + "skybox_back6.png" ];
	var cubemap = THREE.ImageUtils.loadTextureCube(urls);
	cubemap.format = THREE.RGBFormat;
	var shader = THREE.ShaderLib.cube; // init cube shader from built-in lib
	shader.uniforms.tCube.value = cubemap; // apply textures to shader
	// create shader material
	var skyBoxMaterial = new THREE.ShaderMaterial( {
	  fragmentShader: shader.fragmentShader,
	  vertexShader: shader.vertexShader,
	  uniforms: shader.uniforms,
	  depthWrite: false,
	  side: THREE.BackSide
	});

	// create skybox mesh
	var skybox = new THREE.Mesh(
	  new THREE.CubeGeometry(10000, 10000, 10000),
	  skyBoxMaterial
	);
	scene.add(skybox);
}	
function initCelestialBodies()
{
	//add prototype to the celestialbody object.
	initPrototype();
	// params -> radius,texturePath,distance,receivesLight,orbitSpeed,xRotationFactor,yRotationFactor,zRotationFactor,detail,orbitCenter
	var sun= new CelestialBody("sun",25,"textures/sun.jpg",0,false,0,0,0,0,50,null);
	makePlanetFollowable(sun,10,60);
	var earth=new CelestialBody("earth",1.3,"textures/earth.jpg",50,true,500,0,0.16,0,25,sun.mesh);
	makePlanetFollowable(earth,1,5);
	var atmosphere=new CelestialBody("atmosphere",1.32,"textures/clouds.png",50,true,500,0,0.30,0.03,25,sun.mesh);
	var moon=new CelestialBody("moon",0.325,"textures/moon.jpg",3,true,41,0.02,0,0.05,25,earth.mesh);
	makePlanetFollowable(moon,10,2);
	var mercury=new CelestialBody("mercury",0.5,"textures/mercury.jpg",30,true,12,0.001,0.2,0,25,sun.mesh);
	makePlanetFollowable(mercury,2,3);
	var venus=new CelestialBody("venus",1.2,"textures/venus.jpg",34,true,31,0,0.02,0.05,25,sun.mesh);
	makePlanetFollowable(venus,5,5);
	var jupiter=new CelestialBody("jupiter",14,"textures/jupiter.jpg",87,true,593,0,0.003,0,35,sun.mesh);
	makePlanetFollowable(jupiter,80,60);
	var saturn=new CelestialBody("saturn",12,"textures/saturn.jpg",339,true,1473,0.002,0,0.005,25,sun.mesh);
	makePlanetFollowable(saturn,240,18);
	var mars=new CelestialBody("mars",0.7,"textures/mars.jpg",43,true,94,0.02,0,0.05,25,sun.mesh);
	makePlanetFollowable(mars,3,3);
	var uranus=new CelestialBody("uranus",5,"textures/uranus.jpg",455,true,4204,0,0.0002,0.0005,25,sun.mesh);
	makePlanetFollowable(uranus,350,15);
	var neptune=new CelestialBody("neptune",4.7,"textures/neptune.jpg",700,true,8241,0.0003,0,0.0001,25,sun.mesh);
	makePlanetFollowable(neptune,500,15);
}
function makePlanetFollowable(planet,defaultSpeed,defaultDistance)
{
	followableBodies.push(planet.name);
	planet.defaultSpeed=defaultSpeed;
	planet.defaultDistance=defaultDistance;
}
function initFollowablePlanets()
{
	var planetController=gui.add(controls,"selected_planet",followableBodies);
	planetController.onChange(function(value) 
	{
		followSelectedPlanet();
		 // Iterate over all controllers
	  for (var i in gui.__controllers) 
	  {
	    gui.__controllers[i].updateDisplay();
	  }
	});
	followSelectedPlanet();
}
function followSelectedPlanet()
{
	var selected_planet=celestialBodies[controls.selected_planet];
	cameracenter=selected_planet.mesh;
	controls.speed=selected_planet.defaultSpeed;
	controls.distance=selected_planet.defaultDistance;

}
function animateBodies()
{
	for (var planetName in celestialBodies)
	{
		celestialBodies[planetName].move();
	}
	time=time+(1*(controls.speed/100));
}
function initPrototype()
{
	CelestialBody.prototype.move=
	function()
	{
		this.mesh.rotation.y += this.yRotationFactor *(controls.speed/100);
		this.mesh.rotation.x += this.xRotationFactor*(controls.speed/100);
		this.mesh.rotation.z += this.zRotationFactor*(controls.speed/100);
		if(this.distance>0)
		{
		this.mesh.position.x = this.orbitCenter.position.x+this.distance*Math.cos(time/this.orbitSpeed);	
		this.mesh.position.z = this.orbitCenter.position.z+this.distance*Math.sin(time/this.orbitSpeed);
		}
	
	};
}
function animateCamera()
{
	camera.position.x =  cameracenter.position.x+controls.distance * Math.cos(controls.horizontal_rotation*(Math.PI/180));
	camera.position.z =  cameracenter.position.z+controls.distance * Math.sin(controls.horizontal_rotation*(Math.PI/180));
	camera.lookAt(cameracenter.position);
}


// animation loop
function animate() 
{

	// loop on request animation loop
	// - it has to be at the begining of the function
	// - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	requestAnimationFrame( animate );

	// do the render
	render();

	// update stats
	stats.update();
	animateBodies();
	animateCamera();
}

// render the scene
function render() 
{
	// actually render the scene
	renderer.render( scene, camera );
	animateBodies();
}


function CelestialBody(name,radius,texturePath,distance,receivesLight,orbitSpeed,xRotationFactor,yRotationFactor,zRotationFactor,detail,orbitCenter)
{
	//constructor
	this.name=name;
	this.radius=radius;
	this.texturePath=texturePath;
	this.distance=distance;
	this.orbitSpeed=orbitSpeed;
	this.xRotationFactor=xRotationFactor;
	this.yRotationFactor=yRotationFactor;
	this.zRotationFactor=zRotationFactor;
	this.orbitCenter=orbitCenter;
	var material;
	var geometry = new THREE.SphereGeometry(this.radius,detail,detail);
	if(receivesLight===false) {
		material = new THREE.MeshBasicMaterial ({
			map:THREE.ImageUtils.loadTexture(this.texturePath),
		});
	}
	else {
		material = new THREE.MeshPhongMaterial ({
		map:THREE.ImageUtils.loadTexture(this.texturePath),
		ambient:0x141412,
		transparent:(this.name=="atmosphere")
		});			
	}
	var mesh = new THREE.Mesh(geometry,material);
	this.mesh=mesh;
	scene.add(mesh);
	celestialBodies[this.name]=this;
}







