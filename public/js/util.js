/* eslint-disable no-undef */
export default class Util {
	// load a single image from the specified url and add it to the images array in its owner class
	loadImage(url, ownerClass) {
		let img = new Image();
		img.src = url;
		img.onload = function() {
			img.isLoaded = true;
		};
		ownerClass.images.push(img);
		return img;
	}

	// convert radians to degrees
	degrees(radians) {
		return (radians * 180) / Math.PI;
	}

	// convert degrees to radians
	radians(degrees) {
		return (degrees * Math.PI) / 180;
	}

	// generate random integer in specified range (min inclusive, max exclusive)
	randomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min);
	}

	// return true if the given rectangles are colliding, false if not
	areRectanglesColliding(rect1, rect2) {
		return (rect1.x < rect2.x + rect2.width &&
			rect1.x + rect1.width > rect2.x &&
			rect1.y < rect2.y + rect2.height &&
			rect1.y + rect1.height > rect2.y);
	}

	// return the direct distance between the two specified coordinate points
	getDistanceBetweenPoints(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	}

	// get the current time (high precision)
	timestamp() {
		return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
	}

	// add a leading zero to single digit numbers
	padLeadingZero(num) {
		return num.toString().padStart(2, '0');
	}

	// format the current time (milliseconds) to hh:mm:ss.ms
	timeToString(time) {
		let diffInHrs = time / 3600000;
		let hh = Math.floor(diffInHrs);

		let diffInMin = (diffInHrs - hh) * 60;
		let mm = Math.floor(diffInMin);

		let diffInSec = (diffInMin - mm) * 60;
		let ss = Math.floor(diffInSec);

		let diffInMs = (diffInSec - ss) * 100;
		let ms = Math.floor(diffInMs);

		let formattedHH = hh.toString().padStart(2, '0');
		let formattedMM = mm.toString().padStart(2, '0');
		let formattedSS = ss.toString().padStart(2, '0');
		let formattedMS = ms.toString().padStart(2, '0');

		return `${formattedHH}:${formattedMM}:${formattedSS}.${formattedMS}`;
	}

	// log every half-second
	log(toLog) {
		if (typeof this.lastLogTime === 'undefined' || this.lastLogTime == null) {
			this.lastLogTime = this.timestamp();
		}

		if (this.timestamp() - this.lastLogTime > 500) {
			console.log(toLog);
			this.lastLogTime = null;
		}
	}
	// generic rest method for outbound requests
	request(method, uri, headers, body) {
		return new Promise((resolve, reject) => {
			fetch(uri, method == 'GET' || !body ?
				{ method: method || 'GET', headers: headers } :
				{ method: method || 'POST', headers: headers, body: JSON.stringify(body) }
			).then(r => r.json()).then(data => {
				return resolve(data);
			}).catch(e => {
				return reject(e);
			});
		});
	}

	// determine whether the user is playing on a desktop or mobile device
	isOnMobile() {
		let isMobile = navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/BlackBerry/i) ||
			navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/Opera Mini/i);
		return isMobile == null ? false : isMobile;
	}

	// determine whether the given string consists of only alphanumeric characters
	isAlphaNumeric(str) {
		let code, i, len;
		for (i = 0, len = str.length; i < len; i++) {
			code = str.charCodeAt(i);
			if (!(code > 47 && code < 58) && // numeric (0-9)
					!(code > 64 && code < 91) && // upper alpha (A-Z)
					!(code > 96 && code < 123)) { // lower alpha (a-z)
				return false;
			}
		}
		return true;
	}
}