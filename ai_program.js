const size = 9;
const AI_TURN = 2;

let moveCount = 0;

let turn=1;

let isGameOver = false;

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



window.onload = () => {
	
	startGame();

};


function startGame(){
	isGameOver = false;

	//Empty the variable board
	board = Array(size);
	for (let i = 0; i < size; i++) {
	board[i] = Array(size).fill(0);
	}

	//Reset moveCount
	moveCount=0;
	helpText.innerHTML = moveCount;

	console.log("Let's the game start!");


	createBoard();

	
	getShortestPath(new Hex(1,1),new Hex(3,3),board, 1);
}


function createBoard() {

	//Empty first the board
	document.getElementById('board').innerHTML = "empty.";


	//Create board
	let marginUnit = getComputedStyle(
		document.getElementById("game--canvas")
	).getPropertyValue("--s");

	for (i = 0; i < size; i++) {
		let g = document.createElement("div");
		g.setAttribute("id", "row" + i);

		g.setAttribute(
		"style",
		"margin-left:" + ("calc(" + marginUnit + "*" + i + "*(0.5))")
		);

		document.getElementById("board").appendChild(g);

		for (j = 0; j < size; j++) {
			let x = document.createElement("div");
			x.setAttribute("row", i);
			x.setAttribute("column", j);
			x.setAttribute("id", "row" + (i) + "column" + (j));
			x.setAttribute("class", "hexagon");
			x.setAttribute(
				"onclick",
				'checkMove(this.getAttribute("row"),this.getAttribute("column"),1);'
			);

			let anotherDiv = document.createElement("div");
			anotherDiv.setAttribute("class", "anotherDiv");

			let iconDiv = document.createElement("div");
			iconDiv.setAttribute("class", "iconDiv");
			anotherDiv.appendChild(iconDiv);

			let infoP = document.createElement("p");
			infoP.setAttribute("class", "infoP");
			anotherDiv.appendChild(infoP);

			x.appendChild(anotherDiv);

			document.getElementById("row" + (i)).appendChild(x);
		}
	}
}

let infoText = document.getElementById("infoText");
let helpText = document.getElementById("helpText");
let victoryText = document.getElementById("victoryText");

function updateMoves() {
	switch (turn) {
		case 1:
			turn = 2;
			infoText.innerHTML = "It's player 2's turn!";
			
			break;

		case 2:
			turn = 1;
			infoText.innerHTML = "It's player 1's turn!";
			//Update the player's turn in database
			
			break;
	}
}


function checkMove(x, y,interactor) {
	if (isGameOver) {
		alert("Game is over");
		return;
	}

	x = parseInt(x);
	y = parseInt(y);

	if (board[x][y] == 0) {
		if (interactor == turn /*TO REMOVE */ || true) {
			
			board[x][y] = turn;

			moveCount++;
			helpText.innerHTML = moveCount;

			addPiece(x,y,turn);

			checkVictory();

			updateMoves();

		} else {
			console.log("Not your turn! Interactor : "+ interactor+", player's turn : "+ turn);
		}
		
	} else {
		console.log("The cell is already occupied by a player! ");
	}
}

function addPiece(x, y, playerParam) {
	

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

	
}


function checkVictory() {

	if(moveCount>size**2){
		isGameOver=true;
		alert("Game is over !");
	}


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
			isGameOver = true;
			alert("Player 1 won !");
			victoryText.innerHTML = "Player 1 won !";
			return [true,1];
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
				isGameOver = true;
				alert("Player 2 won !");
				victoryText.innerHTML = "Player 2 won !";
				return [true,2];
			}
		}
	}


	return [false,undefined];
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







//------------ AI PART ------------








function evaluatePosition(position){





}


class Hex {
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
}


function getShortestDistance(origin, destination, position, interactor){

	let response = getShortestPath(origin, destination, position, interactor);

	return response.length;
}


//Get the shortest path between two Hexes, by using the A* Pathfinding algorithm (see https://www.youtube.com/watch?v=-L-WgKMFuhE&ab_channel=SebastianLague)
function getShortestPath(origin, destination, position, interactor){


	document.getElementById("row"+origin.x+"column"+origin.y).children[0].children[1].innerHTML = "Origin";
	document.getElementById("row"+destination.x+"column"+destination.y).children[0].children[1].innerHTML = "Destination";


	let open = []; //the set of nodes to be evaluated
	let closed = []; //the set of nodes already evaluated

	open.push(origin);

	let current = origin;

	let x=0;

	while(x<10){

		//Calculate F cost of every node in "open" array
		let lowestFCost = Infinity;
		let idLowestFCost = null;

		for(let i=0; i<open.length; i++){
			
			let resultFCost = calculateFCost(origin, destination, current, open[i]);
			if(resultFCost<=lowestFCost){ /*? < ou <= ?*/

				lowestFCost = resultFCost;
				idLowestFCost = i;
			}

		}

		console.log("Lowest F Cost",lowestFCost, "The hex to choose :", open[idLowestFCost]);

		current = open[idLowestFCost];

		open.splice(idLowestFCost, 1);

		closed.push(current);

		console.log("Current : ",current);

		if(current.x == destination.x && current.y == destination.y){
			console.log("I found my destination, it's the best day of my life !!");
			return "TO DO : return something..."//TO DO --- return something (array of path);
		}


		//Now we look for all the neighbours around current

		const directions = [
			[-1, 0],
			[1, 0],
			[0, -1],
			[1, -1],
			[0, 1],
			[-1, 1],
		];

		for(let i=0; i<directions.length; i++){

			let neighbour = new Hex(current.x+directions[i][0],current.y+directions[i][1]);

			let isNeighbourInClosedArray = false;

			for(let x =0;x<closed.length;x++){
				if(closed[i].x==neighbour.x &&closed[i].y==neighbour.y){
					isNeighbourInClosedArray = true;
				}
			}

			if((position[neighbour.y][neighbour.x]==0 || position[neighbour.y][neighbour.x]==interactor)&& !isNeighbourInClosedArray){ /*WARNING BUG POSSIBILITY : It may be position[y][x], but i'm too dumb to figure that out 😶‍🌫️ */
				//Neighbour seems okay, let's add it to open array;


				



			}

		}
	



		x++;

	}


}



function calculateFCost(origin, destination, from, to){

	let gCost = getShortestDistanceNoObstacles(origin, to); //distance from starting node
	let hCost = getShortestDistanceNoObstacles(to, destination); //distance from end node

	return gCost+hCost;

}


function getShortestDistanceNoObstacles(from, to){

	let total = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);

	if((from.x < to.x && from.y > to.y)||(from.x > to.x && from.y < to.y)){
		
		total -= Math.abs(from.y - to.y)

	}


	return total;
 
}














document.body.onkeydown = function (e) {

	

	let possibilities = [];
	for (let i = 0; i < size; i++) {
		for (let j = 0; j < size; j++) {
			if (board[i][j] == 0) {
				possibilities.push([i, j]);
			}
		}
	}


	if (e.key == " " || e.code == "Space" || (e.keyCode == 32 && document.title == "Jeu de Hex")) {
		
		let randomElement = possibilities[Math.floor(Math.random() * possibilities.length)];
		
		checkMove(parseInt(randomElement[0]), parseInt(randomElement[1]),1);
	}

	if(e.key == "r" || e.key == "R"){
		startGame();
	}

	if(e.key == "v" || e.key == "V"){

		for (let i = 0; i < 20; i++) {
			let randomElement = possibilities[Math.floor(Math.random() * possibilities.length)];
			checkMove(parseInt(randomElement[0]), parseInt(randomElement[1]),1);
		}

		
	}


	if(e.key=="d"){

		console.log("d");

	}


};
