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

    function Point(x, y) {
        this.x = x;
        this.y = y;
        this.parent = null;
        this.G = 0;
        this.H = 0;
        this.F = 0;
        this.calcH = function (ex, ey) {
            this.H = Math.sqrt((ex - this.x) * (ex - this.x) + (ey - this.y) * (ey - this.y));
        }
        this.calcF = function ( ) {
            this.F = this.G + this.H;
        }
    }

    this.searchPath = function (x0, y0, x, y) {
        var openList = {};
        var closeList = {};
        var step = 0;
        var newPoint = new Point(x0, y0);
        var curPoint = null;
        newPoint.calcH(x, y);
        newPoint.calcF( );
        var tKey = 'key' + newPoint.x + '|' + newPoint.y;
        openList[tKey] = newPoint;
        var count = 1;
        var complete = false;
        while ((count > 0) && (!complete)) {
            var FMin = Infinity;
            curPoint = null;
            for (var key in openList) {
                if (openList[key].F < FMin) {
                    FMin = openList[key].F;
                    curPoint = openList[key];
                }
            }
            if (curPoint === null) {
                return null;
            }
            tKey = 'key' + curPoint.x + '|' + curPoint.y;
            closeList[tKey] = curPoint;
            delete openList[tKey];
            for (var i = curPoint.x - 1; i < curPoint.x + 2; i++)
                for (var j = curPoint.y - 1; j < curPoint.y + 2; j++) {
                    if ((map[i] === undefined) || (map[i][j] === undefined)) {
                        continue;
                    }
                    if (map[i][j].hp > 0) {
                        continue;
                    }
                    if (!((curPoint.x == i) || (curPoint.y == j))) {
                        if ((map[curPoint.x][j].hp > 0) || (map[i][curPoint.y].hp > 0)) { // || на &&
                            continue;
                        }
                    }
                    if ((i == curPoint.x) && (j == curPoint.y)) {
                        continue;
                    } else if (!complete) {
                        complete = (i == x) && (j == y);
                    } else
                        break;
                    tKey = 'key' + i + '|' + j;
                    if (tKey in closeList) {
                        continue;
                    }
                    if (tKey in openList) {
                        if ((curPoint.x == openList[tKey].x) ||
                                (curPoint.y == openList[tKey].y)) {
                            step = 1;
                        } else {
                            step = 1.41;
                        }
                        if (openList[tKey].G > curPoint.G + step) {
                            openList[tKey].parent = curPoint;
                            openList[tKey].G = curPoint.G + step;
                            openList[tKey].calcF();
                        }
                    } else {
                        if ((curPoint.x == i) ||
                                (curPoint.y == j)) {
                            step = 1;
                        } else {
                            step = 1.41;
                        }
                        newPoint = new Point(i, j);
                        newPoint.parent = curPoint;
                        newPoint.G = curPoint.G + step;
                        newPoint.calcH(x, y);
                        newPoint.calcF( );
                        openList[tKey] = newPoint;
                        count++;
                    }
                }
        }
        return openList['key' + x + '|' + y ];
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

