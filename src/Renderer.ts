const PIXEL_ALPHA: number = 255 << 24;

export class Renderer {
    public canvas: HTMLCanvasElement;
    public context: CanvasRenderingContext2D;
    public canvasWidth: number;
    public canvasHeight: number;
    public canvasYFixOffset: number;
    public imageData: ImageData;
    public pixels: ArrayBuffer;
    public pixels8: Uint8ClampedArray;
    public pixels32: Uint32Array;
    public drawColorRB: number;
    public drawColorG: number;
    public drawColor: number;
    public drawColorA: number;
    public tileSize: number;

    public constructor(canvas: HTMLCanvasElement, width: number, height: number, tileSize: number) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.tileSize = tileSize;

        this.resizeCanvas(width, height);
        this.setDrawColor(255, 255, 255, 255);
    }

    public fillOpaque(x: number, y: number): void {
        this.setFilledRectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    }

    public fill(x: number, y: number): void {
        this.drawFilledRectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    }

    public outline(x: number, y: number): void {
        this.drawOutlinedRectangle(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    }

    public outlineBig(x: number, y: number, width: number, height: number): void {
        this.drawOutlinedRectangle(x * this.tileSize, y * this.tileSize, this.tileSize * width, this.tileSize * height);
    }

    public westLine(x: number, y: number): void {
        this.drawVerticalLine(x * this.tileSize, y * this.tileSize, this.tileSize);
    }

    public eastLine(x: number, y: number): void {
        this.drawVerticalLine((x + 1) * this.tileSize - 1, y * this.tileSize, this.tileSize);
    }

    public eastLineBig(x: number, y: number, length: number): void {
        this.drawVerticalLine((x + 1) * this.tileSize - 1, y * this.tileSize, this.tileSize * length);
    }

    public southLine(x: number, y: number): void {
        this.drawHorizontalLine(x * this.tileSize, y * this.tileSize, this.tileSize);
    }

    public northLine(x: number, y: number): void {
        this.drawHorizontalLine(x * this.tileSize, (y + 1) * this.tileSize - 1, this.tileSize);
    }

    public northLineBig(x: number, y: number, length: number): void {
        this.drawHorizontalLine(x * this.tileSize, (y + 1) * this.tileSize - 1, this.tileSize * length);
    }

    public cone(x: number, y: number): void {
        this.drawCone(x * this.tileSize, y * this.tileSize, this.tileSize);
    }

    public fillItem(x: number, y: number): void {
        const padding: number = this.tileSize >>> 2;
        const size: number = this.tileSize - 2 * padding;

        this.drawFilledRectangle(x * this.tileSize + padding, y * this.tileSize + padding, size, size);
    }

    private resizeCanvas(width: number, height: number): void {
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

    public setDrawColor(r: number, g: number, b: number, a: number): void {
        this.drawColorRB = r | (b << 16);
        this.drawColorG = PIXEL_ALPHA | (g << 8);
        this.drawColor = this.drawColorRB | this.drawColorG;
        this.drawColorA = a + 1;
    }

    public clear(): void {
        for (let i: number = 0; i < this.pixels32.length; i++) {
            this.pixels32[i] = this.drawColor;
        }
    }

    public present(): void {
        this.imageData.data.set(this.pixels8);
        this.context.putImageData(this.imageData, 0, 0);
    }

    private drawPixel(index: number): void {
        const color: number = this.pixels32[index];
        const oldRB: number = color & 0xFF00FF;
        const oldAG: number = color & 0xFF00FF00;
        const rb: number = oldRB + (this.drawColorA * (this.drawColorRB - oldRB) >> 8) & 0xFF00FF;
        const g: number = oldAG + (this.drawColorA * (this.drawColorG - oldAG) >> 8) & 0xFF00FF00;
        this.pixels32[index] = rb | g;
    }

    private drawHorizontalLine(x: number, y: number, length: number): void {
        let index: number = this.xyToIndex(x, y);
        const endIndex: number = index + length;

        for (; index < endIndex; index++) {
            this.drawPixel(index);
        }
    }

    private drawVerticalLine(x: number, y: number, length: number): void {
        let index: number = this.xyToIndex(x, y);
        const endIndex: number = index - length * this.canvasWidth;

        for (; index > endIndex; index -= this.canvasWidth) {
            this.drawPixel(index);
        }
    }

    private setFilledRectangle(x: number, y: number, width: number, height: number): void {
        let index: number = this.xyToIndex(x, y);
        const rowDelta: number = width + this.canvasWidth;
        const endYIndex: number = index - height * this.canvasWidth;

        while (index > endYIndex) {
            const endXIndex: number = index + width;

            for (; index < endXIndex; index++) {
                this.pixels32[index] = this.drawColor;
            }

            index -= rowDelta;
        }
    }

    private drawFilledRectangle(x: number, y: number, width: number, height: number): void {
        let index: number = this.xyToIndex(x, y);
        const rowDelta: number = width + this.canvasWidth;
        const endYIndex: number = index - height * this.canvasWidth;

        while (index > endYIndex) {
            const endXIndex: number = index + width;

            for (; index < endXIndex; index++) {
               this.drawPixel(index);
            }

            index -= rowDelta;
        }
    }

    private drawOutlinedRectangle(x: number, y: number, width: number, height: number): void {
        this.drawHorizontalLine(x, y, width);
        this.drawHorizontalLine(x, y + height - 1, width);
        this.drawVerticalLine(x, y + 1, height - 2);
        this.drawVerticalLine(x + width - 1, y + 1, height - 2);
    }

    private drawCone(x: number, y: number, width: number): void {
        const lastX: number = x + width - 1;
        const endIndex = (width >>> 1) + (width & 1);

        for (let i: number = 0; i < endIndex; i++) {
            this.drawPixel(this.xyToIndex(x + i, y));
            this.drawPixel(this.xyToIndex(lastX - i, y));

            y++;
        }
    }

    private xyToIndex(x: number, y: number): number {
        return this.canvasYFixOffset + x - y * this.canvasWidth;
    }
}