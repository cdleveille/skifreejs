export default class GameObject {
	constructor(game, x, y, hbWidth, hbHeight, type, img) {
		this.game = game;
		this.x = x;
		this.y = y;
		this.hbWidth = hbWidth;
		this.hbHeight = hbHeight;
		this.type = type;
		this.img = img;
	}

	update() {
		// update position based on x/y-velocity of skier


		// check for collisions with skier

	}

	draw() {

	}
}