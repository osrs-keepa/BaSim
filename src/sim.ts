'use strict';
import {FoodType} from "./FoodType.js";
import {BarbarianAssault} from "./BarbarianAssault.js";
import {Renderer} from "./Renderer.js";
import {Position} from "./Position.js";
import {
    LOS_EAST_MASK,
    LOS_FULL_MASK, LOS_NORTH_MASK, LOS_SOUTH_MASK,
    LOS_WEST_MASK,
    MOVE_EAST_MASK,
    MOVE_FULL_MASK, MOVE_NORTH_MASK, MOVE_SOUTH_MASK,
    MOVE_WEST_MASK
} from "./BarbarianAssaultMap.js";
import {Food} from "./Food.js";
import {FoodZone} from "./FoodZone.js";

const HTML_CANVAS: string = "basimcanvas";
const HTML_RUNNER_MOVEMENTS: string = "runnermovements";
const HTML_START_BUTTON: string = "wavestart";
const HTML_WAVE_SELECT: string = "waveselect";
const HTML_TICK_COUNT: string = "tickcount";
const HTML_DEF_LEVEL_SELECT: string = "deflevelselect";
const HTML_TOGGLE_REPAIR: string = 'togglerepair'
const HTML_TOGGLE_PAUSE_SL: string = 'togglepausesl';
const HTML_CURRENT_DEF_FOOD: string = "currdeffood";
const HTML_TICK_DURATION: string = "tickduration";
const HTML_TOGGLE_INFINITE_FOOD: string = "toggleinfinitefood";
const HTML_TOGGLE_LOG_TO_REPAIR: string = "toggleloghammertorepair";
const HTML_MARKER_COLOR: string = "marker";
const HTML_MARKING_TILES: string = "markingtiles";

window.onload = init;

var markingTiles: boolean;
var markedTiles: Array<Array<number>>;
var canvas: HTMLCanvasElement;
var movementsInput: HTMLInputElement;
var tickDurationInput: HTMLInputElement;
var startStopButton: HTMLElement;
var waveSelect: HTMLInputElement;
var defenderLevelSelection: HTMLInputElement;
var toggleRepair: HTMLInputElement;
var togglePauseSaveLoad: HTMLInputElement;
var toggleInfiniteFood: HTMLInputElement;
var toggleLogToRepair: HTMLInputElement;
var tickCountSpan: HTMLElement;
var currentDefenderFoodSpan: HTMLElement;
var markerColorInput: HTMLInputElement;
var isRunning: boolean = false;
var barbarianAssault: BarbarianAssault;
var infiniteFood: boolean;
var isPaused: boolean;
var pauseSaveLoad: boolean;
var saveExists: boolean;
var renderer: Renderer;
var requireLogs: boolean;
var requireRepairs: boolean;
var tickTimerId: number;
var wave: number;
var defenderLevel: number;
var markerColor: number;
var toggleMarkingTilesButton: HTMLElement;

var savedBarbarianAssault: BarbarianAssault;
var savedTickCountSpanInnerHTML: string;
var savedCurrentDefenderFoodSpanInnerHTML: string;

function init(): void {
    canvas = document.getElementById(HTML_CANVAS) as HTMLCanvasElement;
    movementsInput = document.getElementById(HTML_RUNNER_MOVEMENTS) as HTMLInputElement;
    movementsInput.onkeydown = function (keyboardEvent: KeyboardEvent): void {
        if (keyboardEvent.key === " ") {
            keyboardEvent.preventDefault();
        }
    };
    tickDurationInput = document.getElementById(HTML_TICK_DURATION) as HTMLInputElement;
    startStopButton = document.getElementById(HTML_START_BUTTON);
    startStopButton.onclick = startStopButtonOnClick;
    waveSelect = document.getElementById(HTML_WAVE_SELECT) as HTMLInputElement;
    waveSelect.onchange = waveSelectOnChange;
    defenderLevelSelection = document.getElementById(HTML_DEF_LEVEL_SELECT) as HTMLInputElement;
    defenderLevelSelection.onchange = defenderLevelSelectionOnChange;
    toggleRepair = document.getElementById(HTML_TOGGLE_REPAIR) as HTMLInputElement;
    toggleRepair.onchange = toggleRepairOnChange;
    togglePauseSaveLoad = document.getElementById(HTML_TOGGLE_PAUSE_SL) as HTMLInputElement;
    togglePauseSaveLoad.onchange = togglePauseSaveLoadOnChange;
    toggleInfiniteFood = document.getElementById(HTML_TOGGLE_INFINITE_FOOD) as HTMLInputElement;
    toggleInfiniteFood.onchange = toggleInfiniteFoodOnChange;
    toggleLogToRepair = document.getElementById(HTML_TOGGLE_LOG_TO_REPAIR) as HTMLInputElement;
    toggleLogToRepair.onchange = toggleLogToRepairOnChange;
    tickCountSpan = document.getElementById(HTML_TICK_COUNT);
    currentDefenderFoodSpan = document.getElementById(HTML_CURRENT_DEF_FOOD);
    markerColorInput = document.getElementById(HTML_MARKER_COLOR) as HTMLInputElement;
    renderer = new Renderer(canvas, 64 * 12, 48 * 12, 12);
    toggleMarkingTilesButton = document.getElementById(HTML_MARKING_TILES);
    toggleMarkingTilesButton.onclick = toggleMarkingTilesButtonOnClick;
    markingTiles = false;
    markedTiles = [];
    reset();
    window.onkeydown = windowOnKeyDown;
    canvas.onmousedown = canvasOnMouseDown;
    canvas.oncontextmenu = function (mouseEvent: MouseEvent): void {
        mouseEvent.preventDefault();
    }

    infiniteFood = toggleInfiniteFood.value === "yes";
    requireLogs = toggleLogToRepair.value === "yes";
    requireRepairs = toggleRepair.value === "yes";
    wave = Number(waveSelect.value);
    defenderLevel = Number(defenderLevelSelection.value);
    markerColor = Number("0x" + markerColorInput.value.substring(1));
}

function reset(): void {
    if (isRunning) {
        clearInterval(tickTimerId);
    }

    isRunning = false;
    startStopButton.innerHTML = "Start Wave";

    barbarianAssault = new BarbarianAssault(wave, requireRepairs, requireLogs, infiniteFood, [], defenderLevel);
    draw();
}

function parseMovementsInput(): Array<string> {
    const movements: Array<string> = movementsInput.value.split("-");

    for (let i: number = 0; i < movements.length; i++) {
        const moves: string = movements[i];

        for (let j: number = 0; j < moves.length; j++) {
            const move: string = moves[j];

            if (move !== "" && move !== "s" && move !== "w" && move !== "e") {
                return null;
            }
        }
    }

    return movements;
}

function windowOnKeyDown(keyboardEvent: KeyboardEvent): void {
    const key: string = keyboardEvent.key;

    if (isRunning) {
        switch (key) {
            case "t":
                barbarianAssault.defenderPlayer.dropFood(barbarianAssault, FoodType.TOFU);
                break;
            case "c":
                barbarianAssault.defenderPlayer.dropFood(barbarianAssault, FoodType.CRACKERS);
                break;
            case "w":
                barbarianAssault.defenderPlayer.dropFood(barbarianAssault, FoodType.WORMS);
                break;
            case "1":
                barbarianAssault.defenderPlayer.foodBeingPickedUp = FoodType.TOFU;
                break;
            case "2":
                barbarianAssault.defenderPlayer.foodBeingPickedUp = FoodType.CRACKERS;
                break;
            case "3":
                barbarianAssault.defenderPlayer.foodBeingPickedUp = FoodType.WORMS;
                break;
            case "l":
                barbarianAssault.defenderPlayer.isPickingUpLogs = true;
                break;
            case "r":
                barbarianAssault.defenderPlayer.startRepairing(barbarianAssault);
                break;
            case "p":
                isPaused = !isPaused;
                break;
            case "s":
                if (isPaused || !pauseSaveLoad) {
                    isPaused = true;
                    save();
                    saveExists = true;
                }

                break;
            case "y":
                if (saveExists && (isPaused || !pauseSaveLoad)) {
                    isPaused = true;
                    load();
                }

                break;
        }
    }

    if (key === " ") {
        startStopButtonOnClick();
        keyboardEvent.preventDefault();
    }
}

function save(): void {
    isPaused = true;

    savedBarbarianAssault = barbarianAssault.clone();
    savedTickCountSpanInnerHTML = tickCountSpan.innerHTML;
    savedCurrentDefenderFoodSpanInnerHTML = currentDefenderFoodSpan.innerHTML;
}

function load(): void {
    isPaused = true;

    tickCountSpan.innerHTML = savedTickCountSpanInnerHTML;
    currentDefenderFoodSpan.innerHTML = savedCurrentDefenderFoodSpanInnerHTML;
    barbarianAssault = savedBarbarianAssault;

    // the existing save state will mutate as the simulator proceeds,
    // so re-clone the save state in case of subsequent loads
    save();

    draw();
}

function canvasOnMouseDown(mouseEvent: MouseEvent): void {
    const canvasRect: DOMRect = renderer.canvas.getBoundingClientRect();
    const xTile: number = Math.trunc((mouseEvent.clientX - canvasRect.left) / renderer.tileSize);
    const yTile: number = Math.trunc((canvasRect.bottom - 1 - mouseEvent.clientY) / renderer.tileSize);

    if (mouseEvent.button === 0) {
        if (markingTiles) {
            let tileAlreadyMarked: boolean = false;

            for (let i: number = 0; i < markedTiles.length; i++) {
                if ((markedTiles[i][0] === xTile) && (markedTiles[i][1] === yTile)) {
                    tileAlreadyMarked = true;
                    markedTiles.splice(i, 1);
                }
            }

            if (!tileAlreadyMarked) {
                markedTiles.push([xTile, yTile]);
            }

            if (!isRunning) {
                draw();
            }
        } else {
            barbarianAssault.defenderPlayer.findPath(barbarianAssault, new Position(xTile, yTile));
        }
    } else if (mouseEvent.button === 2) {
        if (barbarianAssault.collectorPlayerPosition.equals(new Position(xTile, yTile))) {
            barbarianAssault.collectorPlayerPosition.x = -1;
        } else {
            barbarianAssault.collectorPlayerPosition = new Position(xTile, yTile);
        }
    }
}

function draw(): void {
    drawMap()
    drawDetails();
    drawItems();
    drawEntities();
    drawGrid();
    drawOverlays();
    renderer.present();
}

function drawMap(): void {
    renderer.setDrawColor(206, 183, 117, 255);
    renderer.clear();

    for (let y: number = 0; y < barbarianAssault.map.height; y++) {
        for (let x: number = 0; x < barbarianAssault.map.width; x++) {
            const flag: number = barbarianAssault.map.getFlag(new Position(x, y));

            if ((flag & LOS_FULL_MASK) !== 0) {
                renderer.setDrawColor(0, 0, 0, 255);
                renderer.fillOpaque(x, y);
            } else {
                if ((flag & MOVE_FULL_MASK) !== 0) {
                    renderer.setDrawColor(127, 127, 127, 255);
                    renderer.fillOpaque(x, y);
                }

                if ((flag & LOS_EAST_MASK) !== 0) {
                    renderer.setDrawColor(0, 0, 0, 255);
                    renderer.eastLine(x, y);
                } else if ((flag & MOVE_EAST_MASK) !== 0) {
                    renderer.setDrawColor(127, 127, 127, 255);
                    renderer.eastLine(x, y);
                }

                if ((flag & LOS_WEST_MASK) !== 0) {
                    renderer.setDrawColor(0, 0, 0, 255);
                    renderer.westLine(x, y);
                } else if ((flag & MOVE_WEST_MASK) !== 0) {
                    renderer.setDrawColor(127, 127, 127, 255);
                    renderer.westLine(x, y);
                }

                if ((flag & LOS_NORTH_MASK) !== 0) {
                    renderer.setDrawColor(0, 0, 0, 255);
                    renderer.northLine(x, y);
                } else if ((flag & MOVE_NORTH_MASK) !== 0) {
                    renderer.setDrawColor(127, 127, 127, 255);
                    renderer.northLine(x, y);
                }

                if ((flag & LOS_SOUTH_MASK) !== 0) {
                    renderer.setDrawColor(0, 0, 0, 255);
                    renderer.southLine(x, y);
                } else if ((flag & MOVE_SOUTH_MASK) !== 0) {
                    renderer.setDrawColor(127, 127, 127, 255);
                    renderer.southLine(x, y);
                }
            }
        }
    }

    renderer.setDrawColor((markerColor >> 16) & 255, (markerColor >> 8) & 255, markerColor & 255, 255);

    for (let i: number = 0; i < markedTiles.length; i++) {
        const markedTile: Array<number> = markedTiles[i];
        renderer.outline(markedTile[0], markedTile[1]);
    }
}

function drawDetails(): void {
    renderer.setDrawColor(160, 82, 45, 255);

    renderer.cone(40, 32);
    renderer.cone(40, 31);
    renderer.cone(41, 32);
    renderer.cone(41, 31);
    renderer.cone(43, 31);
    renderer.cone(36, 34);
    renderer.cone(36, 35);
    renderer.cone(37, 34);
    renderer.cone(37, 35);
    renderer.cone(39, 36);
    renderer.cone(43, 22);
    renderer.cone(43, 23);
    renderer.cone(44, 22);
    renderer.cone(44, 23);
    renderer.cone(45, 24);

    if (barbarianAssault.southeastLogsArePresent) {
        renderer.fillItem(barbarianAssault.southeastLogsPosition.x, barbarianAssault.southeastLogsPosition.y);
    }

    if (barbarianAssault.northwestLogsArePresent) {
        renderer.fillItem(barbarianAssault.northwestLogsPosition.x, barbarianAssault.northwestLogsPosition.y);
    }

    if (barbarianAssault.eastTrapCharges < 1) {
        renderer.setDrawColor(255, 0, 0 , 255);
    } else if (barbarianAssault.eastTrapCharges === 1) {
        renderer.setDrawColor(255, 140, 0, 255);
    }

    renderer.outline(45, 26);

    renderer.setDrawColor(160, 82, 45, 255);

    if (barbarianAssault.westTrapCharges < 1) {
        renderer.setDrawColor(255, 0, 0 , 255);
    } else if (barbarianAssault.westTrapCharges === 1) {
        renderer.setDrawColor(255, 140, 0, 255);
    }

    renderer.outline(15, 25);

    renderer.setDrawColor(160, 82, 45, 255);

    // queen trapdoor
    if (wave === 10) {
        renderer.outlineBig(27, 20, 8, 8);
    }

    renderer.setDrawColor(127, 127, 127, 255);

    renderer.fillItem(32, 34);
}

function drawItems(): void {
    for (let i: number = 0; i < barbarianAssault.map.foodZones.length; i++) {
        const foodZone: FoodZone = barbarianAssault.map.foodZones[i];

        for (let j: number = 0; j < foodZone.foodList.length; j++) {
            const food: Food = foodZone.foodList[j];
            renderer.setDrawColor(food.colorRed, food.colorGreen, food.colorBlue, 127);
            renderer.fillItem(food.position.x, food.position.y);
        }
    }
}

function drawEntities(): void {
    renderer.setDrawColor(10, 10, 240, 127);

    for (let i: number = 0; i < barbarianAssault.runners.length; i++) {
        renderer.fill(barbarianAssault.runners[i].position.x, barbarianAssault.runners[i].position.y);
    }

    if (barbarianAssault.collectorPlayerPosition.x >= 0) {
        renderer.setDrawColor(240, 240, 10, 200);
        renderer.fill(barbarianAssault.collectorPlayerPosition.x, barbarianAssault.collectorPlayerPosition.y);
    }

    if (barbarianAssault.defenderPlayer.position.x >= 0) {
        renderer.setDrawColor(240, 240, 240, 200);
        renderer.fill(barbarianAssault.defenderPlayer.position.x, barbarianAssault.defenderPlayer.position.y);
    }
}

function drawGrid(): void {
    for (let xTile: number = 0; xTile < barbarianAssault.map.width; xTile++) {
        if (xTile % 8 === 7) {
            renderer.setDrawColor(0, 0, 0, 72);
        } else {
            renderer.setDrawColor(0, 0, 0, 48);
        }

        renderer.eastLineBig(xTile, 0, barbarianAssault.map.height);
    }

    for (let yTile: number = 0; yTile < barbarianAssault.map.height; yTile++) {
        if (yTile % 8 === 7) {
            renderer.setDrawColor(0, 0, 0, 72);
        } else {
            renderer.setDrawColor(0, 0, 0, 48);
        }

        renderer.northLineBig(0, yTile, barbarianAssault.map.width);
    }
}

function drawOverlays(): void {
    renderer.setDrawColor(240, 10, 10, 220);

    if (wave === 10) {
        renderer.outline(18, 38);
    } else {
        renderer.outline(18, 37);
    }

    renderer.outline(24, 39);
    renderer.fill(33, 6);

    renderer.setDrawColor(10, 10, 240, 220);

    if (wave === 10) {
        renderer.outline(42, 38);
    } else {
        renderer.outline(36, 39);
    }

    renderer.fill(34, 6);

    renderer.setDrawColor(10, 240, 10, 220);

    if (wave === 10) {
        renderer.outline(36, 39);
    } else {
        renderer.outline(42, 37);
    }

    renderer.fill(35, 6);

    renderer.setDrawColor(240, 240, 10, 220);;
    renderer.fill(36, 6);
}

function startStopButtonOnClick(): void {
    if (isRunning) {
        barbarianAssault.map.reset();
        reset();
    } else {
        const movements: Array<string> = parseMovementsInput();

        if (movements === null) {
            alert("Invalid runner movements. Example: ws-s");
            return;
        }

        isRunning = true;
        isPaused = false;
        startStopButton.innerHTML = "Stop Wave";

        barbarianAssault = new BarbarianAssault(wave, requireRepairs, requireLogs, infiniteFood, movements, defenderLevel);
        console.log("Wave " + wave + " started!");
        tick();
        tickTimerId = setInterval(tick, Number(tickDurationInput.value));
    }
}

function tick(): void {
    if (!isPaused) {
        barbarianAssault.tick();
        currentDefenderFoodSpan.innerHTML = barbarianAssault.defenderFoodCall.toString();
        tickCountSpan.innerHTML = barbarianAssault.ticks.toString();
        draw();
    }
}

function toggleMarkingTilesButtonOnClick(): void {
    markingTiles = !markingTiles;
}

function waveSelectOnChange(): void {
    wave = Number(waveSelect.value);
    reset();
}

function defenderLevelSelectionOnChange(): void {
    defenderLevel = Number(defenderLevelSelection.value);
    reset();
}

function toggleRepairOnChange(): void {
    requireRepairs = toggleRepair.value === "yes";
}

function togglePauseSaveLoadOnChange(): void {
    pauseSaveLoad = togglePauseSaveLoad.value === "yes";
}

function toggleInfiniteFoodOnChange(): void {
    infiniteFood = toggleInfiniteFood.value === "yes";
}

function toggleLogToRepairOnChange(): void {
    requireLogs = toggleLogToRepair.value === "yes";
}