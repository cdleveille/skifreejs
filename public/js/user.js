/* eslint-disable no-undef */
export default class User {
	constructor(game) {
		this.game = game;
		this.images = [];
		this.button = document.getElementById('userProfile');
		this.button.owner = this;
		//this.button.onclick = this.button.owner.userProfileButtonClickHandler;
		this.isLoggedIn = false;
	}

	init() {
		this.setButtonPosition();
	}

	loadAssets() {
		this.logged_in = this.game.util.loadImage('/img/logged_in.png', this);
		this.logged_out = this.game.util.loadImage('/img/logged_out.png', this);
	}

	setButtonPosition() {
		let leftEdgeX = this.game.gameWidth > window.innerWidth ? (Math.floor((this.game.gameWidth - window.innerWidth) / 2.0)) : 0;
		let topEdgeY = this.game.gameHeight > window.innerHeight ? (Math.floor((this.game.gameHeight - window.innerHeight) / 2.0)) : 0;
		this.x = leftEdgeX + 2;
		this.y = topEdgeY + 2;
		this.button.style.top = 2 + 'px';
		this.button.style.left = 2 + 'px';
	}

	userProfileButtonClickHandler() {
		this.owner.isLoggedIn ? this.owner.logout() : this.owner.login();
	}

	login() {
		this.isLoggedIn = true;
	}

	logout() {
		this.isLoggedIn = false;
	}

	draw(ctx) {
		ctx.drawImage(this.isLoggedIn ? this.logged_in : this.logged_out, this.x, this.y);
	}
}