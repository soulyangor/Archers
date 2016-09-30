function Bullet(player, damage, speed, range) {

    this.angle = Math.PI * player.attackAngle / 180;
    this.x = player.x;// + 32 * Math.cos(this.angle);
    this.y = player.y;// + 32 * Math.sin(this.angle);
    this.damage = damage;
    this.speed = speed;
    this.range = range;

    var owner = player;

    var distance = 0;
    var image = null;
    var width = 64;  //default value
    var height = 64; //default value
    var size = 64;

    this.getOwner = function () {
        return owner;
    };

    this.setImage = function (img) {
        image = img;
    };

    this.setWidth = function (value) {
        width = value;
    };

    this.setHeight = function (value) {
        height = value;
    };

    this.draw = function (player, ctx) {
        var x = WIDTH / 2 - player.x + this.x;
        var y = HEIGHT / 2 - player.y + this.y;

        var r = 20;
        var u = this.angle;

        var dx = this.x - player.x;
        var dy = this.y - player.y;

        if (Math.sqrt(dx * dx + dy * dy) > player.viewRange) {
            return;
        }

        //ctx.strokeRect(x, y, 10, 10);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.angle)
        ctx.drawImage(image, -width / 2, -height / 2);
        ctx.restore();

    };

    /**
     *��������� ��������� �������
     */
    this.update = function () {
        distance += this.speed;
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    };

    this.isFinish = function (environment) {
        var x = this.x + width * Math.cos(this.angle) / 3;
        var y = this.y + height * Math.sin(this.angle) / 3;
        var i = Math.floor(x / width);
        var j = Math.floor(y / height);

        if (distance >= this.range || !environment.isCellWalkable(i, j)) {
            return true
        }

        var d = 5;

        var x1 = x - size / 2 + d;
        var y1 = y - size / 2 + d;
        var x2 = x + size / 2 - d;
        var y2 = y + size / 2 - d;
        var x3 = x - size / 2 + d;
        var y3 = y + size / 2 - d;
        var x4 = x + size / 2 - d;
        var y4 = y - size / 2 + d;

        var i1 = Math.floor(x1 / size);
        var j1 = Math.floor(y1 / size);
        var i2 = Math.floor(x2 / size);
        var j2 = Math.floor(y2 / size);
        var i3 = Math.floor(x3 / size);
        var j3 = Math.floor(y3 / size);
        var i4 = Math.floor(x4 / size);
        var j4 = Math.floor(y4 / size);

        var units = [environment.getEnvCell(i, j).unit, environment.getEnvCell(i1, j1).unit,
            environment.getEnvCell(i2, j2).unit, environment.getEnvCell(i3, j3).unit,
            environment.getEnvCell(i4, j4).unit];
        for (var k = 0; k < units.length; k++) {
            if (units[k] !== null && units[k] !== owner) {
                var dx = units[k].x - x - size / 12;
                var dy = units[k].y - y - size / 12;
                var dis = Math.sqrt(9 * dx * dx / (size * size) + 4 * dy * dy / (size * size));
                if (dis < 1) {
                    units[k].hp -= this.damage;
                    units[k].lastHitOwner = owner.name;
                    return true;
                }
            }
        }
        return false;
    };

}