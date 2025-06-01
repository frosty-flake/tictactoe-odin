const Gameboard = (function() {
    const [row, col] = [3, 3];
    const board = [];

    for (let i = 0; i < row; i++) {
        const boardRow = [];
        for (let i = 0; i < col; i++) {
            boardRow.push(BoardCell());
        };
        board.push(boardRow);
    }

    const getBoard = () => board;

    const printBoard = () => {
        let consoleBoard = [];
        for (let row of board) {
            const consoleBoardRow = [];
            for (let cell of row) {
            consoleBoardRow.push(cell.getCellToken()); 
            };
            console.log(consoleBoardRow);
        };
    }

    const placeTokenOnBoard = (position, player) => {
        let cell = board[position[0]][position[1]];
        if (cell.getCellToken() === "_") {
            cell.placeToken(player);
        }
    }

    return {getBoard, printBoard, placeTokenOnBoard};
})();

function BoardCell() {

    let cellToken = "_";
    
    const placeToken = (player) => {
        cellToken = player;
    }

    const getCellToken = () => cellToken;

    return {placeToken, getCellToken};
};
