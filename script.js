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
        return (checkValidCell(position) && (getCellTokenByPosition(position) === ""));
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
                cell.placeToken("");
            }
        }
    }

    return {getBoard, printBoard, placeTokenOnBoard, 
        checkEmptyCell, checkValidCell, getCellTokenByPosition,
        refreshBoard};
})();

function BoardCell() {
    let cellToken = "";
    
    const placeToken = (player) => {
        cellToken = player;
    }

    const getCellToken = () => cellToken;

    return {placeToken, getCellToken};
};

function createPlayer(name, turn) {
    const token = turn === 1 ? "X" : "O";

    let score = 0;

    const getScore = () => score;
    const upScore = () => score++;

    return {name, token, getScore, upScore};
}

const createGame = (playerOne, 
                    playerTwo) => {
    
    const board = Gameboard;

    let activePlayer = playerOne;

    const switchActivePlayer = () => {
        activePlayer = (activePlayer === playerOne) ? playerTwo : playerOne;
    };

    // function to play in console
    const printNextRound = () => {
        board.printBoard();
        console.log(`It is ${activePlayer.name}'s turn.`)
    }

    const getGameState = ()=> {
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
                    return "win";
                }
        }

    // Check if it is a draw (if board is full)
    let checksum = 0;

    for (let pos of listOfPositions) {
        if (board.checkEmptyCell(pos)) break;
        checksum += 1;
    }
    
    if (checksum === 9) return "draw";

    return "continue";
    };

    const playRound =(position) => {
        if (!board.checkEmptyCell(position)) {
            console.log(`Cell (${position[0]}, ${position[1]}) is not valid!`);
            return;
        }

        board.placeTokenOnBoard(position, activePlayer.token);
        console.log(`${activePlayer.name} placed ${activePlayer.token} at (${position[0]}, ${position[1]})!`)
        board.printBoard();

        switch (getGameState()) {
            case "win":
                console.log(`${activePlayer.name} wins!`);
                return "win";
            case "draw":
                console.log(`It is a draw!`);
                return "draw";
        }

        switchActivePlayer();
        console.log(`It is ${activePlayer.name}'s turn.`)
    };

    const getActivePlayer = () => activePlayer;

    return Object.assign({}, board, {playRound, getActivePlayer});
};

let game = createGame(createPlayer("Player One", 1), createPlayer("Player Two", 2));

const ui = (function() {
    const playerTurnTracker = document.querySelector("#turn");
    const boardDiv = document.querySelector("#board");
    const logDiv = document.querySelector("#log");

    let playerOne = createPlayer("Player One", 1);
    let playerTwo = createPlayer("Player Two", 2);

    const updateBoard = () => {
        boardDiv.textContent = "";

        const currentBoard = game.getBoard();

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
    }

    const updateTracker = () => {
        const currentPlayer = game.getActivePlayer();
        playerTurnTracker.textContent = `${currentPlayer.name}'s turn!`;
    }

    const updateScreen = () => {
        updateBoard();
        updateTracker();
    };

    const placeTokenOnClick = (e) => {
        const row = e.target.dataset.row;
        const col = e.target.dataset.col;

        let gameResult = game.playRound([row, col]);

        updateScreen();

        const currentPlayer = game.getActivePlayer();
        const boardButtons = boardDiv.querySelectorAll(".cell");

        if (gameResult === "win") {
            logDiv.textContent = `${currentPlayer.name} wins!`;
            boardButtons.forEach((button) => {
                button.disabled = true;
            })
            return;
        } else if (gameResult === "draw") {
            logDiv.textContent = `It's a draw...`
            boardButtons.forEach((button) => {
                button.disabled = true;
            })
            return;
        }
    };

    const startGame = () => {
        game.refreshBoard();
        game = createGame(playerOne, playerTwo);
        updateScreen();
    }

    const startButton = document.querySelector(".start");
    startButton.addEventListener("click", startGame);

    const editName = (e) => {
        const editButton = e.target;
        editButton.disabled = true;
        const playerDiv = e.target.parentElement;
        const formDiv = document.createElement("form");
        const formLabel = document.createElement("label");
        const formInput = document.createElement("input");
        const formDescription = document.createElement("p");
        const formSubmit = document.createElement("button");

        formDiv.classList.add("name-form");
        formLabel.classList.add("form-label");

        formDescription.textContent = "10 characters or less"
        
        formLabel.textContent = "Name:";
        formLabel.setAttribute("for", "name");

        formInput.id = "name";
        formInput.setAttribute("maxlength", "10");
        formInput.setAttribute("minlength", "1");

        formSubmit.textContent = "Submit";

        const submitName = (e) => {
            if (formInput.value.length === 0) return;
            e.preventDefault();
            let playerToEdit = playerDiv.id;
            if (playerToEdit === "player-one") {
                playerOne = createPlayer(formInput.value, 1);
            } else {
                playerTwo = createPlayer(formInput.value, 2);
            }
            const playerNameDiv = playerDiv.querySelector(".player-name");
            playerNameDiv.textContent = formInput.value;
            editButton.disabled = false;
            playerDiv.removeChild(playerDiv.lastChild);
        }   

        formSubmit.addEventListener("click", submitName);

        formDiv.appendChild(formLabel); 
        formLabel.appendChild(formInput);
        formDiv.appendChild(formDescription);
        formDiv.appendChild(formSubmit);
        playerDiv.appendChild(formDiv);
    }

    const editButtons = document.querySelectorAll(".edit-name");
    editButtons.forEach((button) => {
        button.addEventListener("click", editName);
    });

    updateBoard();
    const boardButtons = boardDiv.querySelectorAll(".cell");
    boardButtons.forEach((button) => {
        button.disabled = true;
    })
})();