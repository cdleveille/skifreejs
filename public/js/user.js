/* eslint-disable no-undef */
import socket from './socket.js';
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
		this.logged_in_inverted = this.game.util.loadImage('/img/logged_in_inverted.png', this);
		this.logged_out = this.game.util.loadImage('/img/logged_out.png', this);
		this.logged_out_inverted = this.game.util.loadImage('/img/logged_out_inverted.png', this);
		this.crown = this.game.util.loadImage('/img/crown.png', this);
	}

	getHTMLElements() {
		this.userSection = document.getElementById('user-section');
		this.profileImage = document.getElementById('user-profile-img');
		this.profileButton = document.getElementById('user-profile-btn');
		this.profileButton.onclick = () => { this.profileButton.blur(); this.userProfileButtonClickHandler(); };
		this.profileButton.onmousedown = () => { this.profileImage.src = this.isLoggedIn ? this.logged_in_inverted.src : this.logged_out_inverted.src; };
		this.profileButton.onmouseup = () => { this.profileImage.src = this.isLoggedIn ? this.logged_in.src : this.logged_out.src; };

		this.signInOrRegister = document.getElementById('sign-in-or-register');
		this.signInOrRegisterInfoMessage = document.getElementById('sign-in-or-register-info-message');

		this.signInButton = document.getElementById('sign-in-btn');
		this.signInButton.onclick = () => {this.signInButton.blur(); this.signInButtonClickHandler(); };

		this.signInForm = document.getElementById('sign-in-form');
		this.signInFormSection = document.getElementById('sign-in-form-section');
		this.signInUsername = document.getElementById('sign-in-username');
		this.signInPassword = document.getElementById('sign-in-password');
		this.signInError = document.getElementById('sign-in-error');
		
		this.registerButton = document.getElementById('register-btn');
		this.registerButton.onclick = () => { this.registerButton.blur(); this.registerButtonClickHandler(); };

		this.registerForm = document.getElementById('register-form');
		this.registerFormSection = document.getElementById('register-form-section');
		this.registerEmail = document.getElementById('register-email');
		this.registerUsername = document.getElementById('register-username');
		this.registerPassword = document.getElementById('register-password');
		this.registerError = document.getElementById('register-error');

		this.loggedInInfoSection = document.getElementById('logged-in-info-section');
		this.loggedInUsername = document.getElementById('logged-in-username');

		this.leaderboardButtonSignedIn = document.getElementById('leaderboard-btn-signed-in');
		this.leaderboardButtonSignedIn.onclick = () => { this.leaderboardButtonSignedIn.blur(); this.leaderboardButtonSignedInClickHandler(); };
		this.leaderboardButtonSignedIn.innerText = 'Top ' + this.leaderboardScoreCount;
		this.leaderboardSignedIn = document.getElementById('leaderboard-signed-in');

		this.leaderboardButtonSignedOut = document.getElementById('leaderboard-btn-signed-out');
		this.leaderboardButtonSignedOut.onclick = () => { this.leaderboardButtonSignedOut.blur(); this.leaderboardButtonSignedOutClickHandler(); };
		this.leaderboardButtonSignedOut.innerText = 'Top ' + this.leaderboardScoreCount;
		this.leaderboardSignedOut = document.getElementById('leaderboard-signed-out');

		this.userSettingsImage = document.getElementById('user-settings-img');
		this.userSettingsButton = document.getElementById('user-settings-btn');
		this.userSettingsButton.onclick = () => { this.userSettingsButtonClickHandler(); };

		this.userInfoSection = document.getElementById('user-info-section');
		this.userInfoMessage = document.getElementById('user-info-message');
		this.signOutButton = document.getElementById('sign-out-btn');
		this.signOutButton.onclick = () => { this.signOutButton.blur(); this.signOut(); };

		this.changeEmailButton = document.getElementById('change-email-btn');
		this.changeEmailButton.onclick = () => { this.changeEmailButtonClickHandler(); };
		this.changeEmailForm = document.getElementById('change-email-form');
		this.changeEmailFormSection = document.getElementById('change-email-form-section');
		this.currentEmail = document.getElementById('current-email');
		this.newEmail = document.getElementById('new-email');
		this.changeEmailPassword = document.getElementById('change-email-password');
		this.changeEmailError = document.getElementById('change-email-error');

		this.changeUsernameButton = document.getElementById('change-username-btn');
		this.changeUsernameButton.onclick = () => { this.changeUsernameButtonClickHandler(); };
		this.changeUsernameForm = document.getElementById('change-username-form');
		this.changeUsernameFormSection = document.getElementById('change-username-form-section');
		this.newUsername = document.getElementById('new-username');
		this.changeUsernamePassword = document.getElementById('change-username-password');
		this.changeUsernameError = document.getElementById('change-username-error');

		this.changePasswordButton = document.getElementById('change-password-btn');
		this.changePasswordButton.onclick = () => { this.changePasswordButtonClickHandler(); };
		this.changePasswordForm = document.getElementById('change-password-form');
		this.changePasswordFormSection = document.getElementById('change-password-form-section');
		this.currentPassword = document.getElementById('current-password');
		this.newPassword = document.getElementById('new-password');
		this.changePasswordError = document.getElementById('change-password-error');

		this.forgotPasswordButton = document.getElementById('forgot-password-btn');
		this.forgotPasswordButton.onclick = () => { this.forgotPasswordButtonClickHandler(); };
		this.recoverFormSection = document.getElementById('recover-form-section');
		this.recoverForm = document.getElementById('recover-form');
		this.recoverEmail = document.getElementById('recover-email');
		this.recoverUsername = document.getElementById('recover-username');
		this.recoverError = document.getElementById('recover-error');

		this.chatButton = document.getElementById('chat-btn');
		this.chatButton.onclick = () => { this.chatButtonClickHandler(); };
		this.chatImage = document.getElementById('chat-img');
	}

	// authorize the current locally-stored login token with the server, which responds with user data
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
					if (!this.isLoggedIn) {
						socket.emit('user-connected', this.userData.username);
					}
					this.isLoggedIn = true;
				}
			}).catch(err => console.log(err));
		} else {
			this.isLoggedIn = false;
		}
	}

	createFormSubmitEventListeners() {
		this.signInForm.addEventListener('submit', (e) => {
			e.preventDefault();
			let messages = [];

			let headers = {
				'Content-Type': 'application/json'
			};
			let body = {
				username: this.signInUsername.value,
				password: this.signInPassword.value
			};
			let method = 'POST', route = '/api/login';
			this.game.util.request(method, route, headers, body).then(res => {
				console.log(method, route, res);
				if (res.ok) {
					window.localStorage.setItem('loginToken', res.data.token);
					this.validateLoginToken();
					this.hideSignInForm();
					this.hideLoggedInUsername();
				} else {
					messages.push(res.data.replace(/error: /gi, ''));
					this.signInError.innerText = messages.join('\n');
				}
			}).catch(err => console.log(err));
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
				let method = 'POST', route = '/api/register';
				this.game.util.request(method, route, headers, body).then(res => {
					console.log(method, route, res);
					if (res.ok) {
						window.localStorage.setItem('loginToken', res.data.token);
						this.validateLoginToken();
						this.hideRegisterForm();
						this.hideLoggedInUsername();
					} else {
						messages.push(res.data.replace(/error: /gi, ''));
						this.registerError.innerText = messages.join('\n');
					}
				}).catch(err => console.log(err));
			}
		});

		this.changeEmailForm.addEventListener('submit', (e) => {
			e.preventDefault();
			let messages = [];
			
			let loginToken = window.localStorage.getItem('loginToken');
			if (loginToken) {
				let headers = {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${loginToken}`
				};
				let body = {
					newEmail: this.newEmail.value,
					password: this.changeEmailPassword.value
				};
				let method = 'POST', route = '/api/updateemail';
				this.game.util.request(method, route, headers, body).then(res => {
					console.log(method, route, res);
					if (res.ok) {
						window.localStorage.removeItem('loginToken');
						window.localStorage.setItem('loginToken', res.data.token);
						this.validateLoginToken();
						this.hideChangeEmailFormSection();
						this.showLoggedInUsername();
						this.showUserInfoSection();
						this.userInfoMessage.innerText = 'email updated';
							
					} else {
						messages.push(res.data.replace(/error: /gi, ''));
						this.changeEmailError.innerText = messages.join('\n');
					}
				}).catch(err => console.log(err));
			} else {
				this.isLoggedIn = false;
			}
		});

		this.changeUsernameForm.addEventListener('submit', (e) => {
			e.preventDefault();
			let messages = [];

			if (!this.game.util.isAlphaNumeric(this.newUsername.value)) {
				messages.push('username must be alphanumeric only');
			}

			if (this.newUsername.value.length < 3) {
				messages.push('username must be at least 3 characters');
			} else if (this.newUsername.value.length > 16) {
				messages.push('username must be no more than 16 characters');
			}

			// show any validation errors
			if (messages.length > 0) {
				this.changeUsernameError.innerText = messages.join('\n');
			} else {
				let loginToken = window.localStorage.getItem('loginToken');
				if (loginToken) {
					let headers = {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${loginToken}`
					};
					let body = {
						newUsername: this.newUsername.value,
						password: this.changeUsernamePassword.value
					};
					let method = 'POST', route = '/api/updateusername';
					this.game.util.request(method, route, headers, body).then(res => {
						console.log(method, route, res);
						if (res.ok) {
							window.localStorage.removeItem('loginToken');
							window.localStorage.setItem('loginToken', res.data.token);
							this.validateLoginToken();
							this.hideChangeUsernameFormSection();
							this.showLoggedInUsername();
							this.showUserInfoSection();
							this.userInfoMessage.innerText = 'username updated';
							socket.emit('user-changed-username', this.newUsername.value);
								
						} else {
							messages.push(res.data.replace(/error: /gi, ''));
							this.changeUsernameError.innerText = messages.join('\n');
						}
					}).catch(err => console.log(err));
				} else {
					this.isLoggedIn = false;
				}
			}
		});

		this.changePasswordForm.addEventListener('submit', (e) => {
			e.preventDefault();
			let messages = [];

			if (this.newPassword.value.length < 8) {
				messages.push('new password must be at least 8 characters');
			}
			
			// show any validation errors
			if (messages.length > 0) {
				this.changePasswordError.innerText = messages.join('\n');
			} else {
				let loginToken = window.localStorage.getItem('loginToken');
				if (loginToken) {
					let headers = {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${loginToken}`
					};
					let body = {
						password: this.currentPassword.value,
						newPassword: this.newPassword.value
					};
					let method = 'POST', route = '/api/updatepassword';
					this.game.util.request(method, route, headers, body).then(res => {
						console.log(method, route, res);
						if (res.ok) {
							window.localStorage.removeItem('loginToken');
							window.localStorage.setItem('loginToken', res.data.token);
							this.hideChangePasswordFormSection();
							this.showLoggedInUsername();
							this.showUserInfoSection();
							this.userInfoMessage.innerText = 'password updated';
						} else {
							messages.push(res.data.replace(/error: /gi, ''));
							this.changePasswordError.innerText = messages.join('\n');
						}
					}).catch(err => console.log(err));
				} else {
					this.isLoggedIn = false;
				}
			}
		});

		this.recoverForm.addEventListener('submit', (e) => {
			e.preventDefault();
			let messages = [];

			let headers = {
				'Content-Type': 'application/json'
			};
			let body = {
				email: this.recoverEmail.value,
				username: this.recoverUsername.value
			};
			let method = 'POST', route = '/api/sendrecovery';
			this.game.util.request(method, route, headers, body).then(res => {
				console.log(method, route, res);
				if (res.ok) {
					this.hideRecoverFormSection();
					this.showSignInOrRegister();
					this.signInOrRegisterInfoMessage.innerText = 'recovery email sent';
				} else {
					messages.push(res.data.replace(/error: /gi, ''));
					this.recoverError.innerText = messages.join('\n');
				}
			}).catch(err => console.log(err));
		});
	}

	userProfileButtonClickHandler() {
		if (!this.isLoggedIn) {
			if (this.signInOrRegister.style.display == 'block') {
				this.hideSignInOrRegister();
			} else {
				this.showSignInOrRegister();
			}

			if (this.signInFormSection.style.display == 'block') {
				this.hideSignInForm();
				this.hideSignInOrRegister();
			}

			if (this.registerFormSection.style.display == 'block') {
				this.hideRegisterForm();
				this.hideSignInOrRegister();
			}
			if (this.recoverFormSection.style.display == 'block') {
				this.hideRecoverFormSection();
				this.hideSignInOrRegister();
			}
			this.hideLeaderboardSignedOut();
			
		} else {
			if (this.userSettingsButton.style.display == 'block') {
				this.hideLoggedInUsername();
				this.hideLoggedInInfo();
				this.hideUserSettingsButton();
			} else {
				this.showLoggedInUsername();
				this.showLoggedInInfo();
				this.showUserSettingsButton();
			}
			this.hideUserInfoSection();
			this.hideChangeEmailFormSection();
			this.hideChangeUsernameFormSection();
			this.hideChangePasswordFormSection();
			this.hideLeaderboardSignedIn();
		}
	}

	signInButtonClickHandler() {
		this.signInOrRegister.style.display = 'none';
		this.signInFormSection.style.display = 'block';
		this.signInUsername.value = '';
		this.signInPassword.value = '';
		this.signInError.innerText = '';
		this.signInUsername.focus();
	}

	registerButtonClickHandler() {
		this.signInOrRegister.style.display = 'none';
		this.registerFormSection.style.display = 'block';
		this.registerEmail.value = '';
		this.registerUsername.value = '';
		this.registerPassword.value = '';
		this.registerError.innerText = '';
		this.registerEmail.focus();
	}

	leaderboardButtonSignedInClickHandler() {
		if (this.leaderboardSignedIn.style.display != 'block') {
			this.showLeaderboardSignedIn();
			this.refreshLeaderboard(this.leaderboardScoreCount);
		} else {
			this.hideLeaderboardSignedIn();
		}
	}

	leaderboardButtonSignedOutClickHandler() {
		if (this.leaderboardSignedOut.style.display != 'block') {
			this.showLeaderboardSignedOut();
			this.refreshLeaderboard(this.leaderboardScoreCount);
		} else {
			this.hideLeaderboardSignedOut();
		}
	}

	userSettingsButtonClickHandler() {
		if (this.loggedInInfoSection.style.display == 'block') {
			this.hideLoggedInInfo();
			this.hideLeaderboardSignedIn();
			this.showUserInfoSection();
		} else if (this.userInfoSection.style.display == 'block') {
			this.hideUserInfoSection();
			this.showLoggedInInfo();
		} else if (this.changeEmailFormSection.style.display == 'block' ||
			this.changePasswordFormSection.style.display == 'block' ||
			this.changeUsernameFormSection.style.display == 'block') {
			this.hideChangeEmailFormSection();
			this.hideChangeUsernameFormSection();
			this.hideChangePasswordFormSection();
			this.showUserInfoSection();
		}
	}

	changeEmailButtonClickHandler() {
		this.hideLoggedInInfo();
		this.hideUserInfoSection();
		this.showChangeEmailFormSection();
		this.currentEmail.innerText = this.userData.email;
		this.newEmail.value = '';
		this.changeEmailPassword.value = '';
		this.changeEmailError.innerText = '';
		this.newEmail.focus();
	}

	changeUsernameButtonClickHandler() {
		this.hideLoggedInInfo();
		this.hideUserInfoSection();
		this.showChangeUsernameFormSection();
		this.newUsername.value = '';
		this.changeUsernamePassword.value = '';
		this.changeUsernameError.innerText = '';
		this.newUsername.focus();
	}

	changePasswordButtonClickHandler() {
		this.hideLoggedInInfo();
		this.hideUserInfoSection();
		this.showChangePasswordFormSection();
		this.currentPassword.value = '';
		this.newPassword.value = '';
		this.changePasswordError.innerText = '';
		this.currentPassword.focus();
	}

	forgotPasswordButtonClickHandler() {
		this.hideSignInForm();
		this.showRecoverFormSection();
		this.recoverEmail.value = '';
		this.recoverUsername.value = '';
		this.recoverError.innerText = '';
	}

	chatButtonClickHandler() {
		if (this.game.chat.chatArea.style.display == 'none') {
			this.game.chat.chatArea.style.display = 'block';
		} else {
			this.game.chat.chatArea.style.display = 'none';
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
		}).catch((err) => console.log(err));
	}

	signOut() {
		socket.emit('user-disconnected');
		window.localStorage.removeItem('loginToken');
		this.loggedInUsername.innerText = '';
		this.leaderboardSignedIn.innerHTML = '';
		this.leaderboardSignedOut.innerHTML = '';
		this.isLoggedIn = false;
		this.hideLoggedInInfo();
		this.hideUserInfoSection();
		this.hideUserSettingsButton();
		this.profileImage.src = this.logged_out.src;
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
		this.signInOrRegisterInfoMessage.innerText = '';
	}

	hideSignInOrRegister() {
		this.signInOrRegister.style.display = 'none';
		this.signInOrRegisterInfoMessage.innerText = '';
	}

	showLoggedInInfo() {
		this.loggedInInfoSection.style.display = 'block';
	}

	hideLoggedInInfo() {
		this.loggedInInfoSection.style.display = 'none';
	}

	showLeaderboardSignedIn() {
		this.leaderboardSignedIn.style.display = 'block';
	}

	hideLeaderboardSignedIn() {
		this.leaderboardSignedIn.style.display = 'none';
		this.leaderboardSignedIn.innerHTML = '';
	}

	showLeaderboardSignedOut() {
		this.leaderboardSignedOut.style.display = 'block';
	}

	hideLeaderboardSignedOut() {
		this.leaderboardSignedOut.style.display = 'none';
		this.leaderboardSignedOut.innerHTML = '';
	}

	showUserSettingsButton() {
		this.userSettingsImage.style.display = 'block';
		this.userSettingsButton.style.display = 'block';
		this.chatImage.style.display = 'block';
		this.chatButton.style.display = 'block';
	}

	hideUserSettingsButton() {
		this.userSettingsImage.style.display = 'none';
		this.userSettingsButton.style.display = 'none';
		this.chatImage.style.display = 'none';
		this.chatButton.style.display = 'none';
	}

	showLoggedInUsername() {
		this.loggedInUsername.style.display = 'block';
	}

	hideLoggedInUsername() {
		this.loggedInUsername.style.display = 'none';
	}

	showUserInfoSection() {
		this.userInfoSection.style.display = 'block';
		this.userInfoMessage.innerText = '';
	}

	hideUserInfoSection() {
		this.userInfoSection.style.display = 'none';
		this.userInfoMessage.innerText = '';
	}

	showChangeEmailFormSection() {
		this.changeEmailFormSection.style.display = 'block';
	}

	hideChangeEmailFormSection() {
		this.changeEmailFormSection.style.display = 'none';
	}

	showChangeUsernameFormSection() {
		this.changeUsernameFormSection.style.display = 'block';
	}

	hideChangeUsernameFormSection() {
		this.changeUsernameFormSection.style.display = 'none';
	}

	showChangePasswordFormSection() {
		this.changePasswordFormSection.style.display = 'block';
	}

	hideChangePasswordFormSection() {
		this.changePasswordFormSection.style.display = 'none';
	}

	showRecoverFormSection() {
		this.recoverFormSection.style.display = 'block';
	}

	hideRecoverFormSection() {
		this.recoverFormSection.style.display = 'none';
	}

	isTextInputActive() {
		let textInputFields = [this.signInUsername, this.signInPassword, this.registerUsername, this.registerPassword, this.registerEmail, 
			this.currentPassword, this.newPassword, this.recoverEmail, this.recoverUsername, this.newEmail, this.changeEmailPassword, 
			this.newUsername, this.changeUsernamePassword, this.game.chat.messageInput];
		for (let field of textInputFields) {
			if (field === document.activeElement) {
				return true;
			}
		}
		return false;
	}
}