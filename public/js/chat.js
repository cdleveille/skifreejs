/* eslint-disable no-undef */
import socket from './socket.js';
export default class Chat {
	constructor(game) {
		this.game = game;
		this.getHTMLElements();
		this.createFormSubmitEventListeners();
		this.createSocketEventListeners();
		this.lastMessageSentTime = -9999;
		this.isChatHidden = false;
	}

	getHTMLElements() {
		this.chatArea = document.getElementById('chat-area');
		this.sendContainer = document.getElementById('send-container');
		this.messageInput = document.getElementById('message-input');
		this.sendButton = document.getElementById('send-button');
		this.messageContainer = document.getElementById('message-container');
	}

	createFormSubmitEventListeners() {
		this.sendContainer.addEventListener('submit', (e) => {
			e.preventDefault();
			let now = this.game.util.timestamp();
			if (this.messageInput.value.length <= 128 && this.messageInput.value.trim() != '' && now - this.lastMessageSentTime > 3000) {
				if (this.game.user.isLoggedIn) {
					let message = this.messageInput.value;
					this.prependMessage(`${this.game.user.userData.username}: ${message}`);
					socket.emit('chat-message', message);
					this.messageInput.value = '';
					this.lastMessageSentTime = now;
				} else if (!this.alreadyWarned) {
					this.prependMessage('* please sign in to chat *', true);
					this.alreadyWarned = true;
				}
				this.messageInput.focus();
			}
		});
	}

	createSocketEventListeners() {
		socket.on('user-connected', username => {
			this.prependMessage(`${username} connected`);
		});

		socket.on('user-disconnected', username => {
			this.prependMessage(`${username} disconnected`);
		});

		socket.on('user-changed-username', (oldUsername, newUsername) => {
			this.prependMessage(`${oldUsername} changed username to ${newUsername}`);
		});

		socket.on('chat-message', data => {
			if (typeof data.username !== 'undefined') {
				this.prependMessage(`${data.username}: ${data.message}`);
			}
		});
	}

	prependMessage(message, isError) {
		let messageElement = document.createElement('div');
		messageElement.innerText = message;
		if (isError) messageElement.style.color = 'red';
		this.messageContainer.prepend(messageElement);
	}

	showChat(a) {
		this.chatArea.style.display = 'block';
		this.game.user.chatButton.title = 'Hide Chat';
		if (!a) this.isChatHidden = false;
	}

	hideChat() {
		this.chatArea.style.display = 'none';
		this.isChatHidden = true;
		this.game.user.chatButton.title = 'Show Chat';
	}
}