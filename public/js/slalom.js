/* eslint-disable no-undef */
import socket from './socket.js';

export default class Slalom {
	constructor(game) {
		this.game = game;
		this.images = [];
		this.numGates = 24;
		this.startX = -20;
		this.startY = 300;
		this.spaceBetweenGatesX = 180;
		this.spaceBetweenGatesY = 300;
	}

	loadAssets() {
		this.start_left = this.game.util.loadImage('/img/start_left.png', this);
		this.start_right = this.game.util.loadImage('/img/start_right.png', this);
		this.gate_left = this.game.util.loadImage('/img/gate_left.png', this);
		this.gate_right = this.game.util.loadImage('/img/gate_right.png', this);
		this.gate_pass = this.game.util.loadImage('/img/gate_pass.png', this);
		this.gate_fail = this.game.util.loadImage('/img/gate_fail.png', this);
		this.finish_left = this.game.util.loadImage('/img/finish_left.png', this);
		this.finish_right = this.game.util.loadImage('/img/finish_right.png', this);
	}

	init() {
		this.gates = [];
		this.spawnNewGate('start_left', this.startX - 100, this.startY);
		this.spawnNewGate('start_right', this.startX + 100, this.startY);
		let y = this.startY + this.spaceBetweenGatesY;
		for (let n = 0; n < this.numGates; n++) {
			if (n % 2 == 0) {
				this.spawnNewGate('gate_left', this.startX - (this.spaceBetweenGatesX / 2), y);
			} else {
				this.spawnNewGate('gate_right', this.startX + (this.spaceBetweenGatesX / 2), y);
			}
			y += this.spaceBetweenGatesY;
		}
		this.spawnNewGate('finish_left', this.startX - 100, y);
		this.spawnNewGate('finish_right', this.startX + 100, y);
		this.courseIsActive = false;
		this.courseCompleted = false;
	}

	spawnNewGate(type, x, y) {
		let gate;
		switch (type) {
		case 'start_left':
			gate = { type: type, x: x, y: y, xOffset: 0, img: this.start_left, isPassed: false };
			this.gates.push(gate);
			break;
		case 'start_right':
			gate = { type: type, x: x, y: y, xOffset: 0, img: this.start_right, isPassed: false };
			this.gates.push(gate);
			break;
		case 'gate_left':
			gate = { type: type, x: x, y: y, xOffset: 0, img: this.gate_left, isPassed: false };
			this.gates.push(gate);
			break;
		case 'gate_right':
			gate = { type: type, x: x, y: y, xOffset: 0, img: this.gate_right, isPassed: false };
			this.gates.push(gate);
			break;
		case 'finish_left':
			gate = { type: type, x: x, y: y, xOffset: 0, img: this.finish_left, isPassed: false };
			this.gates.push(gate);
			break;
		case 'finish_right':
			gate = { type: type, x: x, y: y, xOffset: 0, img: this.finish_right, isPassed: false };
			this.gates.push(gate);
			break;
		default:
			console.log('invalid gate type: ' + type);
		}
	}

	update(step) {
		for (let gate of this.gates) {
			// check if skier has passed the start gate
			if (!gate.isPassed && gate.y <= 0) {
				if (!this.courseIsActive && gate.type == 'start_left') {
					if (gate.x >= -227 && gate.x <= 15) {
						this.courseIsActive = true;
					}
				}
				
				// check if skier has passed a directional gate
				if (this.courseIsActive) {
					if (gate.type == 'gate_left') {
						gate.xOffset = -4;
						if (gate.x >= 11) {
							gate.img = this.gate_pass;
						} else {
							gate.img = this.gate_fail;
							this.game.startTime -= 5000;
						}
					} else if (gate.type == 'gate_right') {
						gate.xOffset = 4;
						if (gate.x <= -9) {
							gate.img = this.gate_pass;
						} else {
							gate.img = this.gate_fail;
							this.game.startTime -= 5000;
						}
					} else if (gate.type == 'finish_left') {
						this.courseIsActive = false;
						this.courseCompleted = true;
						this.time = this.game.currentTime - this.game.startTime;

						if (!this.game.isOffline && this.game.user.isLoggedIn) {
							socket.emit('new_score_slalom', { _id: this.game.user.userData._id, username: this.game.user.userData.username, slalomScore: this.time });
							socket.once('updated_score_slalom', (res) => {
								console.log('socket: updated_score_slalom', res);
								if (res.ok) {
									window.localStorage.removeItem('loginToken');
									window.localStorage.setItem('loginToken', res.data);
									this.game.user.validateLoginToken();
									this.game.user.refreshLeaderboard(this.game.user.leaderboardScoreCount);
								} else this.game.user.signOut();
							});
						}
					}
				}

				gate.isPassed = true;
			}

			// update position
			gate.x -= this.game.skier.xv * step;
			gate.y -= this.game.skier.yv * step;
		}
	}

	draw(ctx) {
		for (let gate of this.gates) {
			ctx.drawImage(gate.img, Math.floor(this.game.skier.x + gate.x + gate.xOffset), Math.floor(this.game.skier.y + gate.y));
		}
	}
}