/* eslint-disable no-undef */
export default class User {
	constructor(game) {
		this.game = game;
		this.images = [];
		this.score = 0;
		this.validateLoginToken();

		this.profileButton = document.getElementById('user-profile');
		this.profileButton.owner = this;
		this.profileButton.onclick = this.profileButton.owner.userProfileButtonClickHandler;

		this.signInOrRegister = document.getElementById('sign-in-or-register');

		this.signInButton = document.getElementById('sign-in-btn');
		this.signInButton.owner = this;
		this.signInButton.onclick = this.signInButton.owner.signInButtonClickHandler;

		this.signInForm = document.getElementById('sign-in-form');
		this.signInFormSection = document.getElementById('sign-in-form-section');
		this.signInUsername = document.getElementById('sign-in-username');
		this.signInPassword = document.getElementById('sign-in-password');
		this.signInError = document.getElementById('sign-in-error');
		
		this.registerButton = document.getElementById('register-btn');
		this.registerButton.owner = this;
		this.registerButton.onclick = this.registerButton.owner.registerButtonClickHandler;

		this.registerForm = document.getElementById('register-form');
		this.registerFormSection = document.getElementById('register-form-section');
		this.registerEmail = document.getElementById('register-email');
		this.registerUsername = document.getElementById('register-username');
		this.registerPassword = document.getElementById('register-password');
		this.registerError = document.getElementById('register-error');

		this.loggedInInfoSection = document.getElementById('logged-in-info-section');
		this.loggedInUsername = document.getElementById('logged-in-username');
		this.signOutButton = document.getElementById('sign-out-btn');
		this.signOutButton.owner = this;
		this.signOutButton.onclick = this.signOutButton.owner.signOutButtonClickHandler;

		this.signInForm.addEventListener('submit', (e) => {
			e.preventDefault();
			let messages = [];

			// show any validation errors
			if (messages.length > 0) {
				this.signInError.innerText = messages.join('\n');
			} else {
				let headers = {
					'Content-Type': 'application/json'
				};
				let body = {
					username: this.signInUsername.value,
					password: this.signInPassword.value
				};
				// post request to login api
				this.game.util.request('POST', '/api/login', headers, body).then(res => {
					console.log(res);
					if (!res.ok) {
						messages.push(res.data.replace(/error: /gi, ''));
						this.signInError.innerText = messages.join('\n');
					} else {
						window.sessionStorage.setItem('loginToken', res.data.token);
						this.isLoggedIn = true;
						this.hideSignInForm();
						this.username = this.signInUsername.value;
						this.loggedInUsername.innerText = this.username;
					}
				}).catch(err => console.log(err));
			}
		});

		this.registerForm.addEventListener('submit', (e) => {
			e.preventDefault();
			let messages = [];

			if (!this.game.util.isAlphaNumeric(this.registerUsername.value)) {
				messages.push('username must be alphanumeric only');
			}

			if (this.registerUsername.value.length < 3) {
				messages.push('username must be at least 3 characters');
			}

			if (this.registerPassword.value.length < 8) {
				messages.push('password must be at least 8 characters');
			}

			// show any validation errors
			if (messages.length > 0) {
				this.registerError.innerText = messages.join('\n');
			} else {
				let headers = {
					'Content-Type': 'application/json'
				};
				let body = {
					email: this.registerEmail.value,
					username: this.registerUsername.value,
					password: this.registerPassword.value
				};
				// post request to register api
				this.game.util.request('POST', '/api/register', headers, body).then(res => {
					console.log(res);
					if (!res.ok) {
						messages.push(res.data.replace(/error: /gi, ''));
						this.registerError.innerText = messages.join('\n');
					} else {
						window.sessionStorage.setItem('loginToken', res.data.token);
						this.isLoggedIn = true;
						this.hideRegisterForm();
						this.username = this.registerUsername.value;
						this.loggedInUsername.innerText = this.username;
					}
				}).catch(err => console.log(err));
			}
		});
	}

	init() {
		this.setProfileButtonPosition();
	}

	validateLoginToken() {
		let loginToken = window.sessionStorage.getItem('loginToken');

		if (loginToken) {
			let headers = {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${loginToken}`
			};
			let body = {};
			this.game.util.request('POST', '/api/validate', headers, body).then(res => {
				if (!res.ok) {
					console.log(res);
				} else {
					console.log(res);
					this.isLoggedIn = true;
					this.username = res.data.username;
					this.loggedInUsername.innerText = this.username;
					this.score = res.data.score;
				}
			}).catch(err => console.log(err));
		} else {
			this.isLoggedIn = false;
		}
	}

	loadAssets() {
		this.logged_in = this.game.util.loadImage('/img/logged_in.png', this);
		this.logged_out = this.game.util.loadImage('/img/logged_out.png', this);
	}

	setProfileButtonPosition() {
		let leftEdgeX = this.game.gameWidth > window.innerWidth ? (Math.floor((this.game.gameWidth - window.innerWidth) / 2.0)) : 0;
		let topEdgeY = this.game.gameHeight > window.innerHeight ? (Math.floor((this.game.gameHeight - window.innerHeight) / 2.0)) : 0;
		let cornerOffset = 2;
		this.x = leftEdgeX + cornerOffset;
		this.y = topEdgeY + cornerOffset;
		this.profileButton.style.top = cornerOffset + 'px';
		this.profileButton.style.left = cornerOffset + 'px';
	}

	userProfileButtonClickHandler() {
		if (!this.owner.isLoggedIn) {
			if (this.owner.signInOrRegister.style.display == 'block') {
				this.owner.hideSignInOrRegister();
			} else {
				this.owner.showSignInOrRegister();
			}

			if (this.owner.signInFormSection.style.display == 'block') {
				this.owner.hideSignInForm();
				this.owner.hideSignInOrRegister();
			}

			if (this.owner.registerFormSection.style.display == 'block') {
				this.owner.hideRegisterForm();
				this.owner.hideSignInOrRegister();
			}
		} else {
			if (this.owner.loggedInInfoSection.style.display == 'block') {
				this.owner.hideLoggedInInfo();
			} else {
				this.owner.showLoggedInInfo();
			}
			
		}
	}

	signInButtonClickHandler() {
		this.owner.signInOrRegister.style.display = 'none';
		this.owner.signInFormSection.style.display = 'block';
		this.owner.signInUsername.value = '';
		this.owner.signInPassword.value = '';
		this.owner.signInError.innerText = '';
	}

	registerButtonClickHandler() {
		this.owner.signInOrRegister.style.display = 'none';
		this.owner.registerFormSection.style.display = 'block';
		this.owner.registerEmail.value = '';
		this.owner.registerUsername.value = '';
		this.owner.registerPassword.value = '';
		this.owner.registerError.innerText = '';
	}

	signOutButtonClickHandler() {
		window.sessionStorage.removeItem('loginToken');
		this.owner.loggedInUsername.innerText = '';
		this.owner.username = null;
		this.owner.isLoggedIn = false;
		this.owner.hideLoggedInInfo();
	}

	showSignInForm() {
		this.signInFormSection.style.display = 'block';
	}

	hideSignInForm() {
		this.signInFormSection.style.display = 'none';
	}

	showRegisterForm() {
		this.registerFormSection.style.display = 'block';
	}

	hideRegisterForm() {
		this.registerFormSection.style.display = 'none';
	}

	showSignInOrRegister() {
		this.signInOrRegister.style.display = 'block';
	}

	hideSignInOrRegister() {
		this.signInOrRegister.style.display = 'none';
	}

	showLoggedInInfo() {
		this.loggedInInfoSection.style.display = 'block';
	}

	hideLoggedInInfo() {
		this.loggedInInfoSection.style.display = 'none';
	}

	draw(ctx) {
		ctx.drawImage(this.isLoggedIn ? this.logged_in : this.logged_out, this.x, this.y);
	}
}