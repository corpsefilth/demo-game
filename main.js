// We create our only state, called 'mainState'
var mainState = {
	
	// We define the 3 default Phaser functions
	
	preload: function() {
		// This function will be executed at the beginning
		// That's where we load the game's assets
		
		// loading our player
		/****************************
		*	game.load.image(imageName, imagePath)
		*		imageName: the new name that will be used to reference the image
		*		imagePath: the path to the image
		****************************************************************/
		game.load.image('player', 'assets/player.png');
		
		// load our world walls
		game.load.image('wallV', 'assets/wallVertical.png');
		game.load.image('wallH', 'assets/wallHorizontal.png');
		
		// load our coin
		game.load.image('coin', 'assets/coin.png');
		
		// load our enemy
		game.load.image('enemy', 'assets/enemy.png');
	},
	
	create: function() {
		// This function is called after the preload function
		// Here we set up the game, display sprites, etc.
		
		// stage bg color
		game.stage.backgroundColor = '#3498db';
		
		// set up our physics engine
		game.physics.startSystem(Phaser.Physics.ARCADE);
		
		/************
		*  game.add.sprite(positionX, positionY, imageName)
		*   	positionX: horizontal position of the sprite
		*		positionY: vertical position of the sprite
		*		imageName: the name of the image, as defined in the preload function
		*
		*  local variable: var player = 
		*  state variable: this.player =
		******************************************************************************/
		this.player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');
		
		// set the anchor of the sprite at the middle of the sprite
		this.player.anchor.setTo(0.5, 0.5);
		
		// Tell Phaser that the player will use the Arcade Physics engine
		game.physics.arcade.enable(this.player);
		
		// Add vertical gravity to the player
		this.player.body.gravity.y = 500;
		
		// add some controls to the game
		this.cursor = game.input.keyboard.createCursorKeys();
		
		// set up the walls
		this.createWorld();
		
		// Display the coin
		this.coin = game.add.sprite(60, 140, 'coin');
		
		// Add Arcade physics to the coin
		game.physics.arcade.enable(this.coin);
		
		// Set the anchor point of the coin to its center
		this.coin.anchor.setTo(0.5, 0.5);
		
		/******************************
		*	game.add.text(positionX, positionY, text, style)
		*		positionX: position x of the text
		*		positionY: position y of the text
		*		text: text to display
		*		style: style of the text
		*********************************************************/
		// Display the score
		this.scoreLabel = game.add.text(30, 30, 'score: 0', { font: '18px Arial', fill: '#ffffff' });
		
		// Initialize the score variable
		this.score = 0;
		
		// Create an enemy group with Arcade physics
		this.enemies = game.add.group();
		this.enemies.enableBody = true;
		
		// Create 10 enemies with the 'enemy' image in the group
		// The enemies are "dead" by default, so they are not visible in the game
		this.enemies.createMultiple(10, 'enemy');
		
		/*************************************
		*	game.time.events.loop(delay, callback, callbackContext)
		*		delay: the delay in ms between each ‘callback’
		*		callback: the function that will be called
		*		callbackContext: the context in which to run the ‘callback’, most of the time it will
		*			be 'this'
		***********************************************/
		// Call 'addEnemy' every 2.2 seconds
		game.time.events.loop(2200, this.addEnemy, this);
	},
	
	update: function() {
		// This function is called 60 times per second
		// It contains the game's login
		
		// Tell Phaser that the player and the walls should collide
		game.physics.arcade.collide(this.player, this.walls);
		
		// move player
		this.movePlayer();
		
		// check if player died
		if (!this.player.inWorld) {
			this.playerDie();
		}
		
		/******************************
		*	game.physics.arcade.overlap(objectA, objectB, callback,
		*								processCallback, callbackContext)
		*	objectA: the first object to check
		*	objectB: the second object to check
		*	callback: the function that gets called when the 2 objects overlap
		*	processCallback: if this is set then 'callback' will only be called if ‘processCallback’
		*		returns true
		*	callbackContext: the context in which to run the 'callback', most of the time it will
		*		be 'this'
		******************************************************************/
		game.physics.arcade.overlap(this.player, this.coin, this.takeCoin, null, this);
		
		// Make the enemies and walls collide
		game.physics.arcade.collide(this.enemies, this.walls);
		
		// Call the 'playerDie' function when the player and an enemy overlap
		game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
	},
	
	// Here we add some of our own functions
	
	// move player 
	movePlayer: function() {
		// if the left arrow key is pressed
		if (this.cursor.left.isDown) {
			// Move player to the left
			this.player.body.velocity.x = -200;
		}
		
		// if the right arrow is pressed
		else if (this.cursor.right.isDown) {
			// Move the player to the right
			this.player.body.velocity.x = 200;
		}
		
		// if neither the right or left key is pressed
		else {
			// Stop the player
			this.player.body.velocity.x = 0;
		}
		
		// if the up arrow key is pressed and the player is touching the ground
		if (this.cursor.up.isDown && this.player.body.touching.down) {
			// Move the player upward (jump)
			this.player.body.velocity.y = -320;
		}
	},
	
	// our world walls
	createWorld: function() {
		// Create our wall group with Arcade Physics
		this.walls = game.add.group();
		this.walls.enableBody = true;
		
		// Create the 10 walls
		game.add.sprite(0, 0, 'wallV', 0, this.walls); // Left
		game.add.sprite(480, 0, 'wallV', 0, this.walls); // Right
		
		game.add.sprite(0, 0, 'wallH', 0, this.walls); // Top left
		game.add.sprite(300, 0, 'wallH', 0, this.walls); // Top right
		game.add.sprite(0, 320, 'wallH', 0, this.walls); // Bottom left
		game.add.sprite(300, 320, 'wallH', 0, this.walls); // Bottom right
		
		game.add.sprite(-100, 160, 'wallH', 0, this.walls); // Middle left
		game.add.sprite(400, 160, 'wallH', 0, this.walls); // Middle right
		
		var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
		middleTop.scale.setTo(1.5, 1);
		var middleBottom = game.add.sprite(100, 240, 'wallH', 0, this.walls);
		middleBottom.scale.setTo(1.5, 1);
		
		// Set all the walls to be immovable
		this.walls.setAll('body.immovable', true);
	},
	
	// restart game when player dies
	playerDie: function() {
		game.state.start('main');
	},
	
	// take coin
	takeCoin: function(player, coin) {
		// Kill the coin to make it disappear from the game
		// this.coin.kill();
		
		// Increase the score by 5
		this.score += 5;
		
		// Update the score label
		this.scoreLabel.text = 'score: ' + this.score;
		
		// Change the coin position
		this.updateCoinPosition();
	},
	
	// random coin position chooser
	updateCoinPosition: function() {
		// Store all the possible coin positions in an array
		var coinPosition = [
		{x: 140, y: 60}, {x: 360, y: 60}, // Top row
		{x: 60, y: 140}, {x: 440, y: 140}, // Middle row
		{x: 130, y: 300}, {x: 370, y: 300} // Bottom row
		];
		
		// Remove the current coin position from the array
		// Otherwise the coin could appear at the same spot twice in a row
		for (var i = 0; i < coinPosition.length; i++) {
			if (coinPosition[i].x === this.coin.x) {
				coinPosition.splice(i, 1);
			}
		}
		
		// Randomly select a position from the array
		var newPosition = coinPosition[game.rnd.integerInRange(0, coinPosition.length-1)];
			
		// Set the new position of the coin
		this.coin.reset(newPosition.x, newPosition.y);
	},
	
	// add enemy
	addEnemy: function() {
		// Get the first dead enemy of the group
		var enemy = this.enemies.getFirstDead();
		
		// If there isn't any dead enemy, do nothing
		if (!enemy) {
			return;
		}
		
		// Initialize the enemy
		enemy.anchor.setTo(0.5, 1);
		enemy.reset(game.world.centerX, 0);
		enemy.body.gravity.y = 500;
		enemy.body.velocity.x = 100 * Phaser.Math.randomSign();
		enemy.body.bounce.x = 1;
		enemy.checkWorldBounds = true;
		enemy.outOfBoundsKill = true;
	},
	
};

// Create a 500px by 340px game in the 'gameDiv' element of the index.html
var game = new Phaser.Game(500, 340, Phaser.AUTO, 'gameDiv');

// Add the 'mainState' to Phaser, and call it 'main'
game.state.add('main', mainState);

// Start our main state
game.state.start('main');