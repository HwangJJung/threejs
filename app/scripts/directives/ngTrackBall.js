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
        var objects = [];
        var materials= {};
        var plane;
        var cntrlIsPressed = false;

        var lights = [];

        var raycaster;
        var INTERSECTED, SELECTED,intersects;
        var contW =  element[0].clientWidth,
          contH = scope.height;
        var mouse = new THREE.Vector2();
        var offset = new THREE.Vector3(0, 0, 0);

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
            vertexColors: THREE.VertexColors
          });

          materials.phong = new THREE.MeshPhongMaterial({
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


          scene.add(new THREE.AmbientLight(0x444444));

          var light = new THREE.SpotLight(0xffffff, 1.0);
          light.position.set(0, 500, 2000);
          light.castShadow = true;

          light.shadowCameraNear = 200;
          light.shadowCameraFar = camera.far;
          light.shadowCameraFov = 50;

          light.shadowBias = -0.00022;

          light.shadowMapWidth = 2048;
          light.shadowMapHeight = 2048;

          scene.add(light);

          var geometry = new THREE.Geometry(),
            pickingGeometry = new THREE.Geometry(),
            pickingMaterial = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors}),
            defaultMaterial = new THREE.MeshLambertMaterial({
              color: 0xffffff,
              vertexColors: THREE.VertexColors
            });

          var p = 2;
          var q = 3;
          var radius = 5;


          var color = new THREE.Color();

          var matrix = new THREE.Matrix4();
          var quaternion = new THREE.Quaternion();

          var position = new THREE.Vector3();
          var rotation = new THREE.Euler();
          var scale = new THREE.Vector3();
          var geom,object;

          (function(){
          for (var i = 0; i < 200; i++) {

              position.x = Math.random() * 1000 - 500;
              position.y = Math.random() * 600 - 300;
              position.z = Math.random() * 800 - 400;

              rotation.x = Math.random() * 2 * Math.PI;
              rotation.y = Math.random() * 2 * Math.PI;
              rotation.z = Math.random() * 2 * Math.PI;


              scale.x = Math.random() * 8 + 1;
              scale.y = Math.random() * 8 + 1;
              scale.z = Math.random() * 8 + 1;

              p = ~~(Math.random() *19 +1);
              q = ~~(Math.random() *19 +1);

            geom = new THREE.TorusKnotGeometry(radius, 2, 85, 7, p, q, 2);

             quaternion.setFromEuler(rotation, false);
              matrix.compose(position, quaternion, scale);


              // give the geom's vertices a random color, to be displayed
             // applyVertexColors(geom, color.setHex(Math.random() * 0xffffff));

              geom.applyMatrix(matrix);
              object = new THREE.Mesh(geom, new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff,
                vertexColors: THREE.VertexColors
              }));

              object.castShadow = true;
              object.receiveShadow = true;


              scene.add( object );
              objects.push( object );
           }
          })();

          plane = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( 2000, 2000, 8, 8 ),
            new THREE.MeshBasicMaterial( { visible: false } )
          );
          scene.add( plane );



          raycaster  = new THREE.Raycaster();

          renderer = new THREE.WebGLRenderer({antialias: true});
          renderer.setClearColor(0xf0f0f0);
          renderer.setPixelRatio(window.devicePixelRatio);
          renderer.setSize(contW, contH);
          renderer.sortObjects = false;

          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFShadowMap;


          stats = new Stats();

          stats.domElement.style.zIndex = 11;
          stats.domElement.style.position = 'absolute';


          container.appendChild(stats.domElement);
          container.appendChild(renderer.domElement);

          renderer.domElement.addEventListener('mousemove', onMouseMove2, false);
          renderer.domElement.addEventListener( 'mousedown', onMouseDown, false );
          renderer.domElement.addEventListener( 'mouseup', onMouseUp, false );
          renderer.domElement.addEventListener( 'click', selectMe, false );




          window.addEventListener( 'resize', scope.onWindowResize, false );
        }

        //

        function selectMe(event)
        {
          if(event.altKey) {
            event.preventDefault();

            raycaster.setFromCamera( mouse, camera );
            intersects = raycaster.intersectObjects( objects );
            var origin = intersects[0].object;

            if ( intersects.length > 0 ) {

              intersects = raycaster.intersectObject( plane );

              if (intersects.length > 0 ) {
              intersects[0].point.sub( plane.position );
              }

              var po = origin.position;
              intersects = raycaster.intersectObjects( objects );

              var light1 = new THREE.PointLight( intersects[0].object.material.color.getHex(), 20, 0 );
              light1.add( new THREE.Mesh( intersects[0].object.geometry, new THREE.MeshLambertMaterial( { color: intersects[0].object.material.color.getHex() } ) ) );

              light1.position.copy( po );
              light1.lookAt(camera.position );
              scene.add(light1);
              lights.push(light1);
            }

          }
        }

        function onMouseMove2(e) {

          e.preventDefault();
          var de = (event.pageX - container.offsetLeft) ;
          var fa = (event.pageY - container.offsetTop) ;
          mouse.x = ( de/ contW) * 2 - 1;
          mouse.y = - (fa/ contH) * 2 + 1 ;


          raycaster.setFromCamera( mouse, camera );

          // 옮기는 도중
          if ( SELECTED ) {
            intersects = raycaster.intersectObject( plane );

            //뭔가 잡혔다
            if ( intersects.length > 0 ) {


              SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
            }
          }
          else {
            // 옭기는 중이 아니면
            intersects = raycaster.intersectObjects( objects );



            if ( intersects.length > 0 ) {


              if ( INTERSECTED !== intersects[0].object ) {

                if ( INTERSECTED ) {

                  INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
                }
                // 일단 가장 가까운거로 초기화
                INTERSECTED = intersects[ 0 ].object;
                INTERSECTED.currentHex = {};
                INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

                //플레인에 포지션 카피
                plane.position.copy( INTERSECTED.position );
                plane.lookAt( camera.position );
              }

              container.style.cursor = 'pointer';
            } else {

              if ( INTERSECTED ) {
                INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
              }

              INTERSECTED = null;
              container.style.cursor = 'auto';

            }
          }


        }


        function onMouseDown( e ) {

          e.preventDefault();

          raycaster.setFromCamera( mouse, camera );
          intersects = raycaster.intersectObjects( objects );

          if ( intersects.length > 0 ) {

            controls.enabled = false;
            SELECTED = intersects[ 0 ].object;

            intersects = raycaster.intersectObject( plane );
            if (intersects.length > 0 ) {
              offset.copy( intersects[ 0 ].point ).sub( plane.position );
            }

            container.style.cursor = 'move';
          }

        }

        function onMouseUp( e ) {

          e.preventDefault();

          controls.enabled = true;

          if ( INTERSECTED ) {

            plane.position.copy( INTERSECTED.position );

            SELECTED = null;

          }

          container.style.cursor = 'auto';

        }


        function onMousedoubleClick(e) {

          e.preventDefault();


          raycaster.setFromCamera( mouse, camera );
          intersects = raycaster.intersectObjects( objects );

          if ( intersects.length > 0 ) {


            SELECTED = intersects[ 0 ].object;

            console.log('AHAHAH');

            var sphere = new THREE.SphereGeometry( 0.5, 16, 8 );

            var light1 = new THREE.PointLight( 0xff0040, 2, 50 );
            light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: SELECTED.material.color.getHex() } ) ) );
            scene.add( light1 );
            lights.push(light1);
          }

          //var sphere = new THREE.SphereGeometry( 0.5, 16, 8 );
          //
          //var light1 = new THREE.PointLight( 0xff0040, 2, 50 );
          //light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xff0040 } ) ) );
          //scene.add( light1 );
          //
          //var light2 = new THREE.PointLight( 0x0040ff, 2, 50 );
          //light2.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x0040ff } ) ) );
          //scene.add( light2 );
          //
          //var light3 = new THREE.PointLight( 0x80ff80, 2, 50 );
          //light3.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x80ff80 } ) ) );
          //scene.add( light3 );
          //
          //var light4 = new THREE.PointLight( 0xffaa00, 2, 50 );
          //light4.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0xffaa00 } ) ) );
          //scene.add( light4 );

        }

        function animate() {

          requestAnimationFrame(scope.animate);

          scope.render();
          stats.update();

        }


        function render() {

          controls.update();


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
