/**
 * Created by itmnext13 on 2016. 1. 13..
 */
'use strict';

angular.module('threeApp')
  .directive('ngTrackBall', function () {
    return {
      restrict: 'A',
      scope: {
        'width': '=',
        'height': '=',
        'scale': '=',
        'fillcontainer': '=',
        'materialType': '='
      },
      link: function postLink(scope, element, attrs, controller) {

      }
    };
  });
