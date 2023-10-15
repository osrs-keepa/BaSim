const PIXEL_ALPHA = 255 << 24;
export class Renderer {
    constructor(canvas, width, height, tileSize) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.tileSize = tileSize;
        this.resizeCanvas(width, height);
        this.setDrawColor(255, 255, 255, 255);
    }
    fillOpaque(x, y) {
        this.setFilledRectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    }
    fill(x, y) {
        this.drawFilledRectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    }
    outline(x, y) {
        this.drawOutlinedRectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    }
    outlineBig(x, y, width, height) {
        this.drawOutlinedRectangle(x * this.tileSize, y * this.tileSize, this.tileSize * width, this.tileSize * height);
    }
    westLine(x, y) {
        this.drawVerticalLine(x * this.tileSize, y * this.tileSize, this.tileSize);
    }
    eastLine(x, y) {
        this.drawVerticalLine((x + 1) * this.tileSize - 1, y * this.tileSize, this.tileSize);
    }
    eastLineBig(x, y, length) {
        this.drawVerticalLine((x + 1) * this.tileSize - 1, y * this.tileSize, this.tileSize * length);
    }
    southLine(x, y) {
        this.drawHorizontalLine(x * this.tileSize, y * this.tileSize, this.tileSize);
    }
    northLine(x, y) {
        this.drawHorizontalLine(x * this.tileSize, (y + 1) * this.tileSize - 1, this.tileSize);
    }
    northLineBig(x, y, length) {
        this.drawHorizontalLine(x * this.tileSize, (y + 1) * this.tileSize - 1, this.tileSize * length);
    }
    cone(x, y) {
        this.drawCone(x * this.tileSize, y * this.tileSize, this.tileSize);
    }
    fillItem(x, y) {
        const padding = this.tileSize >>> 2;
        const size = this.tileSize - 2 * padding;
        this.drawFilledRectangle(x * this.tileSize + padding, y * this.tileSize + padding, size, size);
    }
    resizeCanvas(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.canvasYFixOffset = (height - 1) * width;
        this.imageData = this.context.createImageData(width, height);
        this.pixels = new ArrayBuffer(this.imageData.data.length);
        this.pixels8 = new Uint8ClampedArray(this.pixels);
        this.pixels32 = new Uint32Array(this.pixels);
    }
    setDrawColor(r, g, b, a) {
        this.drawColorRB = r | (b << 16);
        this.drawColorG = PIXEL_ALPHA | (g << 8);
        this.drawColor = this.drawColorRB | this.drawColorG;
        this.drawColorA = a + 1;
    }
    clear() {
        for (let i = 0; i < this.pixels32.length; i++) {
            this.pixels32[i] = this.drawColor;
        }
    }
    present() {
        this.imageData.data.set(this.pixels8);
        this.context.putImageData(this.imageData, 0, 0);
    }
    drawPixel(index) {
        const color = this.pixels32[index];
        const oldRB = color & 0xFF00FF;
        const oldAG = color & 0xFF00FF00;
        const rb = oldRB + (this.drawColorA * (this.drawColorRB - oldRB) >> 8) & 0xFF00FF;
        const g = oldAG + (this.drawColorA * (this.drawColorG - oldAG) >> 8) & 0xFF00FF00;
        this.pixels32[index] = rb | g;
    }
    drawHorizontalLine(x, y, length) {
        let index = this.xyToIndex(x, y);
        const endIndex = index + length;
        for (; index < endIndex; index++) {
            this.drawPixel(index);
        }
    }
    drawVerticalLine(x, y, length) {
        let index = this.xyToIndex(x, y);
        const endIndex = index - length * this.canvasWidth;
        for (; index > endIndex; index -= this.canvasWidth) {
            this.drawPixel(index);
        }
    }
    setFilledRectangle(x, y, width, height) {
        let index = this.xyToIndex(x, y);
        const rowDelta = width + this.canvasWidth;
        const endYIndex = index - height * this.canvasWidth;
        while (index > endYIndex) {
            const endXIndex = index + width;
            for (; index < endXIndex; index++) {
                this.pixels32[index] = this.drawColor;
            }
            index -= rowDelta;
        }
    }
    drawFilledRectangle(x, y, width, height) {
        let index = this.xyToIndex(x, y);
        const rowDelta = width + this.canvasWidth;
        const endYIndex = index - height * this.canvasWidth;
        while (index > endYIndex) {
            const endXIndex = index + width;
            for (; index < endXIndex; index++) {
                this.drawPixel(index);
            }
            index -= rowDelta;
        }
    }
    drawOutlinedRectangle(x, y, width, height) {
        this.drawHorizontalLine(x, y, width);
        this.drawHorizontalLine(x, y + height - 1, width);
        this.drawVerticalLine(x, y + 1, height - 2);
        this.drawVerticalLine(x + width - 1, y + 1, height - 2);
    }
    drawCone(x, y, width) {
        const lastX = x + width - 1;
        const endIndex = (width >>> 1) + (width & 1);
        for (let i = 0; i < endIndex; i++) {
            this.drawPixel(this.xyToIndex(x + i, y));
            this.drawPixel(this.xyToIndex(lastX - i, y));
            y++;
        }
    }
    xyToIndex(x, y) {
        return this.canvasYFixOffset + x - y * this.canvasWidth;
    }
}
