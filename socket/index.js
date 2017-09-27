const randomstring = require('randomstring');

class tictactoe {
  static use(io) {
    let counter = 0;
    let room = null;
    let rooms = [];

    io.on('connection', (socket) => {
      socket.on('auth', (data) => {
        if (!data) {
          return;
        }
        let userId = data.userId;
        if (!userId) {
          userId = counter++;
          socket.emit('id', userId);
        }
        const foundRoom = rooms.find(val => val.users.indexOf(userId) > -1);
        if (foundRoom) {
          reconnectToRoom(socket, foundRoom);
        } else {
          room = joinOrCreateRoom(room, userId);
          socket.join(room.name, () => {
            console.log(room.name);
            io.sockets.to(room.name).emit('message', { message: 'User entered', room });
            if (room.users.length >= 2) {
              rooms.push(room);
              room = null;
            }
          });
        }
      });

      socket.on('move', (data) => {
        const foundRoom = rooms.find(val => val.users.indexOf(data.userId) > -1);

        if (foundRoom.turn % 2 !== data.userId) {
          socket.emit('message', { message: 'Wait' });
        } else if (foundRoom.board[data.x][data.y] !== '-') {
          socket.emit('message', { message: 'Forbidden' });
        } else {
          makeMove(foundRoom, data.x, data.y, io);
        }
      });

      function makeMove(foundRoom, x, y, io) {
        foundRoom.board[x][y] = getSign(foundRoom.turn % 2);
        foundRoom.turn += 1;
        if (foundRoom.turn === 8) {
          io.sockets.to(foundRoom.name).emit('finish', foundRoom);
          removeRoom(foundRoom);
        } else {
          io.sockets.to(foundRoom.name).emit('message', foundRoom);
        }
      }

      function removeRoom(toDelete) {
        rooms = rooms.filter(item => item === toDelete);
      }

      function getSign(number) {
        if (number === 1) {
          return 'x';
        } else {
          return 'o';
        }
      }

      function reconnectToRoom(socket, foundRoom) {
        socket.join(foundRoom.name, () => {
          io.sockets.to(foundRoom.name).emit({ message: 'Reconnected!', foundRoom });
        });
      }

      function joinOrCreateRoom(room, userId) {
        let toReturn = room;
        if (room === null) {
          toReturn = {
            users: [userId],
            name: randomstring.generate(10),
            turn: userId,
            counter: 0,
            board: [
              ['-', '-', '-'],
              ['-', '-', '-'],
              ['-', '-', '-'],
            ],
          };
        } else {
          toReturn.users.push(userId);
        }
        return toReturn;
      }
    });
  }
}

module.exports = tictactoe;
