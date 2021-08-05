# skifreejs
Fan remake of the classic PC game from Windows Entertainment Pack 3. Written in JavaScript/HTML5 Canvas backed by Node.js.

Original SkiFree graphics/feel enhanced by modern PWA/SPA standards and open source software. Features user login system, leaderboards, and chat box. Supports mouse, keyboard, gamepad, and touchscreen controls.

![screenshot](https://user-images.githubusercontent.com/1410481/107723050-3be67380-6cae-11eb-9cf6-32e21a840cb4.png)

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

## Play
### Online on Heroku
[skifreejs.herokuapp.com](https://skifreejs.herokuapp.com/)

### Locally from source code
1. Download or clone repository
2. Install [Node.js](https://nodejs.org/en/)
3. Install package dependencies: ```npm i```
4. Start the game server: ```npm run start``` or ```npm run dev```
5. Go to [http://localhost:3000](http://localhost:3000/) or launch the 'dev' debug configuration

## Controls
### Mouse & Keyboard
- While Skiing:
    - Steer: move mouse / arrow keys / ASD / numpad
    - Jump: left click / up arrow key / W / numpad 8
- While Crashed:
    - Stand up: left click / WASD / arrow keys / numpad
- While Jumping:
    - Advance backflip stage: left click / W key / up arrow / numpad 8
    - Trick 1: right click / left shift / right ctrl / numpad 0 (hold)
    - Trick 2: move mouse above skier
- General:
    - Pause: spacebar
    - Restart: F2
    - Show/hide HUD: H
    - Show/hide chat: C

### Gamepad
Works with any gamepad - XInput controls shown for reference.
- While Skiing:
    - Steer: left analog stick / d-pad
    - Jump: button 0 (A)
- While Crashed:
    - Stand up: button 0 (A) / d-pad
- While Jumping:
    - Advance backflip stage: button 0 (A) / d-pad up
    - Trick 1: button 1 (B)
    - Trick 2: left analog stick up
- General:
    - Pause: button 9 (start)
    - Restart: button 8 (back)

### Touchscreen
- While Skiing:
    - Steer: touch below skier
    - Jump: touch above skier
- While Crashed:
    - Stand up: touch below skier
- While Jumping:
    - Advance backflip stage: touch above skier
    - Trick 1: touch below skier (hold)

---

## Package Credits
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- [body-parser](https://github.com/expressjs/body-parser)
- [cluster](https://github.com/LearnBoost/cluster)
- [compression](https://github.com/expressjs/compression)
- [cors](https://github.com/expressjs/cors)
- [cpx](https://github.com/mysticatea/cpx)
- [crypto](https://github.com/nodejs/node/blob/master/doc/api/crypto.md)
- [dateformat](https://github.com/felixge/node-dateformat)
- [dotenv](https://github.com/motdotla/dotenv)
- [ejs](https://github.com/mde/ejs)
- [eslint](https://github.com/eslint/eslint)
- [express](https://github.com/expressjs/express)
- [glob-parent](https://www.npmjs.com/package/glob-parent)
- [helmet](https://github.com/helmetjs/helmet)
- [http-server](https://github.com/http-party/http-server)
- [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [mongodb](https://github.com/mongodb/node-mongodb-native)
- [mongoose](https://github.com/Automattic/mongoose)
- [morgan](https://github.com/expressjs/morgan)
- [multer](https://github.com/expressjs/multer)
- [node-cache](https://github.com/node-cache/node-cache)
- [node](https://nodejs.org/en/)
- [nodemailer](https://github.com/nodemailer/nodemailer)
- [nodemon](https://github.com/remy/nodemon)
- [npm](https://www.npmjs.com/package/npm)
- [os](https://nodejs.org/api/os.html)
- [path](https://github.com/jinder/path)
- [response-time](https://github.com/expressjs/response-time)
- [socketio](https://github.com/socketio/socket.io)
- [ts-node](https://github.com/TypeStrong/ts-node)
- [typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint)
- [typescript](https://github.com/Microsoft/TypeScript)
- [winston](https://github.com/winstonjs/winston)
