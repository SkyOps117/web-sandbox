"use strict"
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Scene
function makeScene() {
  const scene = new BABYLON.Scene(engine);
  scene.ambientColor = new BABYLON.Color3(1, 1, 1);
  scene.gravity = new BABYLON.Vector3(0, -0.15, 0);
  scene.collisionsEnabled = true;
  const dsm = new BABYLON.DeviceSourceManager(engine);

  // FreeCam
  const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 5, -15), scene);
  camera.applyGravity = true;
  camera.attachControl(canvas, true);

  // REMOVE DEFAULT INPUTS
  camera.inputs.clear();
  camera.inputs.addMouseWheel();
  //camera.inputs.addMouse();
  //camera.inputs.addKeyboard();
  //camera.inputs.addTouch();

  camera.ellipsoid = new BABYLON.Vector3(1.0, 1.618, 1.0);
  camera.ellipsoidOffset = new BABYLON.Vector3(0, 1, 0);

  camera.fov = 1;

  const camRoot = new BABYLON.TransformNode("root");
  camera.parent = camRoot;
  camera.checkCollisions = true;
  scene.activeCameras.push(camera);
  // scene.onPointerMove = (e, info, type) => {
  //   const dx = e.movementX / (Math.PI * 2 * 160);
  //   const dy = e.movementY / (Math.PI * 2 * 90);

  //   if (camRoot.rotation.x < Math.PI / 2 && camRoot.rotation.x > -Math.PI / 2);
  //   camRoot.rotation.x += dy * 1.5;
  //   camRoot.rotation.y += dx * 5;
  // }

  // Pointer Events
  // Event listener when the pointerlock is updated (or removed by pressing ESC for example).
  let isFullScreen = false;
  function changePointerLock() {
    //let controlEnabled = document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || document.pointerLockElement || null;
    let controlEnabled = document.pointerLockElement || null;
    //toggleFullScreen();
    // If the user is already locked
    if (!controlEnabled) {
      //console.log("EXIT FULLSCREEN");
      isFullScreen = false;
      canvas.style.height = window.innerHeight;
      canvas.height = window.innerHeight;
      scene.onPointerMove = () => { };
      engine.exitFullscreen();
    } else {
      //console.log("ENTER FULLSCREEN");
      isFullScreen = true;
      canvas.style.height = window.screen.height;
      canvas.height = window.screen.height;
      engine.enterFullscreen();
    }
  }
  document.addEventListener("pointerlockchange", changePointerLock, false);

  // DeviceManager
  const deviceSourceManager = new BABYLON.DeviceSourceManager(engine);
  deviceSourceManager.onDeviceConnectedObservable.add((deviceSource) => {
    // Mouse/Touch
    if (deviceSource.deviceType === BABYLON.DeviceType.Mouse || deviceSource.deviceType === BABYLON.DeviceType.Touch) {
      deviceSource.onInputChangedObservable.add((eventData) => {
        // Move
        if (eventData.inputIndex === BABYLON.PointerInput.Move && isFullScreen) {
          const dx = eventData.movementX / (Math.PI * 2 * 160);
          const dy = eventData.movementY / (Math.PI * 2 * 90);
          const euler = new BABYLON.Vector3(dx, dy, 0);
          camRoot.rotation.x += dy;
          camRoot.rotation.y += dx;
          //euler.toQuaternion
          //camRoot.rotationQuaternion = new BABYLON.Quaternion(dy, dx, 0, 0);
        }
        // Left CLick
        if (eventData.inputIndex === BABYLON.PointerInput.LeftClick) {
          // Check fullscreen. Faster than checking pointerlock on each single click.
          if (!isFullScreen) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
              canvas.requestPointerLock();
            }
          }

        }
        // Right CLick
        if (eventData.inputIndex === BABYLON.PointerInput.RightClick) {
          eventData.preventDefault();
        }
      });
    }
    // Keyboard
    else if (deviceSource.deviceType === BABYLON.DeviceType.Keyboard) {
      deviceSource.onInputChangedObservable.add((eventData) => {
        console.log("Type: " + BABYLON.DeviceType[deviceSource.deviceType] + "\n\r Index:" + BABYLON.PointerInput[eventData.inputIndex] + " " + eventData.key);
      });
    }
  });


  // // PointerDown event
  // function onPointerDown(e, info, type) {
  //   // Check fullscreen. Faster than checking pointerlock on each single click.
  //   if (!isFullScreen) {
  //     canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
  //     if (canvas.requestPointerLock) {
  //       canvas.requestPointerLock();
  //     }
  //   }
  //   // Add mouse moved function
  //   // evt: BABYLON.IPointerEvent, pickInfo: BABYLON.PickingInfo, type: BABYLON.PointerEventTypes
  //   function pointerMove(e, info, type) {
  //     //console.log("MouseX moved:" + e.movementX);
  //     const dx = e.movementX / (Math.PI * 2 * 160);
  //     const dy = e.movementY / (Math.PI * 2 * 90);

  //     const upLock = -Math.PI / 8;
  //     const downLock = Math.PI / 8;
  //     //Obtain Euler angles from rotation quaternion

  //     camRoot.rotationQuaternion.x += dy;
  //     camRoot.rotationQuaternion.y -= dx;
  //     // if (camRoot.rotation.x > upLock && camRoot.rotation.x < downLock) {
  //     //   camRoot.rotation.x += dy;
  //     // }
  //     // else if (dy <= 0) {
  //     //   camRoot.rotation.x -= downLock;
  //     //   console.log("rotX "+ camRoot.rotation.x + " dy " + dy);
  //     // }
  //     // else {
  //     //   camRoot.rotation.x -= dy;
  //     // }
  //     // camRoot.rotation.y += dx;
  //   }
  //   scene.onPointerMove = pointerMove;

  //   // Add LeftCLick Code too! :P
  //   //e === 1 (mouse wheel click (not scrolling))
  //   //e === 2 (right mouse click)

  // }
  // scene.onPointerDown = onPointerDown;

  // Dome
  const dome = new BABYLON.PhotoDome("skyDome", "./sky-dome.jpg",
    { resolution: 64, size: 6144, useDirectMapping: false }, scene);
  dome.material.backFaceCulling = false;
  //dome.material.reflectionTexture.coordinatesMode = 9;

  dome.imageMode = BABYLON.PhotoDome.MODE_MONOSCOPIC;
  dome.fovMultiplier = 1;
  dome.infiniteDistance = true;
  //dome.mesh.renderingGroupId = 0;
  // Light
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;

  // Player
  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere",
    { diameter: 2, segments: 32 },
    scene);
  sphere.parent = camRoot;
  sphere.position.y = 1;
  const sphereMat = new BABYLON.StandardMaterial("gMat", scene);
  //groundMat.transparencyMode = 2;
  sphereMat.alpha = 1.0;
  sphereMat.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  sphereMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  sphere.material = sphereMat;
  // Ground
  const ground = BABYLON.MeshBuilder.CreateGround("ground",
    { width: 512, height: 512 },
    scene);
  const groundMat = new BABYLON.StandardMaterial("gMat", scene);
  //groundMat.transparencyMode = 2;
  groundMat.alpha = 0.5;
  groundMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
  groundMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
  //groundMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  //groundMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
  ground.material = groundMat;
  // "Game" Loop
  scene.registerBeforeRender(() => {
    const keyB = dsm.getDeviceSource(BABYLON.DeviceType.Keyboard); 
    if (keyB) {
      let vdir = new BABYLON.Vector3(0, 0, 0);
      // Forward
      if (keyB.getInput(87) == 1) {
        vdir = vdir.add(camRoot.forward);
      }
      // Backward
      if (keyB.getInput(83) == 1) {
        vdir = vdir.subtract(camRoot.forward);
      }
      // Left
      if (keyB.getInput(65) == 1) {
        vdir = vdir.subtract(camRoot.right);
      }
      // Right
      if (keyB.getInput(68) == 1) {
        vdir = vdir.add(camRoot.right);
      }
      camRoot.position = camRoot.position.add(vdir);
    }
  });

  return scene;
};
const scene = makeScene();
// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
  scene.render();
});
// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
  engine.resize();
});
// Add the event listener
canvas.addEventListener("keydown", (event) => {
  //console.log(event.key);
  const forbitKeys = (event.key === "F1" || event.key === "F2" || event.key === "F3" || event.key === "F4" || event.key === "Tab");
  if ((event.ctrlKey || event.shiftKey) || forbitKeys) { // && event.key != "f12"
    event.preventDefault();
  }
}, false);
