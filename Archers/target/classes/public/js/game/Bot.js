function Bot(x, y, hp, speed, attackSpeed, vr, ar, dmg, bSpeed) {

    this.name = 'default';
    this.cost = 10;

    this.aimX = 0;
    this.aimY = 0;

    this.tmp = null;

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

    var points = [];
    var curPoint = 0;

    var ITER_CONST = 30;
    var TICK_CONST = 30;

    var DAMAGE_LIMIT = 30;
    var SPEED_LIMIT = 1.9;
    var VIEW_RANGE_LIMIT = 1500;
    var COST_LIMIT = 100;

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

    this.generatePoints = function (environment) {
        var i = Math.floor(this.x / size);
        var j = Math.floor(this.y / size);
        var iter = 3;
        while (!environment.isCellWalkable(i + iter, j)) {
            iter++;
        }
        points.push({x: i + iter, y: j});
        iter = 3;
        while (!environment.isCellWalkable(i - iter, j)) {
            iter++;
        }
        points.push({x: i - iter, y: j});
        iter = 3;
        while (!environment.isCellWalkable(i, j + iter)) {
            iter++;
        }
        points.push({x: i, y: j + iter});
        iter = 3;
        while (!environment.isCellWalkable(i, j - iter)) {
            iter++;
        }
        points.push({x: i, y: j - iter});
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

    this.draw = function (player, ctx, isInvise) {
        if (Math.sqrt((player.x - this.x) * (player.x - this.x) +
                (player.y - this.y) * (player.y - this.y)) > player.viewRange) {
            return;
        }
        if (isInvise) {
            ctx.globalAlpha = 0.35;
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
        if (isInvise) {
            ctx.globalAlpha = 1;
        }
    };

    this.defAttack = function (player, players) {
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        var r = Math.sqrt(dx * dx + dy * dy);
        if (r < size) {
            this.setAttackAngle(getAngle(dx, dy));
            this.isAttack = true;
            if (r < size / 2) {
                this.isWalk = false;
            }
            return player.name;
        }
        for (var key in players) {
            dx = players[key].x - this.x;
            dy = players[key].y - this.y;
            r = Math.sqrt(dx * dx + dy * dy);
            if (r < size) {
                this.setAttackAngle(getAngle(dx, dy));
                this.isAttack = true;
                if (r < size / 2) {
                    this.isWalk = false;
                }
                return key;
            }
        }
        this.isAttack = false;
        return null;
    };

    this.defAim = function (player, players) {
        this.isWalk = true;
        var rMin = Infinity;
        var minKey = null;
        var dx = player.x - this.x;
        var dy = player.y - this.y;
        var r = Math.sqrt(dx * dx + dy * dy);
        var notVisible = false;
        if (r < this.viewRange) {
            rMin = r;
            this.aimX = player.x;
            this.aimY = player.y;
        } else {
            notVisible = true;
        }
        for (var key in players) {
            dx = players[key].x - this.x;
            dy = players[key].y - this.y;
            r = Math.sqrt(dx * dx + dy * dy);
            if (r < this.viewRange && r < rMin) {
                rMin = r;
                minKey = key;
            }
        }
        if (minKey === null && notVisible) {
            this.aimX = points[curPoint].x * size + size / 2;
            this.aimY = points[curPoint].y * size + size / 2;
            return;
        } else if (minKey === null) {
            this.aimX = player.x;
            this.aimY = player.y;
            return;
        }
        this.aimX = players[minKey].x;
        this.aimY = players[minKey].y;
    };

    this.defDirection = function (environment) {
        var i0 = Math.floor(this.aimX / size);
        var j0 = Math.floor(this.aimY / size);
        var i = Math.floor(this.x / size);
        var j = Math.floor(this.y / size);

        if (Math.abs(i0 - i) + Math.abs(j0 - j) === 0) {
            this.tmp = null;
            curPoint = curPoint < points.length - 1 ? curPoint + 1 : 0;
            return;
        }
        if (this.tmp === null) {
            var p = environment.searchPath(i0, j0, i, j);
            if (p === undefined || p === null) {
                return;
            }
            p = p.parent !== null ? p.parent : p;
            this.tmp = p;
        }
        var cx = this.tmp.x * size + size / 2;
        var cy = this.tmp.y * size + size / 2;

        var upgX = cx - this.x;
        var upgY = cy - this.y;

        var angle = getAngle(upgX, upgY);

        if (angle > 247.5 && angle <= 337.5) {
            this.state = 0;
        }
        if (angle > 337.5 || angle <= 67.5) {
            this.state = 3;
        }
        if (angle > 67.5 && angle <= 157.5) {
            this.state = 2;
        }
        if (angle < 247.5 && angle > 157.5) {
            this.state = 1;
        }

        this.walkAngle = Math.PI * angle / 180;

        var r = Math.sqrt(upgX * upgX + upgY * upgY);
        if (r <= this.speed) {
            this.tmp = null;
        }

    };

    /**
     *Изменение состояния бота
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
        //изменение координат игрока
        var i = Math.floor(this.x / size);
        var j = Math.floor(this.y / size);
        environment.getEnvCell(i, j).unit = null;

        var x = this.x + this.speed * Math.cos(this.walkAngle);
        var y = this.y + this.speed * Math.sin(this.walkAngle);

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
        if (this.hp < 50) {
            this.hp = !this.isAttack && !this.isWalk ? this.hp + 0.025 : this.hp + 0.005;
            this.hp = this.hp > 50 ? 50 : this.hp;
        }
        if (this.hp === 50) {
            this.cost = this.cost < COST_LIMIT ? this.cost + 0.02 : COST_LIMIT;
            this.speed = this.speed < SPEED_LIMIT ? this.speed + 0.01 : SPEED_LIMIT;
            if (this.speed === SPEED_LIMIT) {
                this.damage = this.damage < DAMAGE_LIMIT ? this.damage + 0.01 : DAMAGE_LIMIT;
                if (this.damage === DAMAGE_LIMIT) {
                    this.viewRange = this.viewRange < VIEW_RANGE_LIMIT ? this.viewRange + 0.5 : VIEW_RANGE_LIMIT;
                }
            }
        }else{
            this.cost = this.cost < COST_LIMIT ? this.cost + 0.01 : COST_LIMIT;
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

    this.setEnvNull = function (environment) {
        var i = Math.floor(this.x / size);
        var j = Math.floor(this.y / size);
        environment.getEnvCell(i, j).unit = null;
    };

}