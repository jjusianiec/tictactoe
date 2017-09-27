'use strict';

angular.module('myApp.view2', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/view2', {
      templateUrl: 'view2/view2.html',
      controller: 'View2Ctrl'
    });
  }])

  .controller('View2Ctrl', ['$scope', function ($scope) {

    var canvas = new fabric.Canvas('canvas');

    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var rect = new fabric.Rect({
          left: 500 / 3 * i,
          top: 500 / 3 * j,
          width: 500 / 3,
          height: 500 / 3,
          opacity: 0.2,
          stroke: 'black',
          i: i,
          j: j,
          selectable: false
        });
        canvas.add(rect);
      }
    }

    let count = 0;

    canvas.on('mouse:up', function (evt) {
      let i = evt.target.get('i');
      let j = evt.target.get('j');
      if(count++ % 2 === 0){
        addCircle(i, j);
      } else {
        addCross(i, j);
      }
      console.log('Wybrano klocek: ' + i + ' ' + j);
    });


    function addCross(i, j) {
      fabric.Image.fromURL('/img/cross.png', function (img) {
        img.scale(0.425);
        img.i = i;
        img.j = j;
        img.left = 500 / 3 * i + 20;
        img.top = 500 / 3 * j + 20;
        img.selectable = false;
        canvas.add(img);
      });
    }

    function addCircle(i, j) {
      fabric.Image.fromURL('/img/circle.png', function (img) {
        img.scale(0.25);
        img.i = i;
        img.j = j;
        img.left = 500 / 3 * i + 20;
        img.top = 500 / 3 * j + 20;
        img.selectable = false;
        canvas.add(img);
      });
    }

  }]);