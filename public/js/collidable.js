export default class Collidable {
	constructor(game, x, y, hbXOffset, hbYOffset, hbW, hbH, onCollision, img) {
		this.game = game;
		this.x = x;
		this.y = y;
		this.hitbox = { xOffset: hbXOffset, yOffset: hbYOffset, width: hbW, height: hbH };
		this.hasCollided = false;
		this.onCollision = onCollision;
		this.img = img;
	}

	isCollidingWithSkier() {
		let rect1 = this.game.skier.hitbox;
		let rect2 = { x: this.x + this.hitbox.xOffset, y: this.y + this.hitbox.yOffset, width: this.hitbox.width, height: this.hitbox.height };

		return this.game.util.areRectanglesColliding(rect1, rect2);
	}

	update(step) {
		if (this.isCollidingWithSkier() && !this.hasCollided && this.game.skier.jumpOffset < this.img.height && this.game.collisionsEnabled) {
			this.hasCollided = true;
			this.onCollision();
		}

		this.x -= this.game.skier.xv * step;
		this.y -= this.game.skier.yv * step;
	}

	draw(ctx) {
		ctx.drawImage(this.img, this.game.skier.x + this.x, this.game.skier.y + this.y);
	}
}