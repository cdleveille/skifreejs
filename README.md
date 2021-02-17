# skifreejs
Fan remake of the classic PC game from Windows Entertainment Pack 3, written in JavaScript/HTML5 Canvas backed by Node.js

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

### Play live on Heroku:
[skifreejs.herokuapp.com](https://skifreejs.herokuapp.com/)

### Play locally from source code:
1. Download or clone repository
2. Install [Node.js](https://nodejs.org/en/)
3. Install package dependencies: ```npm i```
4. Start the game server: ```npm run start```
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
    - C: show/hide chat

### Mobile Controls:
- While Skiing:
    - Touch below skier: steer
    - Touch above skier: jump
- While Crashed:
    - Touch below skier: stand up
- While Jumping:
    - Touch above skier: advance backflip stage
    - Touch below skier (hold): trick 1

---

### Package Credits:
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
- [os](https://nodejs.org/api/os.html)
- [path](https://github.com/jinder/path)
- [response-time](https://github.com/expressjs/response-time)
- [socketio](https://github.com/socketio/socket.io)
- [ts-node](https://github.com/TypeStrong/ts-node)
- [typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint)
- [typescript](https://github.com/Microsoft/TypeScript)
- [winston](https://github.com/winstonjs/winston)