var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var BOT_VIEW_RANGE_RATIO = 1.05;
var BOT_SPEED_RATIO = 0.55;
var BOT_ATTACK_SPEED_RATIO = 1.5;
var BOT_HP_RATIO = 0.3;

var isGameStart = false;

var controlCode = 0;
var isMouseDown = false;

var ax = 0, ay = 0;

var WIDTH = 1300;
var HEIGHT = 600;

var username = localStorage.getItem('username');
var gameName = localStorage.getItem('gameName');
var game = {name: gameName};
var path = '/archers/' + gameName + '_data';

var grassImage1 = new Image();
grassImage1.src = 'css/images/grass_1.png';
var grassImage2 = new Image();
grassImage2.src = 'css/images/grass_2.png';
var wallImage = new Image();
wallImage.src = 'css/images/wall.png';
var bushImage1 = new Image();
bushImage1.src = 'css/images/bushes_1.png';
var bushImage2 = new Image();
bushImage2.src = 'css/images/bushes_2.png';
var environment = new Environment(40, 40, [grassImage1, grassImage2]);

var wallImage1 = new Image();
wallImage1.src = 'css/images/rock_1.png';
var wallImage2 = new Image();
wallImage2.src = 'css/images/rock_2.png';
var wallImage3 = new Image();
wallImage3.src = 'css/images/tomb.png';

var image1 = new Image();
image1.src = 'css/images/archer_walk.png';
var image2 = new Image();
image2.src = 'css/images/archer_stand_attack.png';
var image3 = new Image();
image3.src = 'css/images/archer_walk_attack.png';

var botImage1 = new Image();
botImage1.src = 'css/images/skeleton_walk.png';
var botImage2 = new Image();
botImage2.src = 'css/images/skeleton_stand_attack.png';
var botImage3 = new Image();
botImage3.src = 'css/images/skeleton_walk_attack.png';

var player = new Player(128, 128, 0, 2, 10, 550, 450, 10);
var isAlive = true;
player.setImages(image1, image2, image3);

var kills = 0;
var deathes = 0;
var gold = 250;

var damagePrice = 50;
var defDamage = 10;
var rangePrice = 50;
var defRange = 150;
var attackSpeedPrice = 50;
var defAttackSpeedPrice = 5;

var attackSpeedLimit = 30;
var bulletSpeedLimit = 24;

var players = {};

var arrowImage = new Image();
arrowImage.src = 'css/images/arrow.png';

var bullets = {};
var bulletCount = 0;

var bots = {};
var botCount = 0;
var maxBotsCount = 0;
var currentBotCount = 0;

function Messages() {

    var messages = [];
    var tick = 0;
    var alpha = 1;

    this.addMessage = function (message) {
        messages.push(message);
        tick = 0;
        alpha = 1;
    };

    this.update = function () {
        document.getElementById('rangeLabel').innerHTML = '' + player.attackRange + ' +20 - ' + rangePrice + ' злт';
        document.getElementById('damageLabel').innerHTML = '' + player.damage + ' +1 - ' + damagePrice + ' злт';
        document.getElementById('attackSpeedLabel').innerHTML = '' + player.attackSpeed + '/' + attackSpeedLimit + ' +0.5 - ' + attackSpeedPrice + ' злт';
        document.getElementById('bulletSpeedLabel').innerHTML = '' + player.bulletSpeed + '/' + bulletSpeedLimit + ' +0.5 - 50 злт';
        if (gold >= 50 && player.attackSpeed < attackSpeedLimit) {
            document.getElementById('attackSpeed').removeAttribute('disabled');
        } else {
            document.getElementById('attackSpeed').setAttribute('disabled', true);
        }
        if (gold >= 50 && player.bulletSpeed < bulletSpeedLimit) {
            document.getElementById('bulletSpeed').removeAttribute('disabled');
        } else {
            document.getElementById('bulletSpeed').setAttribute('disabled', true);
        }
        if (gold >= damagePrice) {
            document.getElementById('damage').removeAttribute('disabled');
        } else {
            document.getElementById('damage').setAttribute('disabled', true);
        }
        if (gold >= rangePrice) {
            document.getElementById('range').removeAttribute('disabled');
        } else {
            document.getElementById('range').setAttribute('disabled', true);
        }

        if (radar.available) {
            document.getElementById('radar').removeAttribute('disabled');
            document.getElementById('timer').innerHTML = '';
        } else {
            document.getElementById('radar').setAttribute('disabled', true);
            document.getElementById('timer').innerHTML = '' + radar.seconds + ' сек';
        }
        if (messages.length !== 0) {
            tick++;
        }
        if (tick > 60) {
            tick = 0;
            alpha -= 0.2;
        }
        if (alpha <= 0) {
            messages = [];
        }
    };

    this.showMessages = function (ctx) {
        var oldColor = ctx.fillStyle;
        var oldStyle = ctx.strokeStyle;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        ctx.font = 20 + "px Georgia";
        ctx.fillText('Убийств: ' + kills, WIDTH - 130, 30);
        ctx.fillText('Смертей: ' + deathes, WIDTH - 132, 60);
        ctx.fillStyle = 'yellow';
        ctx.fillText('Золото: ' + Math.floor(gold), 15, 30);
        if (alpha <= 0) {
            return;
        }
        ctx.fillStyle = 'red';
        ctx.globalAlpha = alpha;
        var i0 = messages.length >= 4 ? messages.length - 4 : 0;
        var y = 50;
        for (var i = messages.length - 1; i >= i0; i--) {
            ctx.fillText(messages[i], WIDTH / 2 - 100, y);
            y += 30;
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = oldColor;
        ctx.strokeStyle = oldStyle;
    };
}

var messages = new Messages();

function Radar() {
    this.isOn = false;
    this.available = true;
    this.seconds = 20;

    this.duration = 300;
    var tick = 1200;

    this.update = function () {
        tick++;
        this.seconds = 20 - Math.floor(tick / 60);
        if (tick > this.duration && this.duration < 1200) {
            this.isOn = false;
        }
        if (tick >= 1200) {
            this.available = true;
            tick = 1200;
        }
    };

    this.on = function () {
        tick = 0;
        this.isOn = true;
        this.available = false;
    };
}

var radar = new Radar();

/**
 * Update game state
 * @returns {undefined}
 */
var tick = 0;
function update() {
    tick = (tick + 1) % 900;

    messages.update();
    radar.update();

    player.cost = kills - deathes;
    damagePrice = Math.floor(50 + (player.damage - defDamage) * 5);
    rangePrice = Math.floor(50 + (player.attackRange - defRange) * 0.25);
    attackSpeedPrice = Math.floor(50 + (player.attackSpeed - defAttackSpeedPrice) * 10)

    radar.duration = player.cost > 0 ? 300 + 60 * player.cost : 300;

    player.isWalk = false;
    player.isAttack = isMouseDown;
    switch (controlCode) {
        case 8: //W
        case 13: //WDA
            player.isWalk = true;
            player.state = 0;
            player.walkAngle = 1.5 * Math.PI;
            break;
        case 4: //D
            player.isWalk = true;
            player.state = 3;
            player.walkAngle = 0;
            break;
        case 2: //S
        case 7: //DSA
            player.isWalk = true;
            player.state = 2;
            player.walkAngle = 0.5 * Math.PI;
            ;
            break;
        case 1: //A
            player.isWalk = true;
            player.state = 1;
            player.walkAngle = Math.PI;
            break;
        case 9://WA
            player.isWalk = true;
            player.state = 1;
            player.walkAngle = 1.25 * Math.PI;
            break;
        case 3://SA
            player.isWalk = true;
            player.state = 2;
            player.walkAngle = 0.75 * Math.PI;
            break;
        case 12://WD
            player.isWalk = true;
            player.state = 0;
            player.walkAngle = 1.75 * Math.PI;
            break;
        case 6://SD
            player.isWalk = true;
            player.state = 3;
            player.walkAngle = 0.25 * Math.PI;
            break;
    }

    var aAngle = getAngle(ax - WIDTH / 2 - 32, ay - HEIGHT / 2 - 32);
    var angle = getAngle(player.walkAngle);
    var du = Math.abs(aAngle - angle);

    player.bckAttack = du > 135 && du < 225 ? true : false;
    player.setAttackAngle(aAngle);

    player.update(environment);
    sendData({name: 'update', game: game, player: player});
    if (player.hp <= 0 && isAlive) {
        player.gold = gold;
        sendData({name: 'death', game: game, player: player});
        isAlive = false;
        deathes++;
        gold /= 2;
        player.setEnvNull(environment);
    }

    if (player.canAttack()) {
        bullets['b' + bulletCount] = new Bullet(player, player.damage, player.bulletSpeed, player.attackRange);
        bullets['b' + bulletCount].setImage(arrowImage);
        bulletCount++;
        sendData({name: 'attack', game: game, player: player});
    }

    for (var key in bullets) {
        bullets[key].update();
        if (bullets[key].isFinish(environment)) {
            delete bullets[key];
        }
    }

    if (deathes > kills && tick % 60 === 0) {
        gold += 1;
    }
//боты
    currentBotCount = 0;
    for (var key in bots) {
        var bot = bots[key];
        if (bot.hp <= 0) {
            if (bot.lastHitOwner === username) {
                gold += bot.cost;
            }
            bots[key].setEnvNull(environment);
            delete bots[key];
            continue;
        }
        currentBotCount++;
        bot.defAim(player, players);
        bot.defDirection(environment);
        bot.update(environment);
        if (bot.defAttack(player, players) === username && bot.canAttack()) {
            player.hp -= bot.damage;
            player.lastHitOwner = 'AI';
        }
    }
    if (currentBotCount < maxBotsCount && tick === 0) {
        sendData({name: 'create_bot', game: game, player: null});
    }
}

/**
 * Draw game screen
 * @returns {undefined}
 */
function render() {
    environment.drawAll(player, ctx);
    player.draw(WIDTH / 2 - 32, HEIGHT / 2 - 32, ctx, false);

    for (var key in players) {
        players[key].relDraw(player, ctx);
    }

    for (var key in bots) {
        bots[key].draw(player, ctx, false);
    }

    environment.drawBushes(player, ctx);
    environment.redrawWalls(player, ctx);
    player.draw(WIDTH / 2 - 32, HEIGHT / 2 - 32, ctx, true);
    player.drawNav(WIDTH / 2, HEIGHT / 2, players, bots, radar.isOn, ctx);
    for (var key in bots) {
        bots[key].draw(player, ctx, true);
    }
    for (var key in bullets) {
        bullets[key].draw(player, ctx);
    }
    messages.showMessages(ctx);
}

// override requestAnimationFrame to emulate different FPS count (same in all gameloop examples)
window.requestAnimationFrame = function (func) {
    clearTimeout(window.rafTimer);
    window.rafTimer = setTimeout(func, 1000 / (window.maxFPS || 60));
};

// game loop
var last = performance.now();
var step = 1 / 60; // update should be called 60 times per second
var dt = 0;
var now;

function frame() {
    now = performance.now();
    dt += (now - last) / 1000;
    while (dt > step) {
        dt = dt - step;
        update();
    }
    last = now;

    render();
    requestAnimationFrame(frame);
}

function receive(data) {
    if (data.name === 'get_start_state' && !isGameStart) {
        isGameStart = true;
        environment.setBushes(data.game.gameState.bushes, [bushImage1, bushImage2]);
        environment.setWalls(data.game.gameState.walls, [wallImage1, wallImage2, wallImage3, wallImage]);
        var units = data.game.gameState.players;
        maxBotsCount = units.length * 10;
        for (var i = 0; i < units.length; i++) {
            var u = units[i];
            players[u.name] = new Player(u.x, u.y, u.hp, u.speed, u.attackSpeed,
                    u.viewRange, u.attackRange, u.damage, u.bulletSpeed);
            players[u.name].name = u.name;
            players[u.name].walkAngle = u.walkAngle;
            players[u.name].attackAngle = u.attackAngle;
            players[u.name].curFrame = u.curFrame;
            players[u.name].bckAttack = u.bckAttack;
            players[u.name].isAttack = u.isAttack;
            players[u.name].isWalk = u.isWalk;
            players[u.name].state = u.state;
            players[u.name].setImages(image1, image2, image3);
        }
        player = players[username];
        player.name = username;
        delete players[username];
        requestAnimationFrame(frame);
        player.update(environment);
    }
    if ((data.name === 'update' || data.name === 'respawn') && data.player.name !== username) {
        players[data.player.name].setEnvNull(environment);
        players[data.player.name].x = data.player.x;
        players[data.player.name].y = data.player.y;
        players[data.player.name].hp = data.player.hp;
        players[data.player.name].speed = data.player.speed;

        players[data.player.name].cost = data.player.cost;

        players[data.player.name].damage = data.player.damage;
        players[data.player.name].viewRange = data.player.viewRange;
        players[data.player.name].attackRange = data.player.attackRange;
        players[data.player.name].attackSpeed = data.player.attackSpeed;
        players[data.player.name].bulletSpeed = data.player.bulletSpeed;

        players[data.player.name].walkAngle = data.player.walkAngle;
        players[data.player.name].attackAngle = data.player.attackAngle;
        players[data.player.name].curFrame = data.player.curFrame;
        players[data.player.name].bckAttack = data.player.bckAttack;
        players[data.player.name].isAttack = data.player.isAttack;
        players[data.player.name].isWalk = data.player.isWalk;
        players[data.player.name].state = data.player.state;
        players[data.player.name].update(environment);
    }
    if (data.name === 'attack' && data.player.name !== username) {
        bullets['b' + bulletCount] = new Bullet(players[data.player.name],
                players[data.player.name].damage,
                players[data.player.name].bulletSpeed,
                players[data.player.name].attackRange);
        bullets['b' + bulletCount].setImage(arrowImage);
        bulletCount++;
    }
    if (data.name === 'respawn' && data.player.name === username) {
        player.x = data.player.x;
        player.y = data.player.y;
        player.hp = data.player.hp;
        player.speed = data.player.speed;

        player.damage = data.player.damage;
        player.viewRange = data.player.viewRange;
        player.attackRange = data.player.attackRange;
        player.attackSpeed = data.player.attackSpeed;
        player.bulletSpeed = data.player.bulletSpeed;

        player.walkAngle = data.player.walkAngle;
        player.attackAngle = data.player.attackAngle;
        player.curFrame = data.player.curFrame;
        player.bckAttack = data.player.bckAttack;
        player.isAttack = data.player.isAttack;
        player.isWalk = data.player.isWalk;
        player.state = data.player.state;

        isAlive = true;
    }
    if (data.name === 'respawn') {
        var killerName = data.player.lastHitOwner;
        var msg = killerName !== 'AI' ? 'Игрок ' + killerName + ' убил игрока ' +
                data.player.name : 'Компьютер убил игрока ' + data.player.name;
        if (killerName === username) {
            kills++;
            var cost = data.player.cost;
            if (cost >= 0) {
                gold += 100 + cost * 5 + data.player.gold / 2;
            } else {
                var price = cost > -5 ? 100 + cost * 10 : 50;
                gold += price;
            }
        }
        messages.addMessage(msg);
    }

    if (data.name === 'create_bot') {
        var u = data.player;
        bots['bot' + botCount] = new Bot(u.x, u.y, BOT_HP_RATIO * u.hp, BOT_SPEED_RATIO * u.speed,
                BOT_ATTACK_SPEED_RATIO * u.attackSpeed,
                BOT_VIEW_RANGE_RATIO * u.viewRange, u.attackRange,
                u.damage, u.bulletSpeed);
        bots['bot' + botCount].name = 'bot' + botCount;
        bots['bot' + botCount].walkAngle = u.walkAngle;
        bots['bot' + botCount].attackAngle = u.attackAngle;
        bots['bot' + botCount].curFrame = u.curFrame;
        bots['bot' + botCount].bckAttack = u.bckAttack;
        bots['bot' + botCount].isAttack = u.isAttack;
        bots['bot' + botCount].isWalk = u.isWalk;
        bots['bot' + botCount].state = u.state;
        bots['bot' + botCount].setImages(botImage1, botImage2, botImage3);
        bots['bot' + botCount].generatePoints(environment);
        bots['bot' + botCount].update(environment);
        botCount++;
    }
    /*if (data.name === 'getData' && data.player.name !== username) {
     sendData({name: 'synchronize', game: game, player: players[data.player.name]});
     }*/
}

connect(receive, path, gameName, username);