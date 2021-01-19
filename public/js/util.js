/* eslint-disable no-undef */
export default class Util {
	// load a single image from the specified source file
	loadImage(src) {
		let img = new Image();
		img.src = src;
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
		if (this.lastLogTime == null) {
			this.lastLogTime = this.timestamp();
		}

		if (this.timestamp() - this.lastLogTime > 500) {
			console.log(toLog);
			this.lastLogTime = null;
		}
	}

	// generic rest method for outbound requests
	fetch (method, uri) {
		method = method.trim().toUpperCase();
		return new Promise((resolve, reject) => {
			$.ajax({
				method: method,
				url: uri,
				beforeSend: () => console.log(`performing ${method} on ${uri}`),
				success: data => resolve(data),
				error: e => reject(e),
				complete: () => console.log('request complete')
			});
		});
	}
}