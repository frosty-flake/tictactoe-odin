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

    // function to play in console
    const printBoard = () => {
        for (let row of board) {
            const consoleBoardRow = [];
            for (let cell of row) {
            consoleBoardRow.push(cell.getCellToken()); 
            };
            console.log(consoleBoardRow);
        };
    }

    const checkValidCell = (position) => {
        return !(position[0] > 3 || position[0] < 1 || position[1] > 3 || position[1] < 1);
    }

    const checkEmptyCell = (position) => {
        return (checkValidCell(position) && (getCellTokenByPosition(position) === "_"));
    }

    const getCellTokenByPosition = (position) => {
        if (!checkValidCell(position)) return false;
        return board[position[0] - 1][position[1] - 1].getCellToken();
    }

    const placeTokenOnBoard = (position, player) => {
        if (checkEmptyCell(position)) board[position[0] - 1][position[1] - 1].placeToken(player);
    }

    const refreshBoard = () => {
        for (let row of board) {
            for (let cell of row) {
                cell.placeToken("_");
            }
        }
    }

    return {getBoard, printBoard, placeTokenOnBoard, 
        checkEmptyCell, checkValidCell, getCellTokenByPosition,
        refreshBoard};
})();

function BoardCell() {
    let cellToken = "_";
    
    const placeToken = (player) => {
        cellToken = player;
    }

    const getCellToken = () => cellToken;

    return {placeToken, getCellToken};
};

function createPlayer(name, turn) {
    const token = turn === 1 ? "X" : "O";

    return {name, token};
}

const game = (function(
    playerOne = createPlayer("Player One", 1), 
    playerTwo = createPlayer("Player Two", 2)) {
    
    const board = Gameboard;

    activePlayer = playerOne;

    const switchActivePlayer = () => {
        activePlayer = (activePlayer === playerOne) ? playerTwo : playerOne;
    };

    // function to play in console
    const printNextRound = () => {
        board.printBoard();
        console.log(`It is ${activePlayer.name}'s turn.`)
    }

    const playRound =(position) => {
        if (!board.checkEmptyCell(position)) {
            console.log(`Cell (${position[0]}, ${position[1]}) is not valid!`);
            return;
        }

        board.placeTokenOnBoard(position, activePlayer.token);
        console.log(`${activePlayer.name} placed ${activePlayer.token} at (${position[0]}, ${position[1]})!`)
        board.printBoard();

        // Check if placed piece gives a win
        const listOfPositions = [[1, 1], [1, 2], [1, 3],
                                 [2, 1], [2, 2], [2, 3],
                                 [3, 1], [3, 2], [3, 3]];
        const [c1, c2, c3, c4, c5, c6, c7, c8, c9] = listOfPositions;
        const listOfPossibleWins = [[c1, c2, c3], [c4, c5, c6], [c7, c8, c9],
                                    [c1, c4, c7], [c2, c5, c8], [c3, c6, c9],
                                    [c1, c5, c9], [c3, c5, c7]];
        let activeToken = activePlayer.token;
        for (let row of listOfPossibleWins) {
            if ((board.getCellTokenByPosition(row[0]) === activeToken &&
                    board.getCellTokenByPosition(row[1]) === activeToken &&
                    board.getCellTokenByPosition(row[2]) === activeToken)) {
                        console.log(`${activePlayer.name} wins!`);
                        board.refreshBoard();
                        return;
                    }
            }

        // Check if it is a draw (if board is full)
        let checksum = 0;

        for (let pos of listOfPositions) {
            if (board.checkEmptyCell(pos)) break;
            checksum += 1;
        }
        
        if (checksum === 9) {
            console.log(`It is a draw!`);
            board.refreshBoard();
            return;
        }


        switchActivePlayer();
        console.log(`It is ${activePlayer.name}'s turn.`)
    };

    const getActivePlayer = () => activePlayer;

    printNextRound();

    return Object.assign({}, board, {playRound, getActivePlayer});
})();

const ui = (function() {
    const playerTurnTracker = document.querySelector("#turn");
    const boardDiv = document.querySelector("#board");
    const logDiv = document.querySelector("log");

    const updateScreen = () => {

        boardDiv.textContent = "";

        const currentBoard = game.getBoard();
        const currentPlayer = game.getActivePlayer();
        for (let row = 1; row < 4; row++) {
            for (let col = 1; col < 4; col++) {
                const cell = currentBoard[row - 1][col - 1];
                const cellDiv = document.createElement("button");
                cellDiv.classList.add("cell");
                cellDiv.dataset.row = row;
                cellDiv.dataset.col = col;
                cellDiv.textContent = cell.getCellToken();
                cellDiv.addEventListener("click", placeTokenOnClick);
                boardDiv.appendChild(cellDiv);
            }
        }

        playerTurnTracker.textContent = `${currentPlayer.name}'s turn!`;
    };

    const placeTokenOnClick = (e) => {
        const row = e.target.dataset.row;
        const col = e.target.dataset.col;

        game.playRound([row, col]);
        updateScreen();
    };

    updateScreen();

    return{updateScreen};
})();