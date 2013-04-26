	var stats, scene, renderer;
	var camera, cameraControls;
	var celestialBodies=new Array();
	var controls;
	var cameracenter;
	var time=1;
	var gui;
	var controls= function() 
	{
	     this.distance=60;
	     this.speed=10;
	     this.horizontal_rotation=0;
	     this.selected_planet="earth";
	};
	if(!init())animate();

		// init the scene
		function init()
		{

		    if (Detector.webgl) {
		        renderer = new THREE.WebGLRenderer
				({
				    antialias: true,	// to get smoother output
				    preserveDrawingBuffer: true	// to allow screenshot
				});
		        renderer.setClearColorHex(0xBBBBBB, 1);
		    }
		    else
		    {
		        window.location = "../../../error/nowebgl"
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
			initGui();
			createSkyBox();
			initCelestialBodies();
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
			ambientLight.intensity=0.5;
        	scene.add(ambientLight);
		}
		

	    function initGui()
	    {
	     controls= new controls();
	     gui = new dat.GUI();
	     gui.add(controls,'distance',0,5000);
	     gui.add(controls,'speed',1,500);
	     gui.add(controls,"horizontal_rotation",0,900);
	 	};


	
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
			    fragmentShader: shader.fragmentShader,
			    vertexShader: shader.vertexShader,
			    uniforms: shader.uniforms
			});
			skyboxMesh  = new THREE.Mesh( new THREE.CubeGeometry( 100000, 100000, 100000, 1, 1, 1, null, true ), material );
			//make our mesh doublesided so we can see the textures from the inside.
			skyboxMesh.doubleSided = true;
			scene.add(skyboxMesh);
		}	
		function initCelestialBodies()
		{
			//add prototype to the celestialbody object.
			initPrototype();
			// params -> radius,texturePath,distance,receivesLight,orbitSpeed,xRotationFactor,yRotationFactor,zRotationFactor,detail,orbitCenter
			var sun= new CelestialBody("sun",25,"../../../images/textures//sun.jpg",0,false,0,0,0,0,50,null);
			var earth=new CelestialBody("earth",1.3,"../../../images/textures//earth.jpg",37,true,500,0,0.16,0,25,sun.mesh);
			var atmosphere=new CelestialBody("atmosphere",1.32,"../../../images/textures//clouds.png",37,true,500,0,0.30,0.03,25,sun.mesh);
			var moon=new CelestialBody("moon",0.325,"../../../images/textures//moon.jpg",3,true,41,0.02,0,0.05,25,earth.mesh);
			cameracenter=(moon.mesh);
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
			var geometry = new THREE.SphereGeometry(this.radius,detail,detail);
			if(receivesLight===false)
			{
				var material = new THREE.MeshBasicMaterial
				({
					map:THREE.ImageUtils.loadTexture(this.texturePath),
				});
			}
			else
			{
				material = new THREE.MeshPhongMaterial
				({
				map:THREE.ImageUtils.loadTexture(this.texturePath),
				ambient:0x141412,
				transparent:true
				});			
			}
			var mesh = new THREE.Mesh(geometry,material);
			this.mesh=mesh;
			scene.add(mesh);
			celestialBodies[this.name]=this;
		}






		
