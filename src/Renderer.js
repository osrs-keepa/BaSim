"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
var PIXEL_ALPHA = 255 << 24;
var Renderer = /** @class */ (function () {
    function Renderer(canvas, width, height, tileSize) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.tileSize = tileSize;
        this.resizeCanvas(width, height);
        this.setDrawColor(255, 255, 255, 255);
    }
    Renderer.prototype.fillOpaque = function (x, y) {
        this.setFilledRectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    };
    Renderer.prototype.fill = function (x, y) {
        this.drawFilledRectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    };
    Renderer.prototype.outline = function (x, y) {
        this.drawOutlinedRectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    };
    Renderer.prototype.outlineBig = function (x, y, width, height) {
        this.drawOutlinedRectangle(x * this.tileSize, y * this.tileSize, this.tileSize * width, this.tileSize * height);
    };
    Renderer.prototype.westLine = function (x, y) {
        this.drawVerticalLine(x * this.tileSize, y * this.tileSize, this.tileSize);
    };
    Renderer.prototype.eastLine = function (x, y) {
        this.drawVerticalLine((x + 1) * this.tileSize - 1, y * this.tileSize, this.tileSize);
    };
    Renderer.prototype.eastLineBig = function (x, y, length) {
        this.drawVerticalLine((x + 1) * this.tileSize - 1, y * this.tileSize, this.tileSize * length);
    };
    Renderer.prototype.southLine = function (x, y) {
        this.drawHorizontalLine(x * this.tileSize, y * this.tileSize, this.tileSize);
    };
    Renderer.prototype.northLine = function (x, y) {
        this.drawVerticalLine(x * this.tileSize, (y + 1) * this.tileSize - 1, this.tileSize);
    };
    Renderer.prototype.northLineBig = function (x, y, length) {
        this.drawVerticalLine(x * this.tileSize, (y + 1) * this.tileSize - 1, this.tileSize * length);
    };
    Renderer.prototype.cone = function (x, y) {
        this.drawCone(x * this.tileSize, y * this.tileSize, this.tileSize);
    };
    Renderer.prototype.fillItem = function (x, y) {
        var padding = this.tileSize >>> 2;
        var size = this.tileSize - 2 * padding;
        this.drawFilledRectangle(x * this.tileSize + padding, y * this.tileSize + padding, size, size);
    };
    Renderer.prototype.resizeCanvas = function (width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.canvasYFixOffset = (height - 1) * width;
        this.imageData = this.context.createImageData(width, height);
        this.pixels = new ArrayBuffer(this.imageData.data.length);
        this.pixels8 = new Uint8ClampedArray(this.pixels);
        this.pixels32 = new Uint32Array(this.pixels);
    };
    Renderer.prototype.setDrawColor = function (r, g, b, a) {
        this.drawColorRB = r | (b << 16);
        this.drawColorG = PIXEL_ALPHA | (g << 8);
        this.drawColor = this.drawColorRB | this.drawColorG;
        this.drawColorA = a + 1;
    };
    Renderer.prototype.clear = function () {
        for (var i = 0; i < this.pixels32.length; i++) {
            this.pixels32[i] = this.drawColor;
        }
    };
    Renderer.prototype.present = function () {
        this.imageData.data.set(this.pixels8);
        this.context.putImageData(this.imageData, 0, 0);
    };
    Renderer.prototype.drawPixel = function (index) {
        var color = this.pixels32[index];
        var oldRB = color & 0xFF00FF;
        var oldAG = color & 0xFF00FF00;
        var rb = oldRB + (this.drawColorA * (this.drawColorRB - oldRB) >> 8) & 0xFF00FF;
        var g = oldAG + (this.drawColorA * (this.drawColorG - oldAG) >> 8) & 0xFF00FF00;
        this.pixels32[index] = rb | g;
    };
    Renderer.prototype.drawHorizontalLine = function (x, y, length) {
        var index = this.xyToIndex(x, y);
        var endIndex = index + length;
        for (; index < endIndex; index++) {
            this.drawPixel(index);
        }
    };
    Renderer.prototype.drawVerticalLine = function (x, y, length) {
        var index = this.xyToIndex(x, y);
        var endIndex = index - length * this.canvasWidth;
        for (; index > endIndex; index -= this.canvasWidth) {
            this.drawPixel(index);
        }
    };
    Renderer.prototype.setFilledRectangle = function (x, y, width, height) {
        var index = this.xyToIndex(x, y);
        var rowDelta = width + this.canvasWidth;
        var endYIndex = index - height * this.canvasWidth;
        while (index > endYIndex) {
            var endXIndex = index + width;
            for (; index < endXIndex; index++) {
                this.pixels32[index] = this.drawColor;
            }
            index -= rowDelta;
        }
    };
    Renderer.prototype.drawFilledRectangle = function (x, y, width, height) {
        var index = this.xyToIndex(x, y);
        var rowDelta = width + this.canvasWidth;
        var endYIndex = index - height * this.canvasWidth;
        while (index > endYIndex) {
            var endXIndex = index + width;
            for (; index < endXIndex; index++) {
                this.drawPixel(index);
            }
            index -= rowDelta;
        }
    };
    Renderer.prototype.drawOutlinedRectangle = function (x, y, width, height) {
        this.drawHorizontalLine(x, y, width);
        this.drawHorizontalLine(x, y + height - 1, width);
        this.drawVerticalLine(x, y + 1, height - 2);
        this.drawVerticalLine(x + width - 1, y + 1, height - 2);
    };
    Renderer.prototype.drawCone = function (x, y, width) {
        var lastX = x + width - 1;
        var endIndex = (width >>> 1) + (width & 1);
        for (var i = 0; i < endIndex; i++) {
            this.drawPixel(this.xyToIndex(x + i, y));
            this.drawPixel(this.xyToIndex(lastX - i, y));
            y++;
        }
    };
    Renderer.prototype.xyToIndex = function (x, y) {
        return this.canvasYFixOffset + x - y * this.canvasWidth;
    };
    return Renderer;
}());
exports.Renderer = Renderer;
