/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
if (navigator.serviceWorker.controller) {
	console.log('active service worker found');
} else {
	navigator.serviceWorker
		.register('../service-worker.js',)
		.then(function () {
			console.log('new service worker registered');
		});
}