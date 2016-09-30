function Environment(n, m, images) {

    var map = [];

    var taleWidth = 64;
    var taleHeight = 64;

    var bushes = [];
    var walls = [];

    for (var i = 0; i < n; i++) {
        map[i] = [];
        var len = images.length - 1;
        for (var j = 0; j < m; j++) {
            var index = Math.round(Math.random() * len);
            map[i][j] = new EnvCell('bckg' + index, 0, images[index], taleWidth, taleHeight);
        }
    }

    this.setTaleWidth = function (value) {
        var taleWidth = value;
    };

    this.setTaleHeight = function (value) {
        var taleHeight = value;
    };

    this.setEnvTale = function (i, j, envCell) {
        map[i][j] = envCell;
    };

    this.getEnvCell = function (i, j) {
        return map[i][j];
    };

    this.getSizes = function () {
        return {n: map.length, m: map[0].length};
    };    

    this.setWalls = function (wallArr, wallImages) {
        for (var i = 0; i < wallArr.length; i++) {
            walls.push(wallArr[i]);
            map[wallArr[i].x][wallArr[i].y] = new EnvCell('wall', Infinity, wallImages[wallArr[i].type], taleWidth, taleHeight);
        }
    };

    this.setBushes = function (bushArr, bushImages) {
        for (var i = 0; i < bushArr.length; i++) {
            var bush = bushArr[i];
            bush.image = bushImages[bushArr[i].type];
            bushes.push(bush);
        }
    };

    this.isCellWalkable = function (i, j) {
        return i >= 0 && j >= 0 && i < n && j < m && map[i][j].hp == 0;
    };

    /**
     * Отрисовка всего окружения относительно реальных координат игрока
     */
    this.drawAll = function (player, ctx) {
        ctx.fillStyle = "black";
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        var px = player.x;
        var py = player.y;
        var i0 = Math.floor((px - WIDTH / 2) / taleWidth);
        var j0 = Math.floor((py - HEIGHT / 2) / taleHeight);
        i0 = i0 < 0 ? 0 : i0;
        j0 = j0 < 0 ? 0 : j0;
        for (var i = i0; i < n && i * taleWidth + WIDTH / 2 - px <= WIDTH; i++) {
            for (var j = j0; j < m && j * taleHeight + HEIGHT / 2 - py <= HEIGHT; j++) {
                ctx.strokeStyle = "grey";
                ctx.lineWidth = 0.5;
                map[i][j].draw(i * taleWidth + WIDTH / 2 - px, j * taleHeight + HEIGHT / 2 - py, ctx);
                ctx.strokeRect(i * taleWidth + WIDTH / 2 - px, j * taleHeight + HEIGHT / 2 - py, taleWidth, taleHeight);
            }
        }
        ctx.strokeStyle = "black";
        ctx.strokeRect(0, 0, WIDTH, HEIGHT);
    };

    this.drawBushes = function (player, ctx) {
        var px = player.x;
        var py = player.y;
        for (var i = 0; i < bushes.length; i++) {
            var x = bushes[i].x * taleWidth + WIDTH / 2 - px;
            var y = bushes[i].y * taleHeight + HEIGHT / 2 - py;
            if (x > -2 * taleWidth && x < WIDTH + 2 * taleWidth && y > -2 * taleHeight && y < HEIGHT + 2 * taleHeight) {
                ctx.drawImage(bushes[i].image, x, y);
            }
        }
    };

    this.redrawWalls = function (player, ctx) {
        var px = player.x;
        var py = player.y;
        for (var i = 0; i < walls.length; i++) {
            var x = walls[i].x * taleWidth + WIDTH / 2 - px;
            var y = walls[i].y * taleHeight + HEIGHT / 2 - py;
            if (x > -taleWidth && x < WIDTH + taleWidth && y > -taleHeight && y < HEIGHT + taleHeight) {
                ctx.strokeStyle = "grey";
                ctx.lineWidth = 0.5;
                map[walls[i].x][walls[i].y].draw(x, y, ctx);
                ctx.strokeRect(x, y, taleWidth, taleHeight);
            }
        }
    };

}