function Player(x, y, hp, speed, attackSpeed, vr, ar, dmg, bSpeed) {

    this.name = 'default';
    this.cost = 0;

    this.x = x;		//координата x 
    this.y = y;		//координата y 
    this.hp = hp;   //здоровье 
    this.speed = speed;  //скорость передвижения
    this.attackSpeed = attackSpeed; //скорость атаки 
    this.viewRange = vr; //дальность видимости
    this.attackRange = ar; //дальность атаки
    this.damage = dmg; //урон при наилудшем попадании
    this.bulletSpeed = bSpeed; //скорость полёта снаряда

    this.walkAngle = 1.5 * Math.PI;  //направление движения 
    this.attackAngle = 0; //угол атаки
    this.curFrame = 0;  //текущий кадр анимации

    this.isWalk = false;      //флаг движения
    this.isAttack = false;    //флаг атаки
    this.bckAttack = false;   //флаг обратного движения при атаке

    this.state = 0;

    this.lastHitOwner = null;

    var ITER_CONST = 30;
    var TICK_CONST = 30;

    var shadowImage = new Image();
    shadowImage.src = 'css/images/shadow.png';
    var imageWalk = null;
    var imageWalkAttack = null;
    var imageStandAttack = null;
    var width = 64;  //default value
    var height = 64; //default value
    var frames = 8;  //default value
    var bFrames = 12;

    var size = 64;

    var iter = 0;
    var tick = 0;

    this.setImages = function (imgWalk, imgStandAttack, imgWalkAttack) {
        imageWalk = imgWalk;
        imageStandAttack = imgStandAttack;
        imageWalkAttack = imgWalkAttack;
    };

    this.setWidth = function (value) {
        width = value;
    };

    this.setHeight = function (value) {
        height = value;
    };

    this.setFrames = function (value) {
        frames = value;
    };

    this.setAttackAngle = function (angle) {
        this.attackAngle = angle;
        if (this.isAttack) {
            if (angle > 225 && angle < 315) {
                this.state = 0;
            }
            if (angle > 315 || angle < 45) {
                this.state = 3;
            }
            if (angle > 45 && angle < 135) {
                this.state = 2;
            }
            if (angle < 225 && angle > 135) {
                this.state = 1;
            }
        }
    };

    this.drawNav = function (x, y, players, flag, ctx) {
        //рисование навигации
        var oldStyle = ctx.strokeStyle;
        var oldLine = ctx.lineWidth;
        for (var key in players) {
            var dx = players[key].x - this.x;
            var dy = players[key].y - this.y;
            if (flag || Math.abs(dx) > WIDTH / 2 + size / 2 || Math.abs(dy) > HEIGHT / 2 + size / 2) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 4;
                ctx.globalAlpha = 0.45;
                var angle = getAngle(dx, dy);
                angle *= Math.PI / 180;
                ctx.beginPath();
                var cx = x + size * Math.cos(angle);
                var cy = y + size * Math.sin(angle);
                ctx.arc(cx, cy, 5, 0, 2 * Math.PI, true);
                ctx.stroke();
                ctx.globalAlpha = 1;
                if (flag) {
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy);
                    ctx.lineTo(cx + 8, cy - 8);
                    ctx.lineTo(cx + 13, cy - 8);
                    ctx.stroke();
                    var oldColor = ctx.fillStyle;
                    ctx.fillStyle = 'red';
                    ctx.font = 10 + "px Georgia";
                    ctx.fillText('' + key, cx + 7, cy - 11);
                    ctx.fillText('' + Math.floor(players[key].hp) + '%', cx + 7, cy + 1);
                }
                ctx.fillStyle = oldColor;
            }
        }
        ctx.strokeStyle = oldStyle;
        ctx.lineWidth = oldLine;
    };

    this.draw = function (x, y, ctx, isInvise) {
        //рисование самого игрока
        ctx.font = 10 + "px Georgia";
        ctx.fillText('' + this.name + ': ' + Math.floor(this.hp) + '%', x, y);
        if (isInvise) {
            ctx.globalAlpha = 0.35;
        }
        if (this.isWalk) {
            if (this.isAttack) {
                var f = this.bckAttack ? bFrames - this.curFrame : this.curFrame;
                ctx.drawImage(imageWalkAttack, width * f, height * this.state, width, height, x, y, width, height);
            } else {
                ctx.drawImage(imageWalk, width * this.curFrame, height * this.state, width, height, x, y, width, height);
            }
        } else {
            if (this.isAttack) {
                ctx.drawImage(imageStandAttack, width * this.curFrame, height * this.state, width, height, x, y, width, height);
            } else {
                ctx.drawImage(imageWalk, width * this.curFrame, height * this.state, width, height, x, y, width, height);
            }
        }
        ctx.drawImage(shadowImage, x, y + height / 6);
        if (isInvise) {
            ctx.globalAlpha = 1;
        }
        //рисование видимой области
        if (isInvise) {
            var r = this.viewRange;
            ctx.fillStyle = "rgba(25, 25, 25, 0.2)";
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, HEIGHT / 2);
            ctx.lineTo(WIDTH / 2 - r, HEIGHT / 2);
            ctx.arc(WIDTH / 2, HEIGHT / 2, r, Math.PI, 2 * Math.PI);
            ctx.lineTo(WIDTH, HEIGHT / 2);
            ctx.lineTo(WIDTH, 0);
            ctx.lineTo(0, 0);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(WIDTH, HEIGHT / 2);
            ctx.lineTo(WIDTH / 2 + r, HEIGHT / 2);
            ctx.arc(WIDTH / 2, HEIGHT / 2, r, 0, Math.PI);
            ctx.lineTo(0, HEIGHT / 2);
            ctx.lineTo(0, HEIGHT);
            ctx.lineTo(WIDTH, HEIGHT);
            ctx.lineTo(WIDTH, HEIGHT / 2);
            ctx.fill();
        }
    };

    this.relDraw = function (player, ctx) {
        if (Math.sqrt((player.x - this.x) * (player.x - this.x) +
                (player.y - this.y) * (player.y - this.y)) > player.viewRange) {
            return;
        }
        var x = WIDTH / 2 - player.x + this.x - width / 2;
        var y = HEIGHT / 2 - player.y + this.y - height / 2;
        if (this.isWalk) {
            if (this.isAttack) {
                var f = this.bckAttack ? bFrames - this.curFrame : this.curFrame;
                ctx.drawImage(imageWalkAttack, width * f, height * this.state, width, height, x, y, width, height);
            } else {
                ctx.drawImage(imageWalk, width * this.curFrame, height * this.state, width, height, x, y, width, height);
            }
        } else {
            if (this.isAttack) {
                ctx.drawImage(imageStandAttack, width * this.curFrame, height * this.state, width, height, x, y, width, height);
            } else {
                ctx.drawImage(imageWalk, width * this.curFrame, height * this.state, width, height, x, y, width, height);
            }
        }
        ctx.font = 10 + "px Georgia";
        var oldColor = ctx.fillStyle;
        ctx.fillStyle = 'red';
        ctx.fillText('' + Math.floor(this.hp) + "%", x + 24, y + 10);
        ctx.fillText('' + this.name, x + 15, y + 70);
        ctx.drawImage(shadowImage, x, y + height / 6);
        ctx.fillStyle = oldColor;
    };

    /**
     *Изменение состояния игрока
     */
    this.update = function (environment) {
        //итерация анимационного цикла
        if (this.isWalk || this.isAttack) {
            iter = this.isWalk && (!this.isAttack) ? iter + 1 : iter;
        } else {
            this.curFrame = 0;
        }
        if (this.curFrame === frames) {
            this.curFrame = 1;
        }
        if (iter >= ITER_CONST / this.speed || tick >= TICK_CONST / this.attackSpeed && this.isAttack) {
            this.curFrame++;
            iter = 0;
        }
        var ratio = 0.65 + 0.35 * this.hp / 100;
        ratio = this.isAttack ? ratio * 0.7 : ratio;
        //изменение координат игрока
        var i = Math.floor(this.x / size);
        var j = Math.floor(this.y / size);
        environment.getEnvCell(i, j).unit = null;

        var x = this.x + this.speed * Math.cos(this.walkAngle) * ratio;
        var y = this.y + this.speed * Math.sin(this.walkAngle) * ratio;

        if (canWalk(x, y, environment, this)) {
            this.x = x;
            this.y = y;
        } else {
            this.x = canWalk(x, this.y, environment, this) ? x : this.x;
            this.y = canWalk(this.x, y, environment, this) ? y : this.y;
        }

        i = Math.floor(this.x / size);
        j = Math.floor(this.y / size);
        environment.getEnvCell(i, j).unit = this;
        //регеннерация
        if (this.hp < 100) {
            this.hp = !this.isAttack && !this.isWalk ? this.hp + 0.025 : this.hp + 0.005;
            this.hp = this.hp > 100 ? 100 : this.hp;
        }
    };

    this.canAttack = function () {
        if (this.isAttack) {
            tick = tick >= TICK_CONST / this.attackSpeed ? 0 : tick + 1;
            return tick === 0 && this.curFrame === frames;
        } else {
            tick = tick >= TICK_CONST / this.attackSpeed ? tick : tick + 1;
            return false;
        }
    };

    function canWalk(x, y, environment, self) {
        var d = 5;

        var x1 = x - size / 2 + d;
        var y1 = y - size / 2 + d;
        var x2 = x + size / 2 - d;
        var y2 = y + size / 2 - d;
        var x3 = x - size / 2 + d;
        var y3 = y + size / 2 - d;
        var x4 = x + size / 2 - d;
        var y4 = y - size / 2 + d;

        var i = Math.floor(x / size);
        var j = Math.floor(y / size);

        var i1 = Math.floor(x1 / size);
        var j1 = Math.floor(y1 / size);
        var i2 = Math.floor(x2 / size);
        var j2 = Math.floor(y2 / size);
        var i3 = Math.floor(x3 / size);
        var j3 = Math.floor(y3 / size);
        var i4 = Math.floor(x4 / size);
        var j4 = Math.floor(y4 / size);

        /*var units = [environment.getEnvCell(i1, j1).unit, 
         environment.getEnvCell(i2, j2).unit,
         environment.getEnvCell(i3, j3).unit,
         environment.getEnvCell(i4, j4).unit];
         var i0 = i > 2 ? i - 3 : 0;
         var j0 = j > 2 ? j - 3 : 0;
         var dim = environment.getSizes();
         var il = i < dim.n - 2 ? i + 3 : dim.n;
         var jl = j < dim.m - 2 ? j + 3 : dim.m;
         for(var ii = i0; ii < il; ii++){
         for(var jj = j0; jj < jl; jj++){
         var u = environment.getEnvCell(ii, jj).unit;
         if(u !== null){
         units.push(u);
         }
         }
         }
         for(var k = 0; k < units.length; k++){
         if(units[k] !== null){
         var dx = units[k].x - x;
         var dy = units[k].y - y;
         var dis = Math.abs(dx) + Math.abs(dy);
         if(dis < size){
         return false; 
         }
         }
         }*/
        return self.isWalk && environment.isCellWalkable(i1, j1)
                && environment.isCellWalkable(i2, j2)
                && environment.isCellWalkable(i3, j3)
                && environment.isCellWalkable(i4, j4);
    }

}