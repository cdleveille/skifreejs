/* eslint-disable no-undef */
export default class User {
	constructor(game) {
		this.game = game;
		this.images = [];
		this.leaderboardScoreCount = 10;
		this.getHTMLElements();
		this.validateLoginToken();
		this.createFormSubmitEventListeners();
		this.refreshLeaderboard(this.leaderboardScoreCount);
	}

	loadAssets() {
		this.logged_in = this.game.util.loadImage('/img/logged_in.png', this);
		this.logged_out = this.game.util.loadImage('/img/logged_out.png', this);
		this.crown = this.game.util.loadImage('/img/crown.png', this);
	}

	// authenticate the current locally-stored login token with the server, which responds with user data
	validateLoginToken() {
		let loginToken = window.localStorage.getItem('loginToken');

		if (loginToken) {
			let headers = {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${loginToken}`
			};
			let body = {};
			let method = 'POST', route = '/api/validate';
			this.game.util.request(method, route, headers, body).then(res => {
				console.log(method, route, res);
				if (res.ok) {
					this.userData = res.data;
					this.loggedInUsername.innerText = this.userData.username + ' ' + this.userData.score;
					this.profileImage.src = this.logged_in.src;
					this.isLoggedIn = true;
				}
			}).catch(err => console.log(err));
		} else {
			this.isLoggedIn = false;
		}
	}

	getHTMLElements() {
		this.userSection = document.getElementById('user-section');
		this.profileImage = document.getElementById('user-profile-img');
		this.profileButton = document.getElementById('user-profile-btn');
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
		this.signOutButton.onclick = this.signOutButton.owner.signOut;

		this.leaderboardButtonSignedIn = document.getElementById('leaderboard-btn-signed-in');
		this.leaderboardButtonSignedIn.owner = this;
		this.leaderboardButtonSignedIn.onclick = this.leaderboardButtonSignedInClickHandler;
		this.leaderboardButtonSignedIn.innerText = 'Top ' + this.leaderboardScoreCount;
		this.leaderboardSignedIn = document.getElementById('leaderboard-signed-in');

		this.leaderboardButtonSignedOut = document.getElementById('leaderboard-btn-signed-out');
		this.leaderboardButtonSignedOut.owner = this;
		this.leaderboardButtonSignedOut.onclick = this.leaderboardButtonSignedOutClickHandler;
		this.leaderboardButtonSignedOut.innerText = 'Top ' + this.leaderboardScoreCount;
		this.leaderboardSignedOut = document.getElementById('leaderboard-signed-out');
	}

	createFormSubmitEventListeners() {
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
				let method = 'POST', route = '/api/login';
				this.game.util.request(method, route, headers, body).then(res => {
					console.log(method, route, res);
					if (res.ok) {
						window.localStorage.setItem('loginToken', res.data.token);
						this.validateLoginToken();
						this.hideSignInForm();
					} else {
						messages.push(res.data.replace(/error: /gi, ''));
						this.signInError.innerText = messages.join('\n');
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
			} else if (this.registerUsername.value.length > 16) {
				messages.push('username must be no more than 16 characters');
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
				let method = 'POST', route = '/api/register';
				this.game.util.request(method, route, headers, body).then(res => {
					console.log(method, route, res);
					if (res.ok) {
						window.localStorage.setItem('loginToken', res.data.token);
						this.validateLoginToken();
						this.hideRegisterForm();
					} else {
						messages.push(res.data.replace(/error: /gi, ''));
						this.registerError.innerText = messages.join('\n');
					}
				}).catch(err => console.log(err));
			}
		});
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
			this.owner.leaderboardSignedOut.innerHTML = '';
		} else {
			if (this.owner.loggedInInfoSection.style.display == 'block') {
				this.owner.hideLoggedInInfo();
			} else {
				this.owner.showLoggedInInfo();
			}
			this.owner.leaderboardSignedIn.innerHTML = '';
		}
	}

	signInButtonClickHandler() {
		this.owner.signInOrRegister.style.display = 'none';
		this.owner.signInFormSection.style.display = 'block';
		this.owner.signInUsername.value = '';
		this.owner.signInPassword.value = '';
		this.owner.signInError.innerText = '';
		this.owner.signInUsername.focus();
	}

	registerButtonClickHandler() {
		this.owner.signInOrRegister.style.display = 'none';
		this.owner.registerFormSection.style.display = 'block';
		this.owner.registerEmail.value = '';
		this.owner.registerUsername.value = '';
		this.owner.registerPassword.value = '';
		this.owner.registerError.innerText = '';
		this.owner.registerEmail.focus();
	}

	leaderboardButtonSignedInClickHandler() {
		if (this.owner.leaderboardSignedIn.innerHTML == '') {
			this.owner.refreshLeaderboard(this.owner.leaderboardScoreCount);
		} else {
			this.owner.leaderboardSignedIn.innerHTML = '';
		}
	}

	leaderboardButtonSignedOutClickHandler() {
		if (this.owner.leaderboardSignedOut.innerHTML == '') {
			this.owner.refreshLeaderboard(this.owner.leaderboardScoreCount);
		} else {
			this.owner.leaderboardSignedOut.innerHTML = '';
		}
	}

	refreshLeaderboard(numToRetrieve) {
		let headers = {
			'Content-Type': 'application/json'
		};
		let body = {};
		let method = 'GET', route = '/api/leaderboard/' + numToRetrieve;
		this.game.util.request(method, route, headers, body).then(res => {
			console.log(method, route, res);

			if (res.ok) {
				let html = '<ol>';
				for (let i = 0; i < res.data.length; i++) {
					let username = res.data[i].username, score = res.data[i].score, crownImg = '';
					if (i == 0) {
						crownImg = ' <img src="' + this.crown.src + '">' ;
					}
					html += '<li>' + username + ' ' + score + crownImg + '</li>';
				}

				let numToLeaveBlank = numToRetrieve - res.data.length;
				for (let i = 0; i < numToLeaveBlank; i ++) {
					html += '<li></li>';
				}

				html += '</ol>';
				this.isLoggedIn ? this.leaderboardSignedIn.innerHTML = html : this.leaderboardSignedOut.innerHTML = html;
			}
		}).catch(err => console.log(err));
	}

	signOut() {
		window.localStorage.removeItem('loginToken');
		this.owner.loggedInUsername.innerText = '';
		this.owner.leaderboardSignedIn.innerHTML = '';
		this.owner.leaderboardSignedOut.innerHTML = '';
		this.owner.isLoggedIn = false;
		this.owner.hideLoggedInInfo();
		this.owner.profileImage.src = this.owner.logged_out.src;
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

	isTextInputActive() {
		return this.signInUsername === document.activeElement || this.signInPassword === document.activeElement ||
			this.registerUsername === document.activeElement || this.registerPassword === document.activeElement ||
			this.registerEmail === document.activeElement;
	}
}