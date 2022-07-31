let size = 5;
let DEPTH = 2;
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


function setDifficulty(text){
	if(text=="easy"){
		console.log("Allright easy! ");
		DEPTH = 1;
	} else if(text == "medium"){
		DEPTH = 2;
	} else if(text == "impossible"){
		DEPTH = 3;
	}
}

function setSize(number){
	size = number;
}


function getTime(){
	let start = Date.now();
	parseInt(dijkstraAlgorithm(board, new Hex("T","T", undefined, undefined, undefined, true), new Hex("D","D", undefined, undefined, undefined, true), 1));

	let duration = Date.now() - start;

	console.log("Duration : "+duration+" ms.");
}


function help(){
	dijkstraAlgorithm(board, new Hex("T","T", undefined, undefined, undefined, true), new Hex("D","D", undefined, undefined, undefined, true), 1);
}



window.onload = () => {
	
	//	createBoard();

	startGame();

};


function startGame(){
	
	isGameOver = false;


	//Defines difficulty and size

	let urlParams = new URLSearchParams(window.location.search);
	if(urlParams.has("difficulty")){
		console.log("difficulty : "+urlParams.get("difficulty"));
		setDifficulty(urlParams.get("difficulty"));
	} else{
		DEPTH = 2;
	}

	if(urlParams.has("size")){
		console.log("size : "+urlParams.get("size"));
		setSize(parseInt(urlParams.get("size")));
	} else{
		size = 4;
	}


	//Empty the variable board
	board = Array(size);
	for (let i = 0; i < size; i++) {
	board[i] = Array(size).fill(0);
	}

	//Reset moveCount
	moveCount=0;
	helpText.innerHTML = moveCount;


	//Reset turn
	turn = 2;


	//Reset panels
	victoryText.innerHTML = "";
	
	

	console.log("Let's the game start!");

	createBoard();

	if(turn==AI_TURN){
		callsAi();
	}


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
		if (interactor == turn) {
			
			board[x][y] = turn;

			moveCount++;
			helpText.innerHTML = moveCount;

			addPiece(x,y,turn);

			let resultVictory = checkVictory(board);
			if(resultVictory[0]){
				victoryText.innerHTML = "Player " + resultVictory[1] +" won !";
				alert("Player "+resultVictory[1]+" won !");
				isGameOver = true;
			}
			
			
			updateMoves();
			
			unHighlightHexes();

			if(turn==AI_TURN){
				callsAi();
			}
				
			
			
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


function checkVictory(position) {

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
		if (position[0][item] == 1) {
		step1 = true;
		x1.push(item);
		}
		if (position[size - 1][item] == 1) {
		step2 = true;
		}
	}

	if (step1 && step2) {
		for (let possibleStart = 0; possibleStart < x1.length; possibleStart++) {
		let result = exploreBoard(x1[possibleStart], 0, [], 1, position);
		if (result) {
			//alert("Player 1 won !");
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
		if (position[item][0] == 2) {
		step21 = true;
		x21.push(item);
		}
		if (position[item][size - 1] == 2) {
		step22 = true;
		}
	}

	if (step21 && step22) {
		for (let possibleStart = 0; possibleStart < x21.length; possibleStart++) {
			let result = exploreBoard(0, x21[possibleStart], [], 2, position);
			if (result) {
				//alert("Player 2 won !");
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







//--------------- AI PART ---------------


function callsAi(){
	console.log("Bip boup, i'm thinking until "+DEPTH);
	//If move is to ai, then call the ai : 
	if((turn == AI_TURN && !isGameOver)){

		let resultMinimax = minimax(board, DEPTH, false);

		console.log("Score : "+resultMinimax[0]);

		checkMove(resultMinimax[1][1],resultMinimax[1][0],2);
		//console.log(evaluatePosition(board));
	}
}


function minimax(position, depth, isMaximizingPlayer){

	//console.log("Searching at depth "+depth)

	if(depth==0 || checkVictory(position)[0]){
		let resultEvaluate = evaluatePosition(position);
		return [resultEvaluate,undefined];
	}

	if(isMaximizingPlayer){

		let maxEval = -Infinity;
		let maxEvalMove = undefined;

		for(let i = 0; i<size; i++){
			
			for(let j = 0; j<size; j++){

				if(position[i][j]==0){

					let childPosition = copyArray(position);

					childPosition[i][j] = 1;
					
					let eval = minimax(childPosition, depth-1, false)[0];
					if(eval>=maxEval){ //POSSIBLE BUG HERE (> and >=)
						maxEval = eval;
						maxEvalMove = [j,i];
					}

					//alpha = Math.max(alpha, eval);
					//if(beta <= alpha){
					//	break;
					//}
					
					
				}

			}

		}
		//console.log([maxEval, maxEvalMove])
		return [maxEval,maxEvalMove];

	} else{

		let minEval = +Infinity;
		let minEvalMove = undefined;

		for(let i = 0; i<size; i++){
			
			for(let j = 0; j<size; j++){

				if(position[i][j]==0){

					let childPosition = copyArray(position);

					childPosition[i][j] = 2;

					let eval = minimax(childPosition, depth-1, true)[0];
					if(eval<=minEval){ //POSSIBLE BUG HERE (> and >=)
						minEval = eval;
						minEvalMove = [j,i];
					}
					
					//beta = Math.min(beta, eval);

					//if(beta<=alpha){
					//	break;
					//}

				}

			}

		}
		//console.log([minEval, minEvalMove])
		return [minEval,minEvalMove];


	}



}







function evaluatePosition(position){
	let victoryResult = checkVictory(position);
	if(victoryResult[0]){
		if(victoryResult[1]==1){
			return Infinity;
		} else{
			return - Infinity;
		}
	}

	let result1 = parseInt(dijkstraAlgorithm(position, new Hex("T","T", undefined, undefined, undefined, true), new Hex("D","D", undefined, undefined, undefined, true), 1));

	let result2 = parseInt(dijkstraAlgorithm(position, new Hex("L","L", undefined, undefined, undefined, true), new Hex("R","R", undefined, undefined, undefined, true), 2));
	
	return result2-result1;



}


class Hex {
	constructor(x,y,gcost,fcost, parent, isOutside){
		this.x = x;
		this.y = y;
		this.gcost = gcost;
		this.fcost = fcost;
		this.parent = parent;
		this.isOutside = isOutside;

	}
}


function dijkstraAlgorithm(position, origin, destination, interactor){


	let nodes = [];


	nodes.push(origin, destination);

	for(let i = 0; i<size; i++){
		for(let j = 0; j<size; j++){
			if(position[i][j]==interactor && !((origin.x == j && origin.y == i) || (destination.x == j && destination.y == i))){
				nodes.push(new Hex(j,i));
			}
		}
	}

	let graph = {};


	for(let i = 0; i<nodes.length; i++){

		graph["x"+nodes[i].x+"y"+nodes[i].y] = [];

		for(let j = 0; j<nodes.length; j++){

			if(j!=i){
				graph["x"+nodes[i].x+"y"+nodes[i].y].push(nodes[j]);
			}

		}

	}


	
	let results = {};

	//Initialize results dict
	for(let i = 0; i<nodes.length; i++){
		results["x"+nodes[i].x+"y"+nodes[i].y] = {"shortestDistanceFromOrigin":Infinity, "previous":undefined};
	}


	let visitedNodes = [];

	//!!! Start of function (after initializing plenty of things) !!!


	results["x"+origin.x+"y"+origin.y]["shortestDistanceFromOrigin"] = 0;

	
	while(visitedNodes.length != nodes.length){


		//console.log(nodes, visitedNodes, results);

		let current;

		
		//Search for the lowest distanceFromorigin in nodes, to assign it to current : 

		let lowestDistance = Infinity;
		let idLowestDistance = undefined;
		for(let i = 0; i<nodes.length; i++){
			if(results["x"+nodes[i].x+"y"+nodes[i].y].shortestDistanceFromOrigin <= lowestDistance && !isHexInArray(nodes[i],visitedNodes)){
				//console.log("Okay current defined");
				lowestDistance = results["x"+nodes[i].x+"y"+nodes[i].y].shortestDistanceFromOrigin;
				idLowestDistance = i;
			}
		}

		current = nodes[idLowestDistance];


		//Now that current is defined, lets take a look at its neighbours : 
		

		let neighbours = graph["x"+current.x+"y"+current.y];


		for(let i = 0; i<neighbours.length; i++){

			let newDistance = results["x"+current.x+"y"+current.y].shortestDistanceFromOrigin + getShortestDistance(current, neighbours[i], position, interactor);

			if(newDistance < results["x"+neighbours[i].x+"y"+neighbours[i].y].shortestDistanceFromOrigin){
				results["x"+neighbours[i].x+"y"+neighbours[i].y]["shortestDistanceFromOrigin"] = newDistance;
				results["x"+neighbours[i].x+"y"+neighbours[i].y]["previous"] = current;
			}

		}

		visitedNodes.push(current);




	}

	let minimalDistance = results["x"+destination.x+"y"+destination.y].shortestDistanceFromOrigin;




	//Retrace path to highlite right hexes !!


	let current = destination;


	for(let i = 0; i<1000; i++){

		let hexesToHighlite = getShortestPath(current, results["x"+current.x+"y"+current.y].previous, position, interactor);

		if(hexesToHighlite!=undefined && hexesToHighlite!=null){
			if(interactor==1){
				
				highlitHexes(hexesToHighlite, "green");
			} else{
				highlitHexes(hexesToHighlite, "red");
			}
		}	

		
		
		current = results["x"+current.x+"y"+current.y].previous;


		if(results["x"+current.x+"y"+current.y].previous==undefined){
			break;
		}

	}

	return minimalDistance;

}














function getShortestDistance(origin, destination, position, interactor){

	let response = getShortestPath(origin, destination, position, interactor);

	if(response != undefined){
		

		let finalDistance = response.length;

		if(!origin.isOutside){
			finalDistance--;
		}
		if(!destination.isOutside){
			finalDistance--;
		}

		return finalDistance; //Minus 1 just to not include the start.
	} else{

		return Infinity;
	}
	
}


//Get the shortest path between two Hexes, by using the A* Pathfinding algorithm (see https://www.youtube.com/watch?v=-L-WgKMFuhE&ab_channel=SebastianLague)
function getShortestPath(origin, destination, position, interactor){

	let x=0;

	let rD = 1;
	let rO = 1;
	let destinations = [];
	let origins = [];


	let paths = [];



	if(destination.isOutside){
		rD = size;
		if(destination.x == "T"){
			for(let i = 0; i<size; i++){
				destinations.push(new Hex(i,0));
			}
		} else if(destination.x == "D"){
			for(let i = 0; i<size; i++){
				destinations.push(new Hex(i,size-1));
			}
		} else if(destination.x == "L"){
			for(let i = 0; i<size; i++){
				destinations.push(new Hex(0,i));
			}
		} else if(destination.x == "R"){
			for(let i = 0; i<size; i++){
				destinations.push(new Hex(size-1,i));
			}
		}
	}else{
		destinations.push(destination);
	}


	if(origin.isOutside){
		rO = size;
		if(origin.x == "T"){
			for(let i = 0; i<size; i++){
				origins.push(new Hex(i,0));
			}
		} else if(origin.x == "D"){
			for(let i = 0; i<size; i++){
				origins.push(new Hex(i,size-1));
			}
		} else if(origin.x == "L"){
			for(let i = 0; i<size; i++){
				origins.push(new Hex(0,i));
			}
		} else if(origin.x == "R"){
			for(let i = 0; i<size; i++){
				origins.push(new Hex(size-1,i));
			}
		}
	}else{
		origins.push(origin);
	}



	for(let repeatDest = 0; repeatDest<rD; repeatDest++){

		destination = destinations[repeatDest];
		

		for(let repeatOrig = 0; repeatOrig<rO; repeatOrig++ ){

			origin = origins[repeatOrig];


			//Start before T, D, L, R
			//console.log(origin, destination);

			//document.getElementById("row"+origin.y+"column"+origin.x).children[0].children[1].innerHTML = "Origin";
			//document.getElementById("row"+destination.y+"column"+destination.x).children[0].children[1].innerHTML = "Destination";

			origin.fcost = 0;
			origin.gcost = 0;

			let open = []; //the set of nodes to be evaluated
			let closed = []; //the set of nodes already evaluated

			if(position[origin.y][origin.x]==interactor ||position[origin.y][origin.x]==0){
				open.push(origin);
			}
			

			let current = origin;



			while(x<1000){


				//Exit thing : if there are no other hex to visit, then this means there is no path...
				if(open.length == 0){

					break;
				}
		
		
				//Calculate F cost of every node in "open" array
				let lowestFCost = Infinity;
				let idLowestFCost = null;
				
		
				for(let i=0; i<open.length; i++){
					
					//let resultCosts = calculateCosts(origin, destination, current, open[i]);
					
		
					//document.getElementById("row"+open[i].y+"column"+open[i].x).children[0].children[1].innerHTML = "F : "+open[i].fcost+", G : "+open[i].gcost;
		
					if(open[i].fcost<=lowestFCost){ /*? < ou <= ?*/
		
						lowestFCost = open[i].fcost;
						idLowestFCost = i;
					}
		
				}
		
				
				current = open[idLowestFCost];
		
				open.splice(idLowestFCost, 1);
		
				closed.push(current);
		
				if(current.x == destination.x && current.y == destination.y){
					//console.log("I found my destination, it's the best day of my life !!");
		
					let pathTaken = [current];
					let retraceHex = current;
					while(retraceHex.parent != undefined){
						pathTaken.push(retraceHex.parent);
						retraceHex = retraceHex.parent;
					}
		
					//console.log("Retraçage",pathTaken);
		
					
		
					paths.push(pathTaken);//TO DO --- return something (array of path);
					break;
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
		
		
					if( ! ((0<=current.x+directions[i][0] && current.x+directions[i][0]<size) && (0<=current.y+directions[i][1] && current.y+directions[i][1]<size))){
						
						continue;
					}
		
		
					let neighbour = new Hex(current.x+directions[i][0],current.y+directions[i][1]);
		
					if(isHexInArray(neighbour,open)){
						neighbour = hexInArray(neighbour,open);
					}
					
					if((position[neighbour.y][neighbour.x]==0 || position[neighbour.y][neighbour.x]==interactor)&& !isHexInArray(neighbour,closed)){ /*WARNING BUG POSSIBILITY : It may be position[y][x], but i'm too dumb to figure that out 😶‍🌫️ */
						//Neighbour seems okay, let's add it to open array;
						
						let resultCosts = calculateCosts(origin, destination, current, neighbour);
					
						if(resultCosts.fcost < neighbour.fcost || !isHexInArray(neighbour, open)){
		
							neighbour.fcost = resultCosts.fcost;
							neighbour.gcost = resultCosts.gcost;
							neighbour.parent = current;
		
							if(!isHexInArray(neighbour, open)){
								
								open.push(neighbour);
							}
		
						}
		
		
		
					}
		
				}
				
		
				
		
				x++;
		
			}

		}

		
	}


	//console.log("PATHS FOUND : ",paths);

	let minLengthPath = Infinity;
	let minPath = undefined;

	for(let i =0; i<paths.length; i++){
		
		if(paths[i].length<=minLengthPath){
			minLengthPath = paths[i].length;
			minPath = paths[i];
		}
	}
	
	//console.log("Min path : ",minPath);

	//highlitHexes(minPath,"red");

	return minPath;

	


}


function calculateCosts(orig, desti, from, to){

	let gCost = 0;//distance from starting node
	if(!(from.x==to.x && from.y==to.y)){
		gCost = from.gcost + 1;
	}
	 
	let hCost = getShortestDistanceNoObstacles(to, desti); //distance from end node




	return {"fcost":gCost+hCost,"gcost":gCost,"hcost":hCost};

}

function isHexInArray(hex, array){
	for(let i = 0; i<array.length; i++){
		if(array[i].x ==hex.x && array[i].y == hex.y){
			return true;
		}
	}
	return false;
}

function hexInArray(hex, array){
	for(let i = 0; i<array.length; i++){
		if(array[i].x ==hex.x && array[i].y == hex.y){
			return array[i];
		}
	}
	return undefined;
}

function areHexesEqual(hex1, hex2){
	return (hex1.x == hex2.x && hex1.y == hex2.y)
}








function getShortestDistanceNoObstacles(from, to){

	let total = Math.abs(from.x - to.x) + Math.abs(from.y - to.y);

	if((from.x < to.x && from.y > to.y)||(from.x > to.x && from.y < to.y)){
		
		total -= Math.min(Math.abs(from.y - to.y),Math.abs(from.x - to.x));

	}


	return total;
 
}



function highlitHexes(arrayOfHexes,color){

	for(let i=0; i<arrayOfHexes.length; i++){
		let myHex = document.getElementById("row"+arrayOfHexes[i].y+"column"+arrayOfHexes[i].x);

		myHex.style.setProperty("--cell-color",color);
	}

}

function unHighlightHexes(arrayOfHexes){

	for(let i=0; i<size; i++){

		for(let j = 0; j<size; j++){
			document.getElementById("row"+i+"column"+j).style.setProperty("--cell-color","rgb(92, 92, 255)");
		}
		

		
	}

}

function freeHexes(position){
	let final = [];
	for(let i = 0; i<size; i++){
		for(let j = 0; j<size; j++){
			if(position[j][i]==0){
				final.push([i,j]);
			}
		}
	}

	return final;
}


function copyArray(position){
	let final = [];
	for(let i = 0; i<position.length; i++){
		final.push([]);
		for(let j = 0; j<position[i].length;j++){

			final[i].push(position[i][j])
		}
	}

	return final;
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
