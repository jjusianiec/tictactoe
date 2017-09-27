const Loki = require('lokijs');
const randomstring = require('randomstring');
const db = new Loki('game.json');
const game = db.addCollection('game');

function findByUserId(userId) {
  return game.where((val) => {
    return val.users.contains(userId);
  });
}


function createNewRoom(userId) {
  return game.insert({
    users: [userId],
    name: randomstring.generate(10),
    turn: userId,
    counter: 0,
    board: [
      ['-', '-', '-'],
      ['-', '-', '-'],
      ['-', '-', '-'],
    ],
  });
}

module.exports = {
  game,
  findByUserId,
  createNewRoom,
};
