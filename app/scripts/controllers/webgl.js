/**
 * Created by itmnext13 on 2016. 1. 13..
 */
'use strict';

/**
 * @ngdoc function
 * @name threeApp.controller:WebglCtrl
 * @description
 * # WebglCtrl
 * Controller of the threeApp
 */
angular.module('threeApp')
  .controller('WebglDemoCtrl', function ($scope) {
    $scope.width = 400;
    $scope.height = 400;
    $scope.fillcontainer = true;
    $scope.scale = 1;
    $scope.materialType = 'lambert';

    this.getWidth = function () {};
    this.getHeight = function () {};
  });
