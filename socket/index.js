const randomstring = require('randomstring');
const endGameService = require('../service/EndGameService');

class tictactoe {
  static use(io) {
    let room = null;
    let rooms = [];

    io.on('connection', (socket) => {
      socket.on('auth', (data) => {
        let userId = data.userId;
        if (!userId) {
          userId = createUser(socket);
        }
        const foundRoom = rooms.find(val => val.users.find(u => u.id === userId));
        if (foundRoom && foundRoom.counter < 8) {
          reconnectToRoom(socket, foundRoom);
        } else {
          room = joinRoomOrCreate(room, userId, data.name);
          connectToRoom(socket);
        }
      });

      socket.on('move', (data) => {
        const foundRoom = rooms.find(val => val.users.find(u => u.id === data.userId));
        if (!foundRoom) {
          socket.emit('message', { message: 'Waiting for second player' });
          return;
        }
        if (endGameService.shouldEndGame(foundRoom)) {
          io.sockets.to(foundRoom.name).emit('finish', { room: foundRoom });
          removeRoom(foundRoom);
        } else if (shouldWait(foundRoom, data)) {
          socket.emit('message', { message: `It's not your turn`, room: foundRoom });
        } else if (foundRoom.board[data.x][data.y] !== '-') {
          socket.emit('message', { message: `You can't make this move`, room: foundRoom });
        } else {
          makeMove(foundRoom, data.x, data.y, io);
        }
      });

      function createUser(socket) {
        let id = Math.floor(Math.random() * 10000000);
        socket.emit('id', id);
        return id;
      }


      function makeMove(foundRoom, x, y, io) {
        foundRoom.board[x][y] = getSign(foundRoom.counter % 2);
        foundRoom.counter += 1;
        if (endGameService.shouldEndGame(foundRoom)) {
          io.sockets.to(foundRoom.name).emit('finish', { room: foundRoom });
          removeRoom(foundRoom);
        } else {
          io.sockets.to(foundRoom.name).emit('message', { room: foundRoom });
        }
      }

      function connectToRoom(socket) {
        socket.join(room.name, () => {
          io.sockets.to(room.name).emit('message', { message: 'User entered', room });
          if (room.users.length >= 2) {
            rooms.push(room);
            room = null;
          }
        });
      }

      function removeRoom(toDelete) {
        rooms = rooms.filter(item => item.name !== toDelete.name);
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
          io.sockets.to(foundRoom.name).emit('message', { message: 'Reconnected!', room: foundRoom });
        });
      }

      function shouldWait(foundRoom, data) {
        let userObj = foundRoom.users.find(u => u.id === data.userId);
        return foundRoom.counter % 2 !== userObj.turn;
      }

      function joinRoomOrCreate(room, userId, name) {
        let toReturn = room;
        if (room === null) {
          toReturn = {
            users: [{ id: userId, name: name, turn: 0 }],
            name: randomstring.generate(10),
            counter: 0,
            board: [
              ['-', '-', '-'],
              ['-', '-', '-'],
              ['-', '-', '-'],
            ],
          };
        } else {
          toReturn.users.push({ id: userId, name: name, turn: 1 });
        }
        return toReturn;
      }
    });
  }


}

module.exports = tictactoe;
