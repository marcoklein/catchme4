(()=>{"use strict";var e,t={907:(e,t,i)=>{var s=i(728),n=i(292),o=i.n(n);function a(e){return o()(`game:${e}`)}o().enable("*,-game:ping");var r=i(844);const l=a("client");class h{constructor(){}connect(){return e=this,t=void 0,s=function*(){let e="wss://zshwx1.colyseus.de";/localhost/.test(window.location.host)&&(e="ws://localhost:2567"),l("connecting to server url %s",e);const t=new r.Client(e);try{this.room=yield t.joinOrCreate("gameRoom")}catch(e){console.error("error during room join",e)}return l(this.room.sessionId,"joined",this.room.id,this.room.name),this.room.state.players.onAdd=e=>{l("added new player with id",e.id),this.room.sessionId===e.id&&(l("found own player with id %s",e.id),this.ownPlayer=e),e.onRemove=()=>{l("player",e.id,"removed")},e.triggerAll()},this.room},new((i=void 0)||(i=Promise))((function(n,o){function a(e){try{l(s.next(e))}catch(e){o(e)}}function r(e){try{l(s.throw(e))}catch(e){o(e)}}function l(e){var t;e.done?n(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(a,r)}l((s=s.apply(e,t||[])).next())}));var e,t,i,s}}const d=a("ping");class c{constructor(){this._latestPing=-1,this.pingInterval=500}getPing(){return this._latestPing}getPingText(){const e=this.getPing();return e>300?"unplayable":e>200?"very bad":e>150?"bad":e>100?"okay":e>50?"good":e>30?"very good":"excellent"}update(e){e.updatePing(this.getPing(),this.getPingText())}attachToRoom(e){let t,i=0,s=-1;const n=()=>{t&&(console.warn("no pong for ",this.pingInterval,"seconds"),clearTimeout(t)),i++,d("sending ping message with id %d",i),s=Date.now(),e.send("ping",i),t=setTimeout((()=>{t=void 0,n()}),this.pingInterval)};e.onMessage("pong",(e=>{i===e?(this._latestPing=Date.now()-s,d("pong time for id %d is %d milliseconds",i,this._latestPing)):console.warn("server sent an expired ping id")})),n()}}const u=a("input");function p(e){const t=e/1e3,i=Math.floor(t/60);return{seconds:Math.floor(t%60),minutes:i}}function m(e){return e.frameKey.length?e.frameKey:e.frameIndex>=0?e.frameIndex:void 0}const g=a("client:body-synchronizer");const v=a("ParticleManager");class x{constructor(e){this.emitterCache={},this.emitters=[],this.scene=e}emitDeathExplosion(e,t,i,s){v("emit death explosion with params %j",{x:e,y:t,texture:i,frame:s}),this.emitParticles(e,t,i,s)}emitParticles(e,t,i,s){const n=this.emitterCache[i]||this.scene.add.particles(i,s,{active:!1});n.setDepth(101);const o=n.createEmitter({x:e,y:t,scale:{start:.7,end:0},rotate:{start:0,end:360},lifespan:[1e3,2e3],maxParticles:10,frequency:5,speed:80});this.scene.time.delayedCall(2e3,(()=>{const e=this.emitters.indexOf(o);-1!==e&&this.emitters.splice(e,1)})),this.emitters.push(o)}destroyParticles(){this.emitters.forEach((e=>e.remove())),Object.values(this.emitterCache).forEach((e=>e.destroy())),this.emitterCache={}}}class y extends Phaser.Scene{constructor(){super({key:"HudScene"})}create(){return e=this,t=void 0,s=function*(){this.energyText=this.add.text(0,0,"",{color:"black",fontSize:"28px"}),this.energyText.setOrigin(0,0),this.remainingCatcherTimeText=this.add.text(0,0,"",{color:"black",fontSize:"28px"}),this.remainingCatcherTimeText.setOrigin(.5,0),this.gameStatusText=this.add.text(0,0,"",{color:"black",fontSize:"28px"}),this.gameStatusText.setOrigin(.5,0),this.totalGameTimeText=this.add.text(0,30,"",{color:"black",fontSize:"28px"}),this.totalGameTimeText.setOrigin(0,0),this.gameFinishedText=this.add.text(this.game.canvas.width/2,this.game.canvas.height/2,"Game Finished!",{font:"64px Arial",color:"#222"}),this.gameFinishedText.setOrigin(.5,.5),this.gameFinishedText.alpha=0,this.gameFinishedText.depth=1e3,this.statsContainer=this.add.container(10,10),this.statsContainer.scale=1},new((i=void 0)||(i=Promise))((function(n,o){function a(e){try{l(s.next(e))}catch(e){o(e)}}function r(e){try{l(s.throw(e))}catch(e){o(e)}}function l(e){var t;e.done?n(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(a,r)}l((s=s.apply(e,t||[])).next())}));var e,t,i,s}updateEnergy(e,t){void 0!==e&&void 0!==t?(this.energyText.setVisible(!0),this.energyText.setText(`Energy: ${Math.floor(e)}/${Math.floor(t)}`)):this.energyText.setVisible(!1)}updateRemainingTimeText(e){if(this.totalGameTimeText.setVisible(e>=0),this.totalGameTimeText.visible){const{seconds:t,minutes:i}=p(e);this.totalGameTimeText.setText(`Time: ${Math.floor(i)}:${new String(Math.floor(t)).padStart(2,"0")}`)}}updateGameStatusText(e){e?(this.gameStatusText.setVisible(!0),this.gameStatusText.setText(e),this.gameStatusText.setX(this.cameras.main.displayWidth/2)):this.gameStatusText.setVisible(!1)}}const f=a("levelscene");class S extends Phaser.Scene{constructor(){super({key:"LevelScene"}),this.levelListeners=[],this.particles=new x(this)}create({network:e}){this.events.on("destroy",(()=>this.onDestroy())),f("created level scene"),this.cameras.main.centerOn(0,0),this.hudScene=this.scene.add("HudScene",y,!0),this.network=e,this.levelState=e.room.state.level,this.hudScene.updateGameStatusText("Joining..."),function(e,t){const i=e.input.keyboard.addKey("Ctrl"),{up:s,down:n,left:o,right:a}=e.input.keyboard.addKeys({up:"W",down:"S",left:"A",right:"D"});let r={up:!1,down:!1,left:!1,right:!1},l=!1;e.events.on("update",(()=>{const e={up:s.isDown,down:n.isDown,left:o.isDown,right:a.isDown};e.left===r.left&&e.right===r.right&&e.down===r.down&&e.up===r.up||(r=e,t.send("direction",e),u("sent new direction %j",e)),l!==i.isDown&&(l=i.isDown,i.isDown?(u("sprinting"),t.send("sprint",!0)):(u("stop sprinting"),t.send("sprint",!1)))}))}(this,e.room),this.initializeLevelState(this,this.levelState)}update(){this.network.ownPlayer&&this.network.room.state.level.bodies.get(this.network.ownPlayer.bodyId)}initializeLevelState(e,t){let i;this.levelListeners.push(t.listen("tileMap",(t=>{t.mapSize.onChange=()=>{i&&i.destroy(),i=e.add.rectangle(0,0,t.mapSize.width*t.tileSize,t.mapSize.height*t.tileSize,13421772),i.setDepth(-1),e.scale.setGameSize(t.mapSize.width*t.tileSize,t.mapSize.height*t.tileSize),e.cameras.main.centerOn(0,0)}}))),t.bodies.onAdd=e=>function(e,t){var i;if(g("added new body with id",t.id),(null===(i=e.network.ownPlayer)||void 0===i?void 0:i.bodyId)===t.id){e.hudScene.updateGameStatusText("Have fun!"),g("Adding body of our player!");const i=()=>{e.hudScene.updateEnergy(t.energy,t.maxEnergy)};t.listen("maxEnergy",i),t.listen("energy",i),t.listen("remainingCatcherTimeMillis",(t=>{!function(e,t){if(t<0)e.hudScene.updateGameStatusText(void 0);else{const{seconds:i,minutes:s}=p(t);e.hudScene.updateGameStatusText(`Catch somebody! ${Math.floor(s)}:${new String(Math.floor(i)).padStart(2,"0")}`)}}(e,t)}))}const s=e.add.image(200,200,t.texture.key,m(t.texture));let n,o;s.setDepth(100),e.levelListeners.push(t.listen("texture",(e=>{g("Setting body texture=%s, frame=%s",e.key,m(e)),s.setTexture(e.key,m(e))}))),e.levelListeners.push(t.position.listen("x",(e=>s.setX(e)))),e.levelListeners.push(t.position.listen("y",(e=>s.setY(e)))),t.moveDirection.onChange=()=>{0===t.moveDirection.x&&0===t.moveDirection.y||(g("setting rotation %j",t.moveDirection),s.setRotation(new Phaser.Math.Vector2(t.moveDirection).angle()))};const a=()=>{o&&(g("destroying particles"),o.destroy(),o=void 0,n=void 0)};t.onRemove=()=>{var i;g("player",t.id,"removed"),s.destroy(),a(),g("Setting body texture=%s, frame=%s",t.texture.key,m(t.texture)),e.particles.emitDeathExplosion(t.position.x,t.position.y,t.texture.key,m(t.texture)),(null===(i=e.network.ownPlayer)||void 0===i?void 0:i.bodyId)===t.id&&(g("Removing body of our player!"),e.hudScene.updateGameStatusText("Waiting for game to finish"),e.hudScene.updateEnergy(void 0))},e.levelListeners.push(t.listen("isCatcher",(t=>{t?(n&&o||(o=e.add.particles("particle.red"),n=o.createEmitter({})),n.setScale(.3),n.setSpeed(30),n.setLifespan(100),n.setBlendMode(Phaser.BlendModes.ADD),n.startFollow(s),o.setDepth(90)):o&&a()}))),t.triggerAll()}(this,e),this.levelState.listen("state",(e=>{const t={warmup:()=>{this.hudScene.updateGameStatusText("Waiting for others to join...")},starting:()=>{this.hudScene.updateGameStatusText("Starting...")},running:()=>{this.hudScene.updateGameStatusText("Running")},finished:()=>{this.hudScene.updateGameStatusText("Finished")}}[e];void 0===t?console.warn(`unhandled level state: ${e}`):t()}));const n=e.add.group();this.levelListeners.push(t.listen("tileMap",(t=>{t.mapSize.width,t.tileSize,t.mapSize.height,t.tileSize;const i=-t.mapSize.width*t.tileSize*.5,o=-t.mapSize.height*t.tileSize*.5;this.levelListeners.push(t.listen("tiles",(a=>{a.onAdd=(a,r)=>{let l;this.levelListeners.push(a.listen("texture",(()=>{l&&(n.remove(l,!0,!0),l=void 0),l=new s.GameObjects.Image(e,i+a.position.x*t.tileSize,o+a.position.y*t.tileSize,a.texture.key,m(a.texture)),l.setDisplaySize(t.tileSize,t.tileSize),l.setDepth(a.layer||20),l.setOrigin(0,0),n.add(l),e.add.existing(l)}))),f("new tile %s",r),a.onRemove=()=>{l&&(n.remove(l,!0,!0),l=void 0,f("removed tile %s",r))}}})))}))),this.levelListeners.push(t.listen("remainingGameTimeMillis",(e=>{this.hudScene.updateRemainingTimeText(e)}))),t.triggerAll()}onDestroy(){f("destroying level scene"),this.levelListeners.forEach((e=>e())),this.levelListeners=[],this.scene.remove("HudScene"),this.particles.destroyParticles()}}const w=a("gamescene");class T extends Phaser.Scene{constructor(){super({key:"GameScene"})}create(){return e=this,t=void 0,s=function*(){this.network=new h;const e=yield this.network.connect();this.pingHandler=new c,this.pingHandler.attachToRoom(this.network.room),this.pingText=this.add.text(0,0,"",{color:"white",fontSize:"14px"}),this.pingText.setOrigin(0,1),e.state.listen("level",((e,t)=>{if(t){w("destroying old scene");try{this.scene.remove("LevelScene")}catch(e){w("no previous scene to remove")}try{this.scene.remove("HudScene")}catch(e){w("no previous HudScene to remove")}}setTimeout((()=>{e&&(this.scene.add("LevelScene",S,!0,{network:this.network}),this.scene.bringToTop(this),w("started level scene"))}),0)}))},new((i=void 0)||(i=Promise))((function(n,o){function a(e){try{l(s.next(e))}catch(e){o(e)}}function r(e){try{l(s.throw(e))}catch(e){o(e)}}function l(e){var t;e.done?n(e.value):(t=e.value,t instanceof i?t:new i((function(e){e(t)}))).then(a,r)}l((s=s.apply(e,t||[])).next())}));var e,t,i,s}update(){this.pingHandler&&this.pingHandler.update(this)}updatePing(e,t){this.pingText&&(this.pingText.setText(`Ping: ${e} (${t})`),this.pingText.setPosition(0,this.cameras.main.height))}}class b extends Phaser.Scene{constructor(){super({key:"PreloadScene"})}preload(){this.load.image("body.blue.1","assets/sprites/body.blue.1.png"),this.load.image("particle.red","assets/particles/red.png"),this.load.image("tile.wall.1","assets/sprites/tile.wall.png"),this.load.image("tile.dirt","assets/sprites/dirt.png"),this.load.image("tile.tree","assets/sprites/treeSmall.png"),this.load.spritesheet("tilesheet.grass","assets/tilesheets/groundGrass.png",{frameWidth:64,frameHeight:64})}create(){this.scene.start("GameScene")}}const P={type:Phaser.AUTO,backgroundColor:"#333333",scale:{parent:"phaser-game",mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH,width:1280,height:720},scene:[b,T]};window.addEventListener("load",(()=>{new Phaser.Game(P)}))}},i={};function s(e){var n=i[e];if(void 0!==n)return n.exports;var o=i[e]={exports:{}};return t[e].call(o.exports,o,o.exports,s),o.exports}s.m=t,e=[],s.O=(t,i,n,o)=>{if(!i){var a=1/0;for(d=0;d<e.length;d++){for(var[i,n,o]=e[d],r=!0,l=0;l<i.length;l++)(!1&o||a>=o)&&Object.keys(s.O).every((e=>s.O[e](i[l])))?i.splice(l--,1):(r=!1,o<a&&(a=o));if(r){e.splice(d--,1);var h=n();void 0!==h&&(t=h)}}return t}o=o||0;for(var d=e.length;d>0&&e[d-1][2]>o;d--)e[d]=e[d-1];e[d]=[i,n,o]},s.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return s.d(t,{a:t}),t},s.d=(e,t)=>{for(var i in t)s.o(t,i)&&!s.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},s.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e={179:0};s.O.j=t=>0===e[t];var t=(t,i)=>{var n,o,[a,r,l]=i,h=0;if(a.some((t=>0!==e[t]))){for(n in r)s.o(r,n)&&(s.m[n]=r[n]);if(l)var d=l(s)}for(t&&t(i);h<a.length;h++)o=a[h],s.o(e,o)&&e[o]&&e[o][0](),e[a[h]]=0;return s.O(d)},i=self.webpackChunk_catchme4_client=self.webpackChunk_catchme4_client||[];i.forEach(t.bind(null,0)),i.push=t.bind(null,i.push.bind(i))})();var n=s.O(void 0,[216],(()=>s(907)));n=s.O(n)})();