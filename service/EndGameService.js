let isCorsswise = function (board) {
  return board[0][2] === board[1][1] &&
    board[1][1] === board[2][0] &&
    board[2][0] !== '-';
};

let isCrosswiseSecond = function (board) {
  return board[0][0] === board[1][1] &&
    board[1][1] === board[2][2] &&
    board[0][0] !== '-';
};

let isVertically = function (board, i) {
  return board[i][0] === board[i][1] &&
    board[i][1] === board[i][2] &&
    board[i][0] !== '-';
};

let isHorizontally = function (board, i) {
  return board[0][i] === board[1][i] &&
    board[1][i] === board[2][i] &&
    board[0][i] !== '-';
};

function shouldEndGame(foundRoom) {
  let flag = false;
  for (var i = 0; i < 3; i++) {
    flag |= (isHorizontally(foundRoom.board, i));
  }
  for (var i = 0; i < 3; i++) {
    flag |= (isVertically(foundRoom.board, i));
  }
  flag |= (isCrosswiseSecond(foundRoom.board));
  flag |= (isCorsswise(foundRoom.board));
  return foundRoom.counter >= 9 || flag;
}

module.exports = { shouldEndGame };