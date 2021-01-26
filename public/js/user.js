/* eslint-disable no-undef */
export default class User {
	constructor(game) {
		this.game = game;
		this.images = [];
		this.isLoggedIn = false;

		this.profileButton = document.getElementById('user-profile');
		this.profileButton.owner = this;
		this.profileButton.onclick = this.profileButton.owner.userProfileButtonClickHandler;

		this.signInOrRegister = document.getElementById('sign-in-or-register');

		this.signInButton = document.getElementById('sign-in-btn');
		this.signInButton.owner = this;
		this.signInButton.onclick = this.signInButton.owner.signInButtonClickHandler;

		this.signInForm = document.getElementById('sign-in-form');
		this.signInFormFields = document.getElementById('sign-in-form-fields');
		this.signInUsername = document.getElementById('sign-in-username');
		this.signInPassword = document.getElementById('sign-in-password');
		this.signInError = document.getElementById('sign-in-error');
		
		this.registerButton = document.getElementById('register-btn');
		this.registerButton.owner = this;
		this.registerButton.onclick = this.registerButton.owner.registerButtonClickHandler;

		this.registerForm = document.getElementById('register-form');
		this.registerFormFields = document.getElementById('register-form-fields');
		this.registerEmail = document.getElementById('register-email');
		this.registerUsername = document.getElementById('register-username');
		this.registerPassword = document.getElementById('register-password');
		this.registerError = document.getElementById('register-error');

		this.signInForm.addEventListener('submit', (e) => {
			let messages = [];
			messages.push('Coming soon!');

			if (messages.length > 0) {
				e.preventDefault();
				this.signInError.innerText = messages.join('\n');
			}
		});

		this.registerForm.addEventListener('submit', (e) => {
			let messages = [];
			messages.push('Coming soon!');

			if (messages.length > 0) {
				e.preventDefault();
				this.registerError.innerText = messages.join('\n');
			}
		});
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
		let cornerOffset = 2;
		this.x = leftEdgeX + cornerOffset;
		this.y = topEdgeY + cornerOffset;
		this.profileButton.style.top = cornerOffset + 'px';
		this.profileButton.style.left = cornerOffset + 'px';
	}

	userProfileButtonClickHandler() {
		if (!this.isLoggedIn) {
			if (this.owner.signInOrRegister.style.display == 'block') {
				this.owner.hideSignInOrRegister();
			} else {
				this.owner.showSignInOrRegister();
			}

			if (this.owner.signInFormFields.style.display == 'block') {
				this.owner.hideSignInForm();
				this.owner.hideSignInOrRegister();
			}

			if (this.owner.signInFormFields.style.display == 'block') {
				this.owner.hideSignInForm();
				this.owner.hideSignInOrRegister();
			}

			if (this.owner.registerFormFields.style.display == 'block') {
				this.owner.hideRegisterForm();
				this.owner.hideSignInOrRegister();
			}
		}
	}

	signInButtonClickHandler() {
		this.owner.signInOrRegister.style.display = 'none';
		this.owner.signInFormFields.style.display = 'block';
		this.owner.signInUsername.value = '';
		this.owner.signInPassword.value = '';
		this.owner.signInError.innerText = '';
	}

	registerButtonClickHandler() {
		this.owner.signInOrRegister.style.display = 'none';
		this.owner.registerFormFields.style.display = 'block';
		this.owner.registerEmail.value = '';
		this.owner.registerUsername.value = '';
		this.owner.registerPassword.value = '';
		this.owner.registerError.innerText = '';
	}

	showSignInForm() {
		this.signInFormFields.style.display = 'block';
	}

	hideSignInForm() {
		this.signInFormFields.style.display = 'none';
	}

	showRegisterForm() {
		this.registerFormFields.style.display = 'block';
	}

	hideRegisterForm() {
		this.registerFormFields.style.display = 'none';
	}

	showSignInOrRegister() {
		this.signInOrRegister.style.display = 'block';
	}

	hideSignInOrRegister() {
		this.signInOrRegister.style.display = 'none';
	}

	draw(ctx) {
		ctx.drawImage(this.isLoggedIn ? this.logged_in : this.logged_out, this.x, this.y);
	}
}