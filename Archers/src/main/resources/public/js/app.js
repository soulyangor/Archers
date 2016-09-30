'use strict';

var App = angular.module('app', []);

function toDeg(angle) {
    return 180 * angle / Math.PI;
}

function getAngle(sideX, sideY) {
    var angle = Math.atan(sideY / sideX);
    if (sideX < 0) {
        angle += Math.PI;
    }
    if (angle < 0) {
        angle += 2 * Math.PI;
    }
    angle = toDeg(angle);
    return angle;
}