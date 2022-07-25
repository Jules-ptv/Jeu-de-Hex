let isGameLive;
let currentId;

let allGamesRef = firebase.database().ref(`games`);
let gameRef;
let player;

let size = 9;
let playerTurn = 2;
let moveCount = 0;
//Declares the board
let board = Array(size);
for (let i = 0; i < size; i++) {
  board[i] = Array(size).fill(0);
}

//Helper functions
function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function startGame(gameId, playerTurn) {
  window.location.href =
    "/game.html" + "?gameId=" + gameId + "&playerTurn=" + playerTurn;
}

window.onload = () => {
	//On load, check if the room that we're trying to reach exists or not.
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	currentId = urlParams.get("gameId");
	player = urlParams.get("playerTurn");

	gameRef = firebase.database().ref(`games/${currentId}`);
	gameRef.onDisconnect().update({ "status": "disconnected" });
	

	let gameExists;

	allGamesRef.once("value").then(function (snapshot) {
		gameExists = snapshot.child(`/${currentId}`).exists();

		//If the game exists...
		if (gameExists) {
		isGameLive = true;
		console.log("This game exists!");
		createBoard();
		if (player == 1) {
			updateMoves();
		}
		} else {
		console.log("This game does not work!");
		}
	});
};

allGamesRef.on("child_changed", (snapshot) => {
  let changedElements = snapshot.val();

  if(changedElements.id == currentId){
    if (changedElements.status == "disconnected") {
      console.log("Your opponent left the game. You Won.");
      sleep(3000);
      gameRef.remove();
    } else {
      console.log("By Firebase, the new player turn is", changedElements.turn);
      playerTurn = changedElements.turn;
  
      board = changedElements.board;
      //sleep(500);
      updateBoard();
    }
  }

  
});











if (document.title == "Jeu de Hex") {
  function createBoard() {
    //Create board
    let marginUnit = getComputedStyle(
      document.getElementById("game--canvas")
    ).getPropertyValue("--s");

    for (i = 0; i < size; i++) {
      let g = document.createElement("div");
      g.setAttribute("id", "row" + (i + 1));

      g.setAttribute(
        "style",
        "margin-left:" + ("calc(" + marginUnit + "*" + i + "*(0.5))")
      );

      document.getElementById("board").appendChild(g);

      for (j = 0; j < size; j++) {
        let x = document.createElement("div");
        x.setAttribute("row", i + 1);
        x.setAttribute("column", j + 1);
        x.setAttribute("id", "row" + (i + 1) + "column" + (j + 1));
        x.setAttribute("class", "hexagon");
        x.setAttribute(
          "onclick",
          'checkMove(this.getAttribute("row"),this.getAttribute("column"))'
        );

        let anotherDiv = document.createElement("div");
        anotherDiv.setAttribute("class", "anotherDiv");

        let iconDiv = document.createElement("div");
        iconDiv.setAttribute("class", "iconDiv");
        anotherDiv.appendChild(iconDiv);
        x.appendChild(anotherDiv);

        document.getElementById("row" + (i + 1)).appendChild(x);
      }
    }
  }

  let infoText = document.getElementById("infoText");
  let helpText = document.getElementById("helpText");

  function updateMoves() {
    if (isGameLive) {
      switch (playerTurn) {
        case 1:
          infoText.innerHTML = "It's player 2's turn!";
          //Update the player's turn in database
          gameRef.update({ turn: 2 });
          break;

        case 2:
          infoText.innerHTML = "It's player 1's turn!";
          //Update the player's turn in database
          gameRef.update({ turn: 1 });
          break;
      }
    }
  }

  function checkMove(x, y) {
    if (!isGameLive) {
      alert("You must start a game to play!");
      return;
    }
    x = parseInt(x);
    y = parseInt(y);
    if (board[x - 1][y - 1] == 0) {
      if (player == playerTurn) {
        board[x - 1][y - 1] = playerTurn;
        //Update the board in databse
        gameRef.update({ board: board });
        updateMoves();
      } else {
        console.log("Not your turn!", player, playerTurn);
      }
    } else {
      console.log("The cell is already occupied by a player! ");
    }
  }

  function addPiece(x, y, playerParam) {
    moveCount++;
    helpText.innerHTML = moveCount;

    x = parseInt(x);
    y = parseInt(y);
    playerParam = parseInt(playerParam);

    goodHexagon = document.getElementById("row" + x + "column" + y).children[0]
      .children[0];

    if (playerParam == 1) {
      goodHexagon.style.background = "white";
      goodHexagon.style.borderColor = "black";
    } else if (playerParam == 2) {
      goodHexagon.style.background = "black";
      goodHexagon.style.borderColor = "black";
    } else if (playerParam == 0) {
      let cellColor = getComputedStyle(
        document.getElementById("game--canvas")
      ).getPropertyValue("--cell-color");
      goodHexagon.style.background = cellColor;
      goodHexagon.style.borderColor = cellColor;
    }

    checkVictory();
  }

  function updateBoard() {
    for (let x = 1; x <= size; x++) {
      for (let y = 1; y <= size; y++) {
        addPiece(x, y, board[x - 1][y - 1]);
      }
    }
  }

  function checkVictory() {
    //------------ Check if player 1 (white) wins : -----------------

    //First you have to check whether or not there is a white icon at the end and the start of the board.

    let step1 = false;
    let x1 = [];
    let step2 = false;

    //Just to limit the amount of calculation to find a valid path
    for (let item = 0; item < size; item++) {
      if (board[0][item] == 1) {
        step1 = true;
        x1.push(item);
      }
      if (board[size - 1][item] == 1) {
        step2 = true;
      }
    }

    if (step1 && step2) {
      for (let possibleStart = 0; possibleStart < x1.length; possibleStart++) {
        let result = exploreBoard(x1[possibleStart], 0, [], 1, board);
        if (result) {
          isGameLive = false;
          alert("Player 1 won !");
          infoText.innerHTML = "Player 1 won !";
        }
      }
    }

    //------------ Check if player 2 (black) wins : -----------------

    //First you have to check whether or not there is a white icon at the end and the start of the board.

    let step21 = false;
    let x21 = [];
    let step22 = false;

    //Just to limit the amount of calculation to find a valid path
    for (let item = 0; item < size; item++) {
      if (board[item][0] == 2) {
        step21 = true;
        x21.push(item);
      }
      if (board[item][size - 1] == 2) {
        step22 = true;
      }
    }

    if (step21 && step22) {
      for (let possibleStart = 0; possibleStart < x21.length; possibleStart++) {
        let result = exploreBoard(0, x21[possibleStart], [], 2, board);
        if (result) {
          isGameLive = false;
          alert("Player 2 won !");
          infoText.innerHTML = "Player 2 won !";
        }
      }
    }
  }

  //Just another function to check the victory
  function exploreBoard(x, y, olds, player, board) {
    //Break condition for player 1
    if (y == size - 1 && player == 1) {
      return true;
    }

    //Break condition for player 2
    if (x == size - 1 && player == 2) {
      return true;
    }

    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [1, -1],
      [0, 1],
      [-1, 1],
    ];

    let possiblePaths = [];

    //Look for possible solutions in every 6 directions (top, bottom, etc.)
    for (i = 0; i < directions.length; i++) {
      try {
        //Check if the possible cell is the same as our color. but!! It also has to be
        //different that the cell that we come from !
        let isOldCell = false;
        for (let temp = 0; temp < olds.length; temp++) {
          if (
            olds[temp][0] == x + directions[i][0] &&
            olds[temp][1] == y + directions[i][1]
          ) {
            isOldCell = true;
            break;
          }
        }

        if (
          board[y + directions[i][1]][x + directions[i][0]] == player &&
          !isOldCell
        ) {
          //If it is true, then add this cell to the possible paths!
          possiblePaths.push([x + directions[i][0], y + directions[i][1]]);
        }
      } catch (error) {
        //(we don't care about errors)
      }
    }

    if (possiblePaths.length == 0) {
      return;
    }

    //Check if there is, among all the possible paths, a good one.
    final = false;
    olds.push([x, y]);

    for (let item = 0; item < possiblePaths.length; item++) {
      let result = exploreBoard(
        possiblePaths[item][0],
        possiblePaths[item][1],
        olds,
        player,
        board
      );
      if (result == true) {
        final = true;
        return true;
      }
    }

    return final;
  }

  if (document.readyState == "complete") {
    document.body.onkeyup = function (e) {
      if (
        e.key == " " ||
        e.code == "Space" ||
        (e.keyCode == 32 && document.title == "Jeu de Hex")
      ) {
        let possibilities = [];
        for (let i = 0; i < size; i++) {
          for (let j = 0; j < size; j++) {
            if (board[i][j] == 0) {
              possibilities.push([i, j]);
            }
          }
        }
        let randomElement =
          possibilities[Math.floor(Math.random() * possibilities.length)];

        checkMove(
          parseInt(randomElement[0]) + 1,
          parseInt(randomElement[1]) + 1
        );
      }
    };
  }
}
