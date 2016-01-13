/**
 * Created by itmnext13 on 2016. 1. 13..
 */
'use strict';

angular.module('threeApp')
  .directive('ngTrackBall', function () {
    return {
      restrict: 'A',
      scope:{
        'width': '=',
        'height': '=',
        'fillcontainer': '=',
        'scale': '=',
        'materialType': '='
      },
      link: function(scope, element, attrs) {
        var container, stats;
        var camera, controls, scene, renderer;
        var pickingData = [], pickingTexture, pickingScene;
        var objects = [];
        var highlightBox;
        var materials= {};

        var rayCaster,plane;

        var rollOverGeo,rollOverMaterial,rollOverMesh;

        var contW =  element[0].clientWidth,
          contH = scope.height;
        var mouse = new THREE.Vector2();
        var offset = new THREE.Vector3(10, 10, 10);

        function init() {

          container = element[0];


          camera = new THREE.PerspectiveCamera(70,contW/contH, 1, 10000);
          camera.position.z = 1000;

          controls = new THREE.TrackballControls(camera,container);

          controls.rotateSpeed = 1.0;
          controls.zoomSpeed = 1.2;
          controls.panSpeed = 0.8;
          controls.noZoom = false;
          controls.noPan = false;
          controls.staticMoving = true;
          controls.dynamicDampingFactor = 0.3;

          materials.lambert = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
          });

          materials.phong = new THREE.MeshPhongMaterial({
            ambient: 0x030303,
            color: 0xdddddd,
            specular: 0x009900,
            shininess: 30,
            shading: THREE.FlatShading,
            vertexColors: THREE.VertexColors
          });

          materials.wireframe = new THREE.MeshBasicMaterial({
            color: 0x000000,
            shading: THREE.FlatShading,
            wireframe: true,
            transparent: true });


          scene = new THREE.Scene();

          pickingScene = new THREE.Scene();
          pickingTexture = new THREE.WebGLRenderTarget(contW, contH);
          pickingTexture.minFilter = THREE.LinearFilter;
          pickingTexture.generateMipmaps = false;

          scene.add(new THREE.AmbientLight(0x555555));

          var light = new THREE.SpotLight(0xffffff, 1.5);
          light.position.set(0, 500, 2000);
          scene.add(light);

          var geometry = new THREE.Geometry(),
            pickingGeometry = new THREE.Geometry(),
            pickingMaterial = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors}),
            defaultMaterial = new THREE.MeshLambertMaterial({
              color: 0xffffff,
              shading: THREE.FlatShading,
              vertexColors: THREE.VertexColors
            });

          function applyVertexColors(g, c) {

            g.faces.forEach(function (f) {

              var n = ( f instanceof THREE.Face3 ) ? 3 : 4;

              for (var j = 0; j < n; j++) {

                f.vertexColors[j] = c;

              }

            });

          }

          var geom = new THREE.BoxGeometry(1, 1, 1);
          var color = new THREE.Color();

          var matrix = new THREE.Matrix4();
          var quaternion = new THREE.Quaternion();

          for (var i = 0; i < 5000; i++) {

            var position = new THREE.Vector3();
            position.x = Math.random() * 10000 - 5000;
            position.y = Math.random() * 6000 - 3000;
            position.z = Math.random() * 8000 - 4000;

            var rotation = new THREE.Euler();
            rotation.x = Math.random() * 2 * Math.PI;
            rotation.y = Math.random() * 2 * Math.PI;
            rotation.z = Math.random() * 2 * Math.PI;

            var scale = new THREE.Vector3();
            scale.x = Math.random() * 200 + 100;
            scale.y = Math.random() * 200 + 100;
            scale.z = Math.random() * 200 + 100;

            quaternion.setFromEuler(rotation, false);
            matrix.compose(position, quaternion, scale);

            // give the geom's vertices a random color, to be displayed

            applyVertexColors(geom, color.setHex(Math.random() * 0xffffff));

            geometry.merge(geom, matrix);

            // give the geom's vertices a color corresponding to the "id"

            applyVertexColors(geom, color.setHex(i));

            pickingGeometry.merge(geom, matrix);

            pickingData[i] = {

              position: position,
              rotation: rotation,
              scale: scale

            };

          }

          var drawnObject = new THREE.Mesh(geometry, defaultMaterial);
          scene.add(drawnObject);

          pickingScene.add(new THREE.Mesh(pickingGeometry, pickingMaterial));

          highlightBox = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshLambertMaterial({color: 0xffff00}
            ));
          scene.add(highlightBox);


          var radius = 5;
          var segments = 32;
          rollOverGeo = new THREE.CircleGeometry( radius, segments);
          rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
          rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
          scene.add( rollOverMesh );



          rayCaster = new THREE.Raycaster();

          var geometry2 = new THREE.PlaneBufferGeometry( 1000, 1000 );
          geometry2.rotateX( - Math.PI / 2 );

          plane = new THREE.Mesh( geometry2, new THREE.MeshBasicMaterial( { visible: false } ) );
          scene.add( plane );

          objects.push( plane );



          renderer = new THREE.WebGLRenderer({antialias: true});
          renderer.setClearColor(0xffffff);
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setSize(contW, contH);
          renderer.sortObjects = false;

          stats = new Stats();
          console.log( container.parentNode);
          stats.domElement.style.zIndex = 11;
          stats.domElement.style.position = 'absolute';


          container.appendChild(stats.domElement);
          container.appendChild(renderer.domElement);


          renderer.domElement.addEventListener('mousemove', onMouseMove);

          window.addEventListener( 'resize', scope.onWindowResize, false );

        }

        //

        function onMouseMove(e) {

          mouse.x = e.pageX - container.offsetLeft;
          mouse.y = e.pageY - container.offsetTop;
        }

        function animate() {

          requestAnimationFrame(scope.animate);

          scope.render();
          stats.update();

        }

        function pick() {

          //render the picking scene off-screen

          renderer.render(pickingScene, camera, pickingTexture);

          //create buffer for reading single pixel
          var pixelBuffer = new Uint8Array(4);

          //read the pixel under the mouse from the texture
          renderer.readRenderTargetPixels(pickingTexture, mouse.x, pickingTexture.height - mouse.y, 1, 1, pixelBuffer);

          //interpret the pixel as an ID

          var id = ( pixelBuffer[0] << 16 ) | ( pixelBuffer[1] << 8 ) | ( pixelBuffer[2] );
          var data = pickingData[id];

          if (data) {

            //move our highlightBox so that it surrounds the picked object

            if (data.position && data.rotation && data.scale) {

              highlightBox.position.copy(data.position);
              highlightBox.rotation.copy(data.rotation);
              highlightBox.scale.copy(data.scale).add(offset);
              highlightBox.visible = true;

            }

          } else {

            highlightBox.visible = false;

          }

        }

        function render() {

          controls.update();

          pick();

          renderer.render(scene, camera);

        }

        // -----------------------------------
        // Event listeners
        // -----------------------------------
        scope.onWindowResize = function () {

          scope.resizeCanvas();

        };

        // -----------------------------------
        // Updates
        // -----------------------------------
        scope.resizeCanvas = function () {

          contW = element[0].clientWidth;
          contH = scope.height;

          camera.aspect = contW / contH;
          camera.updateProjectionMatrix();

          renderer.setSize( contW, contH );
          controls.handleResize();


        };

        scope.resizeObject = function () {

          //icosahedron.scale.set(scope.scale, scope.scale, scope.scale);
          //shadowMesh.scale.set(scope.scale, scope.scale, scope.scale);

        };

        scope.changeMaterial = function () {

          //icosahedron.material = materials[scope.materialType];

        };


        // -----------------------------------
        // Draw and Animate
        // -----------------------------------
        scope.animate = animate;
        scope.render = render;
        scope.init = init;


        scope.init();
        scope.animate();
      }

      };
  });
