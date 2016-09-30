function EnvCell(tp, hp, img, imgWidth, imgHeight) {

    this.hp = hp;
    this.unit = null;

    var type = tp;
    var image = img;
    var width = imgWidth;
    var height = imgHeight;

    this.draw = function (x, y, ctx) {
        ctx.drawImage(image, x, y, width, height);
    };

}