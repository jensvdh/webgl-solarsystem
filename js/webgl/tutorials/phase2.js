	var stats, scene, renderer;
	var camera, cameraControls;
	var speed=50;
	var celestialBodies=new Array();

	if( !init() )	animate();

		// init the scene
		function init()
		{

			if( Detector.webgl )
			{
				renderer = new THREE.WebGLRenderer({
					antialias		: true,	// to get smoother output
					preserveDrawingBuffer	: true	// to allow screenshot
				});
				renderer.setClearColorHex( 0xBBBBBB, 1 );
			// uncomment if webgl is required
			}
			else
			{
			    window.location = "../../../error/nowebgl";
				return true;
		   }
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
			createSkyBox();
			initCelestialBodies();
		}
		function initPrototype()
		{
			CelestialBody.prototype.move=
			function()
			{
				this.mesh.rotation.y += this.yRotationFactor *(speed/100);
				this.mesh.rotation.x += this.xRotationFactor*(speed/100);
				this.mesh.rotation.z += this.zRotationFactor*(speed/100);
			};
		}
		function createSkyBox()
		{
			//load all 6 skybox images into a cubematerial
			var urlPrefix = "../../../images/textures//";
			var urls = [ urlPrefix + "skybox_right1.png", urlPrefix + "skybox_left2.png",
			    urlPrefix + "skybox_top3.png", urlPrefix + "skybox_bottom4.png",
			    urlPrefix + "skybox_front5.png", urlPrefix + "skybox_back6.png" ];
			var textureCube = THREE.ImageUtils.loadTextureCube(urls);

			var shader = THREE.ShaderUtils.lib["cube"];
			shader.uniforms['tCube'].texture= textureCube; 
			//Create a custom material and shader for the cube.
			var material = new THREE.ShaderMaterial({
			    fragmentShader  : shader.fragmentShader,
			    vertexShader    : shader.vertexShader,
			    uniforms    : shader.uniforms
			});
			skyboxMesh  = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000, 1, 1, 1, null, true ), material );
			//make our mesh doublesided so we can see the textures from the inside.
			skyboxMesh.doubleSided = true;
			scene.add(skyboxMesh);
		}	
		function initCelestialBodies()
		{
			var sun= new CelestialBody(25,"../../../images/textures//sun.jpg",0,false,0,-0.005,-0.002,-0.001,25,null);
			celestialBodies["sun"]=sun;
			//add prototype to the celestialbody object.
			initPrototype();
			scene.add(sun.mesh);

		}
		function animateBodies()
		{
			for (var planetName in celestialBodies)
			{
				celestialBodies[planetName].move();
			}
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
		}

		// render the scene
		function render() 
		{
			// actually render the scene
			renderer.render( scene, camera );
			animateBodies();

		}


		function CelestialBody(radius,texturePath,distance,receivesLight,orbitSpeed,xRotationFactor,yRotationFactor,zRotationFactor,detail,orbitCenter)
		{
			//constructor
			this.radius=radius;
			this.texturePath=texturePath;
			this.distance=distance;
			this.orbitSpeed=orbitSpeed;
			this.xRotationFactor=xRotationFactor;
			this.yRotationFactor=yRotationFactor;
			this.zRotationFactor=zRotationFactor;
			this.orbitCenter=orbitCenter;
			var geometry = new THREE.SphereGeometry(radius,detail,detail);
			if(receivesLight===false)
			{
				var material = new THREE.MeshBasicMaterial
				({
					map:THREE.ImageUtils.loadTexture(this.texturePath),
				});
			}
			var mesh = new THREE.Mesh(geometry,material);
			this.mesh=mesh;

		}






		
