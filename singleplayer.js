var p = 0;
var checkHeight;
var collideLeft = 0;
var collideRight = 0;
var collideUp = 0;
var terrainCheck = 0;
var mg_player1;
var action = 1;
var state = "";
var dir = "right";
var q = 10;
var messageType = 1;
var teleportMove = 0;
var maxY;

function connectPlayer(mg_playerType) {
	if(mg_player1 == null) {
		mg_player1 = new mg_player("blue", 400, 720, 720, 0);
		multiGames_area.player1 = 1;
	}
}
function mg_start() { //creates canvas when MultiGames tab is clicked
	if ($("#mg_canvas")) {
		multiGames_area.drawCanvas();
		connectPlayer(1);
		$("#toggleEdit").css("background-position", "0px 0px");
		game = new gameInfo();
		
		//document.getElementById("mg_canvas").addEventListener("mousedown mouseover", function(e) {
		$("#mg_canvas").on("mousedown", function(e) {
			levelEditor.placeObj(e, "brick");
		});
		$("#mg_canvas").on("mousemove", function(e) {
			levelEditor.tempObj(e);
		});
		
		this.interval1 = setInterval(mg_refreshCanvas, 18);
	}
	$(".levelEditHUD").hide();
	$("#newLevel").hide();
	game.changeLevel();
}


var multiGames_area = { //creates canvas
	canvas : document.createElement("canvas"),
	drawCanvas : function() {
		this.canvas.width = 1600;
		this.canvas.height = 800;
		this.canvas.id = "mg_canvas"
		this.canvas.className = "hideMultiGames";
		this.context = this.canvas.getContext("2d");
		document.body.insertBefore(this.canvas, document.body.childNodes[0]);
	},
	mg_clear : function() { //clears canvas
		this.context.clearRect(0, 0, 1600, 800);	
	},
	/*textAnimation : function() { //writes text
		var message1 = "Welcome to this game!";
		var message2 = "Use the arrow keys to move and jump.";
		var message3 = "Jump up the blocks to get to the teleport.";
		text = document.getElementById("mg_canvas").getContext("2d");
		text.font = "80px Arial";
		if (messageType == 1 && q < message1.length * 5 + 100 ) {
			q++;
			text.fillText(message1.substr(0, q/5), 0, 100);
		}
		else if (messageType == 1 && q == message1.length * 5 + 100) {
			messageType = 2;
			q = 10;
		}
		if (messageType == 2 && q < message2.length * 5 + 100) {
			q++;
			text.fillText(message2.substr(0, q/5), 0, 100);
		}
		else if (messageType == 2 && q == message2.length * 5 + 100) {
			messageType = 3;
			q = 10;
		}
		if (messageType == 3 && q < message3.length * 5 + 100) {
			q++;
			text.fillText(message3.substr(0, q/5), 0, 100);
		} 
	},*/
}

var gameInfo = function() {
	this.level = 1;
	this.edit = 0;
	this.changeLevel = function() {
		if (this.level == 1) {
			mg_levelLoad();
			this.level++;
		}
		else if (this.level == 2) {
			mg_level2Load();
			this.level++
		}
		else if (this.level == 3) {
			mg_level3Load();
			this.level++
		}
	}
}
teleportAnim = function(type) {
	if (mg_level[type].constructor.name == "mg_teleport_station" && typeof teleport == "undefined" && mg_player1.y + mg_player1.height == mg_level[type].y ) { //Finish teleport animation
		teleport = new mg_teleport("Sprites/teleport_on.png", 1500, -169, 78, 169);
		mg_player1.x = mg_level[type].x + 10;
		collideLeft = 1;
		collideRight = 1;
		collideUp = 1;
		teleportMove = 1;
	}
	else if (typeof teleport == "object" && teleport.y + teleport.height >= teleport_station.y + teleport_station.height && teleportMove == 1) {
		teleportMove = 0;
		setTimeout(function(){
			teleportMove = 2;
			mg_player1.x = 8000;
		}, 500);
		setTimeout(function(){
			game.changeLevel(2);
			mg_player1.x = 400;
			mg_player1.absoluteX = 0;
			collideLeft = 0;
			collideRight = 0;
			collideUp = 0;
		}, 3000);
	}
}

window.addEventListener("keydown", function(mg_key) { //tests for key presses
	multiGames_area.key = (multiGames_area.key || [])
	multiGames_area.key[mg_key.keyCode] = true;
})
window.addEventListener("keyup", function(mg_key) {
	multiGames_area.key[mg_key.keyCode] = false;
})
mg_backgrounds = [];
var mg_background = function(source, parallax) {
	this.x  = -400;
	this.y = 0;
	this.width = 2000;
	this.height = 800;
	this.parallax = parallax;
	this.image = new Image();
	this.image.src = source;
	mg_backgrounds.push(this);
	this.redrawBackground = function() {
		this.x = -60 - 2 * ((mg_player1.absoluteX) / this.parallax);
		var ctx = multiGames_area.context;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
}
mg_background.updateBackground = function() {
	mg_backgrounds.forEach(function(bg) {
		bg.redrawBackground();
	});
}
var background_1 = new mg_background("Sprites/Backgrounds/Desert_sky.png", 18);
var background_2 = new mg_background("Sprites/Backgrounds/Desert_mountains.png", 12);
var background_3 = new mg_background("Sprites/Backgrounds/Desert.png", 8);

var mg_playerList = []; //stores players
var mg_player = function mg_player(color, x, y, playerFloor, playerLane) { //stores general shared methods and properties of players
	mg_playerList.push(this);
	this.absoluteX = 0;
	this.speedY = 0;
	this.width = 60;
	this.height = 80;
	this.gravity = 0;
	this.playerFloor = playerFloor;
	this.initialPlayerFloor = playerFloor;
	this.image = new Image();
	this.x = x;
	this.initialX = x;
	this.y = y;
	this.initialY = y;
	this.playerLane = playerLane;
	this.newSource = 0;
	ctx = multiGames_area.context;
	ctx.fillStyle = this.color;
	ctx.fillRect(this.x, this.y, this.width, this.height);
	
	this.changeSpeedX = function(direction) {
		mg_level.forEach(function(block) {
			block.speedX = 0;
			mg_player1.speedX = 0;
			state = direction;
			if (direction == "right") {
				mg_player1.speedX = 7;
			}
			else if (direction == "left") {
				mg_player1.speedX = -7;
			} 
			else {
				state = "standing";
			}
		});
	}
	
	this.changeSpeedY = function() {
		if (collideUp == 0) {
			this.speedY = -22;
		}
	}
	
	this.redrawPlayer = function() { //redraws player with new properties
		ctx = multiGames_area.context;
		if (this.y == this.playerFloor && this.newSource == 0) {		
			if (state == "standing") {
				if (dir == "right") {
					this.image.src = "Sprites/Player/Standingright.png";
				}
				else if (dir == "left") {
					this.image.src = "Sprites/Player/Standingleft.png";
				}
			}
			else {
				action = action + 2;
				this.image.src = "Sprites/Player/running" + state + "_" + Math.ceil(action / 10) + "_large.png";
				if (action >= 40) {
					action = 0;
				}
			}
		}
		else if (this.y != this.playerFloor && this.newSource == 0) {
			if (dir == "right") {
				this.image.src = "Sprites/Player/runningright_1_large.png";
			}
			else if (dir == "left") {
				this.image.src = "Sprites/Player/runningleft_1_large.png";
			}
		}
		else if (this.newSource != 0) {
			this.image.src = this.newSource;
		}
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
	this.playerFloorDetect = function() { //Handles collision detection for top of block
		maxY = mg_player1.initialPlayerFloor;
		mg_player1.playerFloor = mg_player1.initialPlayerFloor;
		
		for (f = 0; f < mg_level.length; f++) {
			if (this.x + this.width > mg_level[f].x && this.x < mg_level[f].x + mg_level[f].width && this.y + this.height < mg_level[f].y + 25) {
				if (mg_level[f].y <= maxY) {
					maxY = mg_level[f].y;
					mg_player1.playerFloor = mg_level[f].y - mg_player1.height;
					teleportAnim(f);
				}
			}
		}
	}
	this.playerCollideDetect = function() { //Handles collision detection for left, right and bottom side of block
		for (f = 0; f < mg_level.length; f++) {
			if (this.x > mg_level[f].x + mg_level[f].width - 7 && this.x < mg_level[f].x + mg_level[f].width + 7 && this.y < mg_level[f].y + mg_level[f].height && this.y + this.height > mg_level[f].y) {
				collideRight = 1;
			}
			else if (this.x + this.width > mg_level[f].x - 7 && this.x + this.width < mg_level[f].x + 7 && this.y < mg_level[f].y + mg_level[f].height && this.y + this.height > mg_level[f].y) {
				collideLeft = 1;
			}
			if (this.x + this.width > mg_level[f].x && this.x < mg_level[f].x + mg_level[f].width && this.y < mg_level[f].y + mg_level[f].height && this.y > mg_level[f].y + mg_level[f].height - 8) {
				this.gravity = 3.5;//-1 * this.speedY / 6.2857;
				this.speedY = 0;
			}
		}
	}
	this.playerEnemyDamage = function() {
		for (f = 0; f < mg_enemies.length; f++) {
			if (this.x + this.width > mg_enemies[f].x && this.x < mg_enemies[f].x + mg_enemies[f].width && this.y + this.height > mg_enemies[f].y && this.y < mg_enemies[f].y + mg_enemies[f].height) {
				changePlayer = "will"; //fix this
				mg_player1.newSource = 1;
				mg_player1.newImage = 1;
			}
		}
	}
}
mg_player.updatePlayer = function() { //cycles through all players and runs functions
	if (game.edit == 1) {
		collideLeft = 1;
		collideRight = 1;
		collideUp = 1;
	}
	else {
		collideLeft = 0;
		collideRight = 0;
	}
	var direction = "";
	mg_player1.playerCollideDetect();
	if (multiGames_area.key) {
		if (mg_player1.playerLane == 0) {
			if (multiGames_area.key[38] && mg_player1.y == mg_player1.playerFloor) {mg_player1.changeSpeedY()}	
			if (multiGames_area.key[39] && collideLeft == 0) {
				direction = "right"
				dir = "right";
			}
			if (multiGames_area.key[37] && collideRight == 0) {
				direction = "left"
				dir = "left";
			} //checks which key is being pressed then changes speed
			if (collideRight == 1 && multiGames_area.key[37] && multiGames_area.key[39]) {
				collideLeft = 1;
				direction = "";
				dir = "";
			}
			else {
				collideLeft = 0;
			}
		}
	}
	mg_player1.changeSpeedX(direction);
	mg_player1.playerFloorDetect();
	mg_player1.redrawPlayer(); 
	mg_player1.playerEnemyDamage();
	mg_player1.absoluteX += mg_player1.speedX;
	$("#xcounter").html(mg_player1.absoluteX);
	mg_player1.y += mg_player1.speedY;
	if (mg_player1.y < mg_player1.playerFloor && collideUp != 1) {
		mg_player1.gravity += 1.0;
		mg_player1.y += mg_player1.gravity;
	}
	if (mg_player1.y == mg_player1.playerFloor) {
		mg_player1.speedY = 0;
		mg_player1.gravity = 0;
	}
	if (mg_player1.y > mg_player1.playerFloor) {
		mg_player1.speedY = 0;
		mg_player1.gravity = 0;
		mg_player1.y = mg_player1.playerFloor;
	}
};
var changePlayer;
var swapCoords = new Konami(function() {
	changePlayer = prompt('Enter a code to continue...');
	mg_player1.newImage = 1;
	if (changePlayer == "kit") {
		mg_player1.newSource = "Sprites/Player/kit.png";
	}
	else if (changePlayer == "will") {
		mg_player1.newSource = "Sprites/Player/_will.png";
	}
	else if (changePlayer == "mikel") {
		mg_player1.newSource = "Sprites/Player/mikel.png";
	}
	else if (changePlayer == "maxim") {
	}
	else if (changePlayer == "cameron") {
		mg_player1.newSource = "Sprites/Player/cam.png";
	}
	else if (changePlayer == "woodman") {
		mg_player1.newSource = "Sprites/Player/deputyhead.png";
	}
	else if (changePlayer == "hoyle") {
		mg_player1.newSource = "Sprites/Player/hoyle.png";	
	}
	else if (changePlayer == "thomas") {
		mg_player1.newSource = "Sprites/Player/leysh.png";	
	}
	else if (changePlayer == "henry") {
		mg_player1.newSource = "Sprites/Player/henry.png";
	}
	else if (changePlayer == "sam") {
		var changePlayer_2 = prompt('Which Sam? Type E for Ellis or M for Macfarlane...');
		if (changePlayer_2 == "M") {
			mg_player1.newSource = "Sprites/Player/macfar.png";
		}
		else if (changePlayer_2 == "E") {
			mg_player1.newSource = "Sprites/Player/_sam.png";
		}
		else {
			alert("Invalid Answer");
		} 
	}
	else if (changePlayer == "ollie") {
		mg_player1.newSource = "Sprites/Player/ollie.png";
	}
	else if (changePlayer == "ilhan") {
		mg_player1.newSource = "Sprites/Player/ilhan.png";
	}
	else if (changePlayer == "sean") {
		mg_player1.newSource = "Sprites/Player/sean.png";
	}
	else if (changePlayer == "izzy") {
		mg_player1.newSource = "Sprites/Player/izzy.png";
	}
	else {
		mg_player1.newSource = 0;
	}
	});
var mg_enemies = [];
var mg_enemy = function mg_enemy(x, y, width, height) { //enemies
	this.x = x;
	this.initialX = x;
	this.y = y; 
	this.width = width;
	this.height = height;
	this.speedX = 0;
	this.speedY = 0;
	this.image = new Image();
	mg_enemies.push(this);
}

mg_enemy.prototype.redrawEnemy = function() {
	ctx = multiGames_area.context;
	ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
}


function mg_enemyKevil(x, y, width, height) {
	mg_enemy.call(this, x, y, width, height);
	this.image.src = "Sprites/Enemy/enemy1.png";
	this.speedX = 0;
}
mg_enemyKevil.prototype = Object.create(mg_enemy.prototype);
mg_enemyKevil.prototype.constructor = mg_enemyKevil;


mg_enemy.updateEnemy = function() {
	mg_enemies.forEach(function(enemy) {
		enemy.initialX += enemy.speedX;
		enemy.x = enemy.initialX - mg_player1.absoluteX;
		enemy.y += enemy.speedY;
		enemy.redrawEnemy();
	});
}

var tempObjX; //ppp
var tempObjY;
var levelEdit = function levelEdit() {
	this.blockType = "mg_brick";
	this.objWidth = 100;
	this.objHeight = 100;
	this.offsetX = 0;
	this.offsetY = 0;
	this.newLevel = "";
	this.toggle = function() {
		if (game.edit == 0) {
			$("#toggleEdit").css("background-position", "-50px 0px");
			mg_level = [];
			q = 100000;
			game.edit = 1;
			$("#newLevel").bind('mousedown', levelEditor.copyText());
			$(".levelEditHUD").show();
			mg_player1.x = 400;
			mg_player1.y = 1600;
			mg_player1.absoluteX = 0;
		}
		else {
			this.newLevel = mg_level;
			$("#toggleEdit").css("background-position", "0px 0px");
			game.edit = 0;
			mg_level = [];
			$(".levelEditHUD").hide();
			mg_level = this.newLevel;
			collideUp = 0;
		}
	}
}
levelEdit.prototype.copyText = function() {
	$("#newLevel").select();
	document.execCommand('copy');
}
levelEdit.prototype.placeObj = function(e) {
	e.pageX += mg_player1.absoluteX;
	
	this.objX = Math.floor(e.pageX / 100, 1) * 100;
	this.objY = Math.floor(e.pageY / 100, 1) * 100;
	if (this.blockType != "eraser") {
		
			var tmp = 'new ' + this.blockType + '(' + (this.objX + this.offsetX) + ', ' + (this.objY + this.offsetY) + ', ' + this.objWidth + ', ' + this.objHeight + ', 1)';
			mg_level.push(eval(tmp));
			this.newLevel += this.blockType + '(' + (this.objX + this.offsetX) + ', ' + (this.objY + this.offsetY) + ', ' + this.objWidth + ', ' + this.objHeight + ', 1); &#13;&#10;'
			$("#newLevel").html(this.newLevel);
	}
	else {
		mg_level.forEach(function(block) {
			if (levelEditor.objX + levelEditor.objWidth == block.x + block.width && levelEditor.objY + levelEditor.objHeight == block.y + block.height && block.constructor.name != "mg_edit") {
				mg_level.splice(mg_level.indexOf(block), 1);
				var eraseBlock = "new " + block.constructor.name + "(" + block.x + ", " + block.y + ", " + block.width + ", " + block.height + ", 1); &#13;&#10;";
				levelEditor.newLevel = levelEditor.newLevel.toString().replace(eraseBlock, "")
				$("#newLevel").html(levelEditor.newLevel);
			}
		});
	}
}
levelEdit.prototype.runLevel = function() {
	this.toggle();
}
levelEdit.prototype.tempObj = function(e) {
	tempObjX = Math.floor(e.pageX / 100, 1) * 100;
	tempObjY = Math.floor(e.pageY / 100, 1) * 100;
	if (game.edit == 1) {
		if (typeof tempObj == "undefined") {
			console.log("created");
			tempObj = new mg_edit(e.pageX, e.pageY, 100, 100, 0);
			mg_level.push(tempObj);
		}
	}
}
levelEdit.prototype.changeBlockType = function(type, x, y, width, height) {
	
	this.blockType = type;
	this.objWidth = width;
	this.objHeight = height;
	this.offsetX = x;
	this.offsetY = y;
}
levelEdit.prototype.pan = function(dir) {
	mg_player1.absoluteX += dir;
}
var levelEditor = new levelEdit();

var mg_level = [];
function mg_levelLoad() {
	
	new mg_brick(300, 700, 100, 100, 1); 
	new mg_brick(200, 700, 100, 100, 1); 
	new mg_brick(0, 700, 100, 100, 1); 
	new mg_brick(100, 700, 100, 100, 1); 
	new mg_brick(0, 600, 100, 100, 1); 
	new mg_brick(0, 500, 100, 100, 1); 
	new mg_brick(0, 400, 100, 100, 1); 
	new mg_brick(0, 300, 100, 100, 1); 
	new mg_brick(0, 200, 100, 100, 1); 
	new mg_brick(0, 0, 100, 100, 1); 
	new mg_brick(0, 100, 100, 100, 1); 
	new mg_brick(100, 0, 100, 100, 1); 
	new mg_brick(200, 0, 100, 100, 1); 
	new mg_brick(300, 0, 100, 100, 1); 
	new mg_brick(100, 400, 100, 100, 1); 
	new mg_brick(200, 400, 100, 100, 1); 
	new mg_brick(400, 200, 100, 100, 1); 
	new mg_brick(700, 300, 100, 100, 1); 
	new mg_brick(1000, 400, 100, 100, 1);
	new mg_brick(300, 600, 100, 100, 1); 
	new mg_brick(1000, 500, 100, 100, 1); 
	new mg_brick(1000, 600, 100, 100, 1); 
	new mg_brick(1000, 700, 100, 100, 1); 
	new mg_brick(1300, 400, 100, 100, 1); 
	new mg_brick(1300, 500, 100, 100, 1); 
	new mg_brick(1300, 600, 100, 100, 1); 
	new mg_brick(1300, 700, 100, 100, 1); 
	new mg_brick(1100, 600, 100, 100, 1); 
	new mg_brick(1400, 400, 100, 100, 1); 
	new mg_brick(1500, 400, 100, 100, 1); 
	new mg_brick(1600, 400, 100, 100, 1); 
	new mg_brick(1700, 400, 100, 100, 1); 
	new mg_brick(1700, 500, 100, 100, 1); 
	new mg_brick(1700, 700, 100, 100, 1); 
	new mg_brick(1700, 600, 100, 100, 1); 
	new mg_brick(2000, 300, 100, 100, 1); 
	new mg_brick(2100, 300, 100, 100, 1); 
	new mg_brick(2200, 300, 100, 100, 1); 
	new mg_brick(2000, 400, 100, 100, 1); 
	new mg_brick(2000, 500, 100, 100, 1); 
	new mg_brick(2000, 600, 100, 100, 1); 
	new mg_brick(2000, 700, 100, 100, 1); 
	new mg_brick(2200, 400, 100, 100, 1); 
	new mg_brick(2200, 500, 100, 100, 1); 
	new mg_brick(2200, 700, 100, 100, 1); 
	new mg_brick(2200, 600, 100, 100, 1); 
	new mg_brick(2100, 400, 100, 100, 1); 
	new mg_brick(2100, 500, 100, 100, 1); 
	new mg_brick(2100, 600, 100, 100, 1); 
	new mg_brick(2100, 700, 100, 100, 1); 
	new mg_sand(500, 300, 100, 100, 1); 
	new mg_sand(600, 300, 100, 100, 1); 
	new mg_brick(2600, 700, 100, 100, 1); 
	new mg_brick(2600, 600, 100, 100, 1); 
	new mg_brick(2600, 500, 100, 100, 1); 
	new mg_brick(2600, 400, 100, 100, 1); 
	new mg_brick(2600, 300, 100, 100, 1); 
	new mg_brick(2600, 200, 100, 100, 1); 
	new mg_brick(2600, 100, 100, 100, 1); 
	new mg_brick(2600, 0, 100, 100, 1); 
	new mg_brick(2300, 0, 100, 100, 1); 
	new mg_brick(2300, 100, 100, 100, 1); 
	new mg_brick(2300, 200, 100, 100, 1); 
	new mg_brick(2300, 300, 100, 100, 1); 
	new mg_brick(2300, 400, 100, 100, 1); 
	new mg_brick(2300, 500, 100, 100, 1); 
	new mg_brick(2300, 600, 100, 100, 1); 
	new mg_brick(2300, 700, 100, 100, 1); 
	new mg_brick(2400, 0, 100, 100, 1); 
	new mg_brick(2500, 0, 100, 100, 1); 
	new mg_brick(2400, 700, 100, 100, 1); 
	new mg_brick(2500, 700, 100, 100, 1); 
	new mg_brick(2700, 700, 100, 100, 1); 
	new mg_brick(2900, 700, 100, 100, 1); 
	new mg_brick(2800, 700, 100, 100, 1); 
	new mg_brick(2900, 600, 100, 100, 1); 
	new mg_brick(2900, 500, 100, 100, 1); 
	new mg_brick(2900, 400, 100, 100, 1); 
	new mg_brick(2900, 300, 100, 100, 1); 
	new mg_brick(2900, 200, 100, 100, 1); 
	new mg_brick(2900, 100, 100, 100, 1); 
	new mg_brick(2900, 0, 100, 100, 1); 
	new mg_brick(2800, 0, 100, 100, 1); 
	new mg_brick(2700, 0, 100, 100, 1); 
	new mg_brick(3000, 0, 100, 100, 1); 
	new mg_brick(3100, 0, 100, 100, 1); 
	new mg_brick(3200, 0, 100, 100, 1); 
	new mg_brick(3200, 100, 100, 100, 1); 
	new mg_brick(3200, 200, 100, 100, 1); 
	new mg_brick(3200, 300, 100, 100, 1); 
	new mg_brick(3200, 400, 100, 100, 1); 
	new mg_brick(3200, 500, 100, 100, 1); 
	new mg_brick(3200, 600, 100, 100, 1); 
	new mg_brick(3200, 700, 100, 100, 1); 
	new mg_brick(3100, 700, 100, 100, 1); 
	new mg_brick(3000, 700, 100, 100, 1); 
	new mg_brick(3300, 700, 100, 100, 1); 
	new mg_brick(3300, 0, 100, 100, 1); 
	teleport_station = new mg_teleport_station(2200, 278, 78, 22, 1); 
}
function mg_level2Load() {

	new mg_brick(500, 600, 100, 100, 1);
	new mg_brick(500, 700, 100, 100, 1);
	new mg_brick(600, 700, 100, 100, 1);
	new mg_brick(600, 600, 100, 100, 1);
	new mg_brick(300, 500, 100, 100, 1);
	new mg_brick(200, 500, 100, 100, 1);
	new mg_brick(600, 400, 100, 100, 1);
	new mg_brick(600, 300, 100, 100, 1);
	new mg_brick(800, 400, 100, 100, 1);
	new mg_brick(900, 400, 100, 100, 1);
	new mg_brick(600, 200, 100, 100, 1);
	new mg_brick(700, 200, 100, 100, 1);
	new mg_brick(800, 200, 100, 100, 1);
	new mg_brick(300, 300, 100, 100, 1);
	new mg_brick(400, 100, 100, 100, 1);
	new mg_brick(900, 200, 100, 100, 1);
	new mg_brick(1000, 200, 100, 100, 1);
	new mg_brick(800, 500, 100, 100, 1);
	new mg_brick(800, 600, 100, 100, 1);
	new mg_brick(800, 700, 100, 100, 1);
	new mg_brick(900, 500, 100, 100, 1);
	new mg_brick(900, 600, 100, 100, 1);
	new mg_brick(900, 700, 100, 100, 1);
	new mg_brick(1100, 300, 100, 100, 1);
	new mg_brick(1100, 400, 100, 100, 1);
	new mg_brick(1100, 500, 100, 100, 1);
	new mg_brick(1100, 600, 100, 100, 1);
	new mg_brick(1100, 200, 100, 100, 1);
	new mg_brick(1200, 300, 100, 100, 1);
	new mg_brick(1300, 500, 100, 100, 1);
	new mg_brick(1400, 200, 100, 100, 1);
	new mg_brick(1400, 300, 100, 100, 1);
	new mg_brick(1400, 400, 100, 100, 1);
	new mg_brick(1400, 500, 100, 100, 1);
	new mg_brick(1400, 600, 100, 100, 1);
	new mg_brick(1400, 0, 100, 100, 1);
	new mg_brick(1700, 200, 100, 100, 1);
	new mg_brick(1600, 300, 100, 100, 1);
	new mg_brick(1500, 500, 100, 100, 1);
	new mg_brick(1300, 0, 100, 100, 1);
	new mg_brick(1600, 600, 100, 100, 1);
	new mg_brick(1000, 100, 100, 100, 1);
	new mg_brick(700, 100, 100, 100, 1);
	teleport_station = new mg_teleport_station(1700, 178, 78, 22, 1);

}
function mg_level3Load() {
	new mg_brick(500, 700, 100, 100, 1);
	new mg_brick(300, 500, 100, 100, 1);
	new mg_brick(500, 300, 100, 100, 1);
	new mg_brick(200, 300, 100, 100, 1);
	new mg_brick(200, 200, 100, 100, 1);
	new mg_brick(300, 200, 100, 100, 1);
	new mg_brick(500, 100, 100, 100, 1);
	new mg_brick(300, 0, 100, 100, 1);
	new mg_brick(300, 100, 100, 100, 1);
	new mg_brick(200, 100, 100, 100, 1);
	new mg_brick(200, 0, 100, 100, 1);
	new mg_brick(600, 100, 100, 100, 1);
	new mg_brick(700, 100, 100, 100, 1);
	new mg_brick(700, 200, 100, 100, 1);
	new mg_brick(700, 300, 100, 100, 1);
	new mg_brick(900, 0, 100, 100, 1);
	new mg_brick(900, 100, 100, 100, 1);
	new mg_brick(900, 200, 100, 100, 1);
	new mg_brick(1000, 400, 100, 100, 1);
	new mg_brick(700, 500, 100, 100, 1);
	new mg_brick(600, 400, 100, 100, 1);
	new mg_brick(1000, 200, 100, 100, 1);
	new mg_brick(1000, 100, 100, 100, 1);
	new mg_brick(1000, 0, 100, 100, 1);
	new mg_brick(600, 300, 100, 100, 1);
	new mg_brick(600, 200, 100, 100, 1);
	new mg_brick(600, 500, 100, 100, 1);
	new mg_brick(600, 600, 100, 100, 1);
	new mg_brick(600, 700, 100, 100, 1);
	new mg_brick(700, 600, 100, 100, 1);
	new mg_brick(700, 700, 100, 100, 1);
	new mg_brick(500, 400, 100, 100, 1);
	new mg_brick(800, 700, 100, 100, 1);
	new mg_brick(900, 700, 100, 100, 1);
	new mg_brick(1000, 600, 100, 100, 1);
	new mg_brick(200, 500, 100, 100, 1);
	new mg_brick(1100, 600, 100, 100, 1);
	new mg_brick(1100, 400, 100, 100, 1);
	new mg_brick(1200, 400, 100, 100, 1);
	new mg_brick(1300, 400, 100, 100, 1);
	new mg_brick(1300, 500, 100, 100, 1);
	new mg_brick(1300, 600, 100, 100, 1);
	new mg_brick(1300, 700, 100, 100, 1);
	new mg_brick(1700, 400, 100, 100, 1);
	new mg_brick(1600, 300, 100, 100, 1);
	new mg_brick(1700, 300, 100, 100, 1);
	new mg_brick(1600, 400, 100, 100, 1);
	new mg_brick(1400, 600, 100, 100, 1);
	new mg_brick(1100, 200, 100, 100, 1);
	new mg_brick(1100, 100, 100, 100, 1);
	new mg_brick(1100, 0, 100, 100, 1);
	new mg_brick(1200, 200, 100, 100, 1);
	new mg_brick(1200, 100, 100, 100, 1);
	new mg_brick(1200, 0, 100, 100, 1);
	new mg_brick(1300, 100, 100, 100, 1);
	new mg_brick(1300, 0, 100, 100, 1);
	teleport_station = new mg_teleport_station(1700, 278, 78, 22, 1); 

}
function mg_level4Load() {
	new mg_brick(200, 700, 100, 100, 1); 
	new mg_brick(200, 500, 100, 100, 1);
	new mg_brick(200, 600, 100, 100, 1); 
	new mg_brick(500, 500, 100, 100, 1); 
	new mg_brick(500, 400, 100, 100, 1); 
	new mg_brick(500, 300, 100, 100, 1); 
	new mg_brick(300, 600, 100, 100, 1); 
	new mg_brick(400, 300, 100, 100, 1); 
	new mg_brick(200, 200, 100, 100, 1); 
	new mg_brick(200, 100, 100, 100, 1); 
	new mg_brick(200, 0, 100, 100, 1); 
	new mg_brick(300, 0, 100, 100, 1); 
	new mg_brick(400, 0, 100, 100, 1); 
	new mg_brick(500, 0, 100, 100, 1); 
	new mg_brick(600, 0, 100, 100, 1); 
	new mg_brick(700, 0, 100, 100, 1); 
	new mg_brick(600, 300, 100, 100, 1); 
	new mg_brick(700, 400, 100, 100, 1); 
	new mg_brick(700, 300, 100, 100, 1); 
	new mg_brick(700, 500, 100, 100, 1); 
	new mg_brick(700, 600, 100, 100, 1); 
	new mg_brick(700, 700, 100, 100, 1); 
	new mg_brick(800, 300, 100, 100, 1); 
	new mg_brick(900, 300, 100, 100, 1); 
	new mg_brick(900, 400, 100, 100, 1); 
	new mg_brick(900, 500, 100, 100, 1); 
	new mg_brick(900, 600, 100, 100, 1); 
	new mg_brick(900, 700, 100, 100, 1); 
	new mg_brick(1000, 300, 100, 100, 1); 
	new mg_brick(1100, 300, 100, 100, 1); 
	new mg_brick(1100, 400, 100, 100, 1); 
	new mg_brick(1100, 500, 100, 100, 1); 
	new mg_brick(1100, 600, 100, 100, 1); 
	new mg_brick(1100, 600, 100, 100, 1); 
	new mg_brick(1100, 700, 100, 100, 1); 
	new mg_brick(1500, 300, 100, 100, 1); 
	new mg_brick(800, 0, 100, 100, 1); 
	new mg_brick(900, 0, 100, 100, 1); 
	new mg_brick(1000, 0, 100, 100, 1); 
	new mg_brick(1100, 0, 100, 100, 1); 
	new mg_brick(1200, 0, 100, 100, 1); 
	new mg_brick(1300, 0, 100, 100, 1); 
	new mg_brick(1400, 0, 100, 100, 1); 
	new mg_brick(1500, 0, 100, 100, 1); 
	new mg_sand(1300, 400, 100, 100, 1); 
	new mg_brick(1200, 700, 100, 100, 1); 
	new mg_brick(1400, 600, 100, 100, 1); 
	new mg_brick(1600, 700, 100, 100, 1); 
	new mg_brick(1900, 300, 100, 100, 1); 
	new mg_brick(1800, 600, 100, 100, 1); 
	new mg_brick(1600, 500, 100, 100, 1); 
	new mg_brick(1500, 500, 100, 100, 1); 
	new mg_brick(1700, 500, 100, 100, 1); 
	new mg_brick(100, 700, 100, 100, 1); 
	new mg_brick(0, 700, 100, 100, 1); 
	new mg_brick(-100, 700, 100, 100, 1); 
	new mg_brick(-100, 600, 100, 100, 1); 
	new mg_brick(0, 600, 100, 100, 1); 
	new mg_brick(100, 600, 100, 100, 1); 
	new mg_brick(100, 500, 100, 100, 1); 
	new mg_brick(0, 500, 100, 100, 1); 
	new mg_brick(-100, 500, 100, 100, 1); 
	new mg_brick(-100, 400, 100, 100, 1); 
	new mg_brick(-100, 300, 100, 100, 1); 
	new mg_brick(100, 300, 100, 100, 1); 
	new mg_brick(100, 400, 100, 100, 1); 
	new mg_brick(100, 200, 100, 100, 1); 
	new mg_brick(0, 200, 100, 100, 1); 
	new mg_brick(-100, 200, 100, 100, 1); 
	new mg_sand(0, 400, 100, 100, 1); 
	new mg_sand(0, 300, 100, 100, 1); 
	new mg_brick(100, 400, 100, 100, 1); 
	new mg_brick(0, 400, 100, 100, 1); 
	new mg_brick(-100, 400, 100, 100, 1); 
	new mg_brick(100, 100, 100, 100, 1); 
	new mg_brick(100, 0, 100, 100, 1); 
	new mg_brick(0, 0, 100, 100, 1); 
	new mg_brick(-100, 0, 100, 100, 1); 
	new mg_brick(-100, 100, 100, 100, 1); 
	new mg_brick(0, 100, 100, 100, 1); 
	new mg_brick(1500, 400, 100, 100, 1); 
	new mg_sand(2200, 300, 100, 100, 1); 
	new mg_sand(2600, 300, 100, 100, 1); 
	new mg_sand(2900, 300, 100, 100, 1); 
	new mg_sand(3000, 300, 100, 100, 1); 
	new mg_sand(3000, 400, 100, 100, 1); 
	new mg_brick(3000, 300, 100, 100, 1); 
	new mg_brick(3000, 400, 100, 100, 1); 
	new mg_brick(3000, 500, 100, 100, 1); 
	new mg_brick(3000, 600, 100, 100, 1); 
	new mg_brick(3000, 700, 100, 100, 1); 
	new mg_brick(3100, 300, 100, 100, 1); 
	new mg_brick(3200, 300, 100, 100, 1); 
	new mg_brick(3200, 400, 100, 100, 1); 
	new mg_brick(3200, 500, 100, 100, 1); 
	new mg_brick(3200, 600, 100, 100, 1); 
	new mg_brick(3200, 700, 100, 100, 1); 
	new mg_brick(3400, 700, 100, 100, 1); 
	new mg_brick(3400, 600, 100, 100, 1); 
	new mg_brick(3400, 500, 100, 100, 1); 
	new mg_brick(3400, 400, 100, 100, 1); 
	new mg_brick(3400, 300, 100, 100, 1); 
	new mg_brick(3400, 200, 100, 100, 1); 
	new mg_brick(3500, 200, 100, 100, 1); 
	new mg_brick(3500, 300, 100, 100, 1); 
	new mg_brick(3500, 400, 100, 100, 1); 
	new mg_brick(3500, 500, 100, 100, 1); 
	new mg_brick(3500, 600, 100, 100, 1); 
	new mg_brick(3500, 700, 100, 100, 1); 
	new mg_brick(3600, 200, 100, 100, 1); 
	new mg_brick(3600, 300, 100, 100, 1); 
	new mg_brick(3600, 400, 100, 100, 1); 
	new mg_brick(3600, 500, 100, 100, 1); 
	new mg_brick(3600, 600, 100, 100, 1); 
	new mg_brick(3600, 700, 100, 100, 1); 
	new mg_teleport_station(3500, 100, 78, 22, 1); 

}
function mg_terrain(x, y, width, height, level) {
	
	this.level = level;
	this.image = new Image();
	this.x = x;
	this.initialX = x;
	this.y = y;
	this.speedX = 0;
	this.speedY = 0;
	this.width = width;
	this.height = height;
//	if (game.edit == 0) {
		mg_level.push(this);	
//	}
}
mg_terrain.prototype.redrawTerrain = function() {
	ctx = multiGames_area.context;
	ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
}
mg_terrain.updateTerrain = function() {
	mg_level.forEach(function(terrain) {
		if (terrain.level == 0) { //for level editing only
			terrain.x = tempObjX;
			terrain.y = tempObjY;
			terrain.redrawTerrain();
		}
		else if (terrain.level == 1) {
			terrain.x = terrain.initialX - mg_player1.absoluteX;
			terrain.y += terrain.speedY;
			terrain.redrawTerrain();
		}
		if (terrain.constructor.name == "mg_sand") {
			terrain.fall();
		}
	})
}	
function mg_brick(x, y, width, height, level) {
	mg_terrain.call(this, x, y, width, height, level);
	this.image.src = "Sprites/brick.png";
}
mg_brick.prototype = Object.create(mg_terrain.prototype);
mg_brick.prototype.constructor = mg_brick;

function mg_sand(x, y, width, height, level) {
	mg_terrain.call(this, x, y, width, height, level);
	this.image.src = "Sprites/sand.png";
	
	this.fall = function() {
		
		if (mg_player1.x + mg_player1.width > this.x && mg_player1.x < this.x + this.width && mg_player1.y < this.y + this.height && mg_player1.y + mg_player1.height == this.y) {
			var thing = this;
			setTimeout(function() {
				thing.speedY = 5;
			}, 100);
		}
	}
}
mg_sand.prototype = Object.create(mg_terrain.prototype);
mg_sand.prototype.constructor = mg_sand;


function mg_edit(x, y, width, height, level) {
	mg_terrain.call(this, x, y, width, height, level);
	this.image.src = "Sprites/leveledit.png";
}
mg_edit.prototype = Object.create(mg_terrain.prototype);
mg_edit.prototype.constructor = mg_edit;

function mg_teleport_station(x, y, width, height, level) {
	mg_terrain.call(this, x, y, width, height, level);
	this.image.src = "Sprites/teleport_station.png";
}
mg_teleport_station.prototype = Object.create(mg_terrain.prototype);
mg_teleport_station.prototype.constructor = mg_teleport_station;

function mg_teleport(color, x, y, width, height) {
	this.image = new Image();
	this.image.src = color;
	this.x = teleport_station.x;
	this.y = y;
	this.speedX = 0;
	this.speedY = 0;
	this.width = width;
	this.height = height;
	this.moveTeleport = function() {
		if (teleportMove == 0) {
			this.speedX = 0;
			this.speedY = 0;
		}
		else if (teleportMove == 1) {
			this.speedX = 0;
			this.speedY = 10;
			mg_player1.x = this.x;
		}
		else if (teleportMove == 2) {
			this.speedX = 0;
			this.speedY = -10;
		}
		this.x += this.speedX;
		this.y += this.speedY;
		ctx = multiGames_area.context;
		ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
	}
}

mg_teleport.updateTeleport = function() {
	if (typeof teleport != "undefined") {
		teleport.moveTeleport();
		if (teleport.y + teleport.height <= 0) {
			mg_level = [];
			delete teleport;
		}
	}
}
function mg_refreshCanvas() { //reloads everything drawn in the canvas
	multiGames_area.mg_clear();
	mg_background.updateBackground();
	mg_terrain.updateTerrain();
	mg_enemy.updateEnemy();
	mg_player.updatePlayer();
	//multiGames_area.textAnimation();
	if (typeof teleport != "undefined") {
		mg_teleport.updateTeleport();
	}
}