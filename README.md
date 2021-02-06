# skifreejs
Fan remake of the classic game from Windows Entertainment Pack 3, written in JavaScript/HTML5 Canvas backed by Node.js

![screenshot](https://user-images.githubusercontent.com/1410481/107126640-10632380-687f-11eb-992b-b3f5165ea956.png)

Languages/technologies used include:
- HTML5 Canvas
- JavaScript
- TypeScript
- Node.js
- Express
- Socket.IO
- JWT
- bcrypt
- MongoDB

### Play live on Heroku:

[skifreejs.herokuapp.com](https://skifreejs.herokuapp.com/)

### Play locally from source code:
1. Download or clone repository
2. Install [Node.js](https://nodejs.org/en/)
3. Install package dependencies: ```npm i```
4. Start the game: ```npm run start```
5. Go to [http://localhost:3000](http://localhost:3000/)

### PC Controls:
- While Skiing:
    - Move mouse: steer
    - Left click: jump
- While Stopped:
    - A: skate left
    - D: skate right
- While Crashed:
    - Left click: stand up
- While Jumping:
    - Left click: advance backflip stage
    - Right click (hold): trick 1
    - Move mouse above skier: trick 2
- General:
    - Spacebar: pause
    - F2: restart
    - H: show/hide HUD

### Mobile Controls:
- While Skiing:
    - Touch below skier: steer
    - Touch above skier: jump
- While Crashed:
    - Touch below skier: stand up
- While Jumping:
    - Touch above skier: advance backflip stage
    - Touch below skier (hold): trick 1
