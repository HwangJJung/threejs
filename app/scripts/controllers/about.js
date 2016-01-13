'use strict';

/**
 * @ngdoc function
 * @name threeApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the threeApp
 */
angular.module('threeApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.canvasWidth = 400;
    $scope.canvasHeight = 400;
    $scope.dofillcontainer = true;
    $scope.scale = 1;
    $scope.materialType = 'lambert';
  });
