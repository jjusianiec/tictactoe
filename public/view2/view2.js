'use strict';

angular.module('myApp.view2', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/view2', {
      templateUrl: 'view2/view2.html',
      controller: 'View2Ctrl'
    });
  }])

  .controller('View2Ctrl', ['$scope', function ($scope) {

    $scope.endGame = false;

    var canvas = new fabric.Canvas('canvas');
    canvas.selectable = false;
    var socket = io();
    var room = null;

    $scope.replay = function () {
      location.reload();
    };

    socket.on('connect', function () {
      socket.emit('auth', {
        userId: Number(localStorage.getItem('userId')),
        name: localStorage.getItem('name')
      });
    });

    socket.on('id', function (userId) {
      localStorage.setItem('userId', userId);
    });

    socket.on('message', function (data) {
      if (room === null && data.room) {
        room = data.room;
      }
      if (data.message) {
        toastr.info(data.message);
      }
      if (data.room) {
        drawMoves(data.room);
        room = data.room;
      }
    });

    socket.on('finish', function (data) {
      drawMoves(data.room);
      room = data.room;
      toastr.info('End of game!');
      $scope.$apply(function () {
        $scope.endGame = true;
      });
    });

    function drawMoves(updatedRoom) {
      for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
          let field = updatedRoom.board[i][j];
          if (field === 'x') {
            addCross(i, j);
          } else if (field === 'o') {
            addCircle(i, j);
          }

        }
      }
    }

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
      if ($scope.endGame) {
        toastr.info('End of game, click replay');
        return;
      }
      let i = evt.target.get('i');
      let j = evt.target.get('j');
      socket.emit('move', {
        userId: Number(localStorage.getItem('userId')),
        x: i,
        y: j
      });
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