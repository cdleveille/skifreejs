/* eslint-disable no-undef */
self.addEventListener('install', function (event) {
	self.skipWaiting();
	event.waitUntil(
		caches.open('v1').then(function (cache) {
			return cache.addAll([
				'./css/ski.css',
				'./js/chat.js',
				'./js/game.js',
				'./js/input.js',
				'./js/lift.js',
				'./js/npc.js',
				'./js/ski.js',
				'./js/skier.js',
				'./js/slalom.js',
				'./js/socket.js',
				'./js/user.js',
				'./js/util.js',
				'./js/window.js',
				'./ski.ejs',
				'./font/ModernDOS8x16.ttf',
				'./icons/icon.ico',
				'./icons/icon-32x32.png',
				'./icons/icon-64x64.png',
				'./icons/icon-72x72.png',
				'./icons/icon-96x96.png',
				'./icons/icon-128x128.png',
				'./icons/icon-144x144.png',
				'./icons/icon-152x152.png',
				'./icons/icon-160x160.png',
				'./icons/icon-192x192.png',
				'./icons/icon-224x224.png',
				'./icons/icon-384x384.png',
				'./icons/icon-512x512.png',
				'./img/bump_group.png',
				'./img/bump_large.png',
				'./img/bump_small.png',
				'./img/chat.png',
				'./img/crown.png',
				'./img/dog_woof1.png',
				'./img/dog_woof2.png',
				'./img/dog1.png',
				'./img/dog2.png',
				'./img/finish_left.png',
				'./img/finish_right.png',
				'./img/gate_fail.png',
				'./img/gate_left.png',
				'./img/gate_pass.png',
				'./img/gate_right.png',
				'./img/gear.png',
				'./img/hourglass.png',
				'./img/jump.png',
				'./img/lift_chair_down.png',
				'./img/lift_chair_up1.png',
				'./img/lift_chair_up2.png',
				'./img/lift_tower_lower.png',
				'./img/lift_tower_top.png',
				'./img/lift_tower.png',
				'./img/logged_in.png',
				'./img/logged_in_inverted.png',
				'./img/logged_out.png',
				'./img/logged_out_inverted.png',
				'./img/offline.png',
				'./img/online.png',
				'./img/other_skier_crash.png',
				'./img/other_skier1.png',
				'./img/other_skier2.png',
				'./img/other_skier3.png',
				'./img/restart.png',
				'./img/rock.png',
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
				'./img/skifreejs.png',
				'./img/snowboarder_left.png',
				'./img/snowboarder_right.png',
				'./img/snowboarder_crash.png',
				'./img/start_left.png',
				'./img/start_right.png',
				'./img/stump.png',
				'./img/tree_bare_fire1.png',
				'./img/tree_bare_fire2.png',
				'./img/tree_bare.png',
				'./img/tree_large.png',
				'./img/tree_small.png',
				'./img/tree_small_moving_left.png',
				'./img/tree_small_moving_right.png',
				'./img/users.png',
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