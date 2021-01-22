/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
if (navigator.serviceWorker.controller) {
	console.log('Active service worker found.');
} else {
	navigator.serviceWorker
		.register('../service-worker.js',)
		.then(function () {
			console.log('New service worker registered.');
		});
}