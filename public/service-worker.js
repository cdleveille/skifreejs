/* eslint-disable no-undef */
self.addEventListener('install', function (event) {
	self.skipWaiting();
	event.waitUntil(
		caches.open('v1').then(function (cache) {
			return cache.addAll([
				'./js/game.js',
				'./js/input.js',
				'./js/lift.js',
				'./js/ski.js',
				'./js/skier.js',
				'./js/socket.js',
				'./js/util.js',
				'./js/window.js',
				'./ski.ejs',
				'./font/ModernDOS8x16.ttf',
				'./icons/ski.png',
				'./img/boarder_bro.png',
				'./img/bump_group.png',
				'./img/bump_large.png',
				'./img/bump_small.png',
				'./img/dog.png',
				'./img/gate_fail.png',
				'./img/gate_left.png',
				'./img/gate_pass.png',
				'./img/gate_right.png',
				'./img/jump.png',
				'./img/lift_chair_down.png',
				'./img/lift_chair_up1.png',
				'./img/lift_chair_up2.png',
				'./img/lift_tower_lower.png',
				'./img/lift_tower_top.png',
				'./img/lift_tower.png',
				'./img/other_skier_crash.png',
				'./img/other_skier1.png',
				'./img/other_skier2.png',
				'./img/other_skier3.png',
				'./img/rock.png',
				'./img/ski.png',
				'./img/skier_down_left.png',
				'./img/skier_down_right.png',
				'./img/skier_down.png',
				'./img/skier_falling.png',
				'./img/skier_jump_down.png',
				'./img/skier_jump_left.png',
				'./img/skier_jump_right.png',
				'./img/skier_left_down.png',
				'./img/skier_left.png',
				'./img/skier_ouch.png',
				'./img/skier_right_down.png',
				'./img/skier_right.png',
				'./img/skier_sit.png',
				'./img/skier_skate_left.png',
				'./img/skier_skate_right.png',
				'./img/skier_trick1_left.png',
				'./img/skier_trick1_right.png',
				'./img/skier_trick2.png',
				'./img/skier_upside_down1.png',
				'./img/skier_upside_down2.png',
				'./img/snowboarder_left.png',
				'./img/snowboarder_right.png',
				'./img/start_left.png',
				'./img/start_right.png',
				'./img/stump.png',
				'./img/tree_bare_fire1.png',
				'./img/tree_bare_fire2.png',
				'./img/tree_bare.png',
				'./img/tree_large.png',
				'./img/tree_small.png',
				'./img/yeti1.png',
				'./img/yeti2.png',
			]);
		})
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(async function() {
		try {
			const cache = await caches.open('v1');
			const networkResponse = await fetch(event.request);
			if (event.request.method !== 'POST') {
				event.waitUntil(cache.put(event.request, networkResponse.clone()));
			}
			return networkResponse;
		} catch (err) {
			return caches.match(event.request);
		}
	}());
});