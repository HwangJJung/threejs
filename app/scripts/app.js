'use strict';

/**
 * @ngdoc overview
 * @name threeApp
 * @description
 * # threeApp
 *
 * Main module of the application.
 */
angular
  .module('threeApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/webgl.html',
        controller: 'WebglDemoCtrl',
        controllerAs: 'webglDemo'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/webgl', {
        templateUrl: 'views/webgl.html',
        controller: 'WebglDemoCtrl',
        controllerAs: 'webglDemo'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
