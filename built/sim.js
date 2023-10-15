'use strict';
import { FoodType } from "./FoodType.js";
import { BarbarianAssault } from "./BarbarianAssault.js";
import { Renderer } from "./Renderer.js";
import { Position } from "./Position.js";
import { LOS_EAST_MASK, LOS_FULL_MASK, LOS_NORTH_MASK, LOS_SOUTH_MASK, LOS_WEST_MASK, MOVE_EAST_MASK, MOVE_FULL_MASK, MOVE_NORTH_MASK, MOVE_SOUTH_MASK, MOVE_WEST_MASK } from "./BarbarianAssaultMap.js";
const HTML_CANVAS = "basimcanvas";
const HTML_RUNNER_MOVEMENTS = "runnermovements";
const HTML_START_BUTTON = "wavestart";
const HTML_WAVE_SELECT = "waveselect";
const HTML_TICK_COUNT = "tickcount";
const HTML_DEF_LEVEL_SELECT = "deflevelselect";
const HTML_TOGGLE_REPAIR = 'togglerepair';
const HTML_TOGGLE_PAUSE_SL = 'togglepausesl';
const HTML_CURRENT_DEF_FOOD = "currdeffood";
const HTML_TICK_DURATION = "tickduration";
const HTML_TOGGLE_INFINITE_FOOD = "toggleinfinitefood";
const HTML_TOGGLE_LOG_TO_REPAIR = "toggleloghammertorepair";
const HTML_MARKER_COLOR = "marker";
const HTML_MARKING_TILES = "markingtiles";
window.onload = init;
var markingTiles;
var markedTiles;
var canvas;
var movementsInput;
var tickDurationInput;
var startStopButton;
var waveSelect;
var defenderLevelSelection;
var toggleRepair;
var togglePauseSaveLoad;
var toggleInfiniteFood;
var toggleLogToRepair;
var tickCountSpan;
var currentDefenderFoodSpan;
var markerColorInput;
var isRunning = false;
var barbarianAssault;
var infiniteFood;
var isPaused;
var pauseSaveLoad;
var saveExists;
var renderer;
var requireLogs;
var requireRepairs;
var tickTimerId;
var wave;
var defenderLevel;
var markerColor;
var toggleMarkingTilesButton;
var savedBarbarianAssault;
var savedTickCountSpanInnerHTML;
var savedCurrentDefenderFoodSpanInnerHTML;
function init() {
    canvas = document.getElementById(HTML_CANVAS);
    movementsInput = document.getElementById(HTML_RUNNER_MOVEMENTS);
    movementsInput.onkeydown = function (keyboardEvent) {
        if (keyboardEvent.key === " ") {
            keyboardEvent.preventDefault();
        }
    };
    tickDurationInput = document.getElementById(HTML_TICK_DURATION);
    startStopButton = document.getElementById(HTML_START_BUTTON);
    startStopButton.onclick = startStopButtonOnClick;
    waveSelect = document.getElementById(HTML_WAVE_SELECT);
    waveSelect.onchange = waveSelectOnChange;
    defenderLevelSelection = document.getElementById(HTML_DEF_LEVEL_SELECT);
    defenderLevelSelection.onchange = defenderLevelSelectionOnChange;
    toggleRepair = document.getElementById(HTML_TOGGLE_REPAIR);
    toggleRepair.onchange = toggleRepairOnChange;
    togglePauseSaveLoad = document.getElementById(HTML_TOGGLE_PAUSE_SL);
    togglePauseSaveLoad.onchange = togglePauseSaveLoadOnChange;
    toggleInfiniteFood = document.getElementById(HTML_TOGGLE_INFINITE_FOOD);
    toggleInfiniteFood.onchange = toggleInfiniteFoodOnChange;
    toggleLogToRepair = document.getElementById(HTML_TOGGLE_LOG_TO_REPAIR);
    toggleLogToRepair.onchange = toggleLogToRepairOnChange;
    tickCountSpan = document.getElementById(HTML_TICK_COUNT);
    currentDefenderFoodSpan = document.getElementById(HTML_CURRENT_DEF_FOOD);
    markerColorInput = document.getElementById(HTML_MARKER_COLOR);
    renderer = new Renderer(canvas, 64 * 12, 48 * 12, 12);
    toggleMarkingTilesButton = document.getElementById(HTML_MARKING_TILES);
    toggleMarkingTilesButton.onclick = toggleMarkingTilesButtonOnClick;
    markingTiles = false;
    markedTiles = [];
    reset();
    window.onkeydown = windowOnKeyDown;
    canvas.onmousedown = canvasOnMouseDown;
    canvas.oncontextmenu = function (mouseEvent) {
        mouseEvent.preventDefault();
    };
    infiniteFood = toggleInfiniteFood.value === "yes";
    requireLogs = toggleLogToRepair.value === "yes";
    requireRepairs = toggleRepair.value === "yes";
    wave = Number(waveSelect.value);
    defenderLevel = Number(defenderLevelSelection.value);
    markerColor = Number("0x" + markerColorInput.value.substring(1));
}
function reset() {
    if (isRunning) {
        clearInterval(tickTimerId);
    }
    isRunning = false;
    startStopButton.innerHTML = "Start Wave";
    barbarianAssault = new BarbarianAssault(wave, requireRepairs, requireLogs, infiniteFood, [], defenderLevel);
    draw();
}
function parseMovementsInput() {
    const movements = movementsInput.value.split("-");
    for (let i = 0; i < movements.length; i++) {
        const moves = movements[i];
        for (let j = 0; j < moves.length; j++) {
            const move = moves[j];
            if (move !== "" && move !== "s" && move !== "w" && move !== "e") {
                return null;
            }
        }
    }
    return movements;
}
function windowOnKeyDown(keyboardEvent) {
    const key = keyboardEvent.key;
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
function save() {
    isPaused = true;
    savedBarbarianAssault = barbarianAssault.clone();
    savedTickCountSpanInnerHTML = tickCountSpan.innerHTML;
    savedCurrentDefenderFoodSpanInnerHTML = currentDefenderFoodSpan.innerHTML;
}
function load() {
    isPaused = true;
    tickCountSpan.innerHTML = savedTickCountSpanInnerHTML;
    currentDefenderFoodSpan.innerHTML = savedCurrentDefenderFoodSpanInnerHTML;
    barbarianAssault = savedBarbarianAssault;
    console.log(barbarianAssault.runnerMovements);
    console.log(barbarianAssault.runnerMovementsIndex);
    save();
    draw();
}
function deepCopy(object) {
    let copy = Array.isArray(object) ? [] : {};
    let value;
    for (const key in object) {
        value = object[key];
        copy[key] = (value === null) ? null : (typeof value === "object") ? deepCopy(value) : value;
    }
    return copy;
}
function canvasOnMouseDown(mouseEvent) {
    const canvasRect = renderer.canvas.getBoundingClientRect();
    const xTile = Math.trunc((mouseEvent.clientX - canvasRect.left) / renderer.tileSize);
    const yTile = Math.trunc((canvasRect.bottom - 1 - mouseEvent.clientY) / renderer.tileSize);
    if (mouseEvent.button === 0) {
        if (markingTiles) {
            let tileAlreadyMarked = false;
            for (let i = 0; i < markedTiles.length; i++) {
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
        }
        else {
            barbarianAssault.defenderPlayer.findPath(barbarianAssault, new Position(xTile, yTile));
        }
    }
    else if (mouseEvent.button === 2) {
        if (barbarianAssault.collectorPlayerPosition.equals(new Position(xTile, yTile))) {
            barbarianAssault.collectorPlayerPosition.x = -1;
        }
        else {
            barbarianAssault.collectorPlayerPosition = new Position(xTile, yTile);
        }
    }
}
function draw() {
    drawMap();
    drawDetails();
    drawItems();
    drawEntities();
    drawGrid();
    drawOverlays();
    renderer.present();
}
function drawMap() {
    renderer.setDrawColor(206, 183, 117, 255);
    renderer.clear();
    for (let y = 0; y < barbarianAssault.map.height; y++) {
        for (let x = 0; x < barbarianAssault.map.width; x++) {
            const flag = barbarianAssault.map.getFlag(new Position(x, y));
            if ((flag & LOS_FULL_MASK) !== 0) {
                renderer.setDrawColor(0, 0, 0, 255);
                renderer.fillOpaque(x, y);
            }
            else {
                if ((flag & MOVE_FULL_MASK) !== 0) {
                    renderer.setDrawColor(127, 127, 127, 255);
                    renderer.fillOpaque(x, y);
                }
                if ((flag & LOS_EAST_MASK) !== 0) {
                    renderer.setDrawColor(0, 0, 0, 255);
                    renderer.eastLine(x, y);
                }
                else if ((flag & MOVE_EAST_MASK) !== 0) {
                    renderer.setDrawColor(127, 127, 127, 255);
                    renderer.eastLine(x, y);
                }
                if ((flag & LOS_WEST_MASK) !== 0) {
                    renderer.setDrawColor(0, 0, 0, 255);
                    renderer.westLine(x, y);
                }
                else if ((flag & MOVE_WEST_MASK) !== 0) {
                    renderer.setDrawColor(127, 127, 127, 255);
                    renderer.westLine(x, y);
                }
                if ((flag & LOS_NORTH_MASK) !== 0) {
                    renderer.setDrawColor(0, 0, 0, 255);
                    renderer.northLine(x, y);
                }
                else if ((flag & MOVE_NORTH_MASK) !== 0) {
                    renderer.setDrawColor(127, 127, 127, 255);
                    renderer.northLine(x, y);
                }
                if ((flag & LOS_SOUTH_MASK) !== 0) {
                    renderer.setDrawColor(0, 0, 0, 255);
                    renderer.southLine(x, y);
                }
                else if ((flag & MOVE_SOUTH_MASK) !== 0) {
                    renderer.setDrawColor(127, 127, 127, 255);
                    renderer.southLine(x, y);
                }
            }
        }
    }
    renderer.setDrawColor((markerColor >> 16) & 255, (markerColor >> 8) & 255, markerColor & 255, 255);
    for (let i = 0; i < markedTiles.length; i++) {
        const markedTile = markedTiles[i];
        renderer.outline(markedTile[0], markedTile[1]);
    }
}
function drawDetails() {
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
        renderer.setDrawColor(255, 0, 0, 255);
    }
    else if (barbarianAssault.eastTrapCharges === 1) {
        renderer.setDrawColor(255, 140, 0, 255);
    }
    renderer.outline(45, 26);
    renderer.setDrawColor(160, 82, 45, 255);
    if (barbarianAssault.westTrapCharges < 1) {
        renderer.setDrawColor(255, 0, 0, 255);
    }
    else if (barbarianAssault.westTrapCharges === 1) {
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
function drawItems() {
    for (let i = 0; i < barbarianAssault.map.foodZones.length; i++) {
        const foodZone = barbarianAssault.map.foodZones[i];
        for (let j = 0; j < foodZone.foodList.length; j++) {
            const food = foodZone.foodList[j];
            renderer.setDrawColor(food.colorRed, food.colorGreen, food.colorBlue, 127);
            renderer.fillItem(food.position.x, food.position.y);
        }
    }
}
function drawEntities() {
    renderer.setDrawColor(10, 10, 240, 127);
    for (let i = 0; i < barbarianAssault.runners.length; i++) {
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
function drawGrid() {
    for (let xTile = 0; xTile < barbarianAssault.map.width; xTile++) {
        if (xTile % 8 === 7) {
            renderer.setDrawColor(0, 0, 0, 72);
        }
        else {
            renderer.setDrawColor(0, 0, 0, 48);
        }
        renderer.eastLineBig(xTile, 0, barbarianAssault.map.height);
    }
    for (let yTile = 0; yTile < barbarianAssault.map.height; yTile++) {
        if (yTile % 8 === 7) {
            renderer.setDrawColor(0, 0, 0, 72);
        }
        else {
            renderer.setDrawColor(0, 0, 0, 48);
        }
        renderer.northLineBig(0, yTile, barbarianAssault.map.width);
    }
}
function drawOverlays() {
    renderer.setDrawColor(240, 10, 10, 220);
    if (wave === 10) {
        renderer.outline(18, 38);
    }
    else {
        renderer.outline(18, 37);
    }
    renderer.outline(24, 39);
    renderer.fill(33, 6);
    renderer.setDrawColor(10, 10, 240, 220);
    if (wave === 10) {
        renderer.outline(42, 38);
    }
    else {
        renderer.outline(36, 39);
    }
    renderer.fill(34, 6);
    renderer.setDrawColor(10, 240, 10, 220);
    if (wave === 10) {
        renderer.outline(36, 39);
    }
    else {
        renderer.outline(42, 37);
    }
    renderer.fill(35, 6);
    renderer.setDrawColor(240, 240, 10, 220);
    ;
    renderer.fill(36, 6);
}
function startStopButtonOnClick() {
    if (isRunning) {
        barbarianAssault.map.reset();
        reset();
    }
    else {
        const movements = parseMovementsInput();
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
function tick() {
    if (!isPaused) {
        barbarianAssault.tick();
        currentDefenderFoodSpan.innerHTML = barbarianAssault.defenderFoodCall.toString();
        tickCountSpan.innerHTML = barbarianAssault.ticks.toString();
        draw();
    }
}
function toggleMarkingTilesButtonOnClick() {
    markingTiles = !markingTiles;
}
function waveSelectOnChange() {
    wave = Number(waveSelect.value);
    reset();
}
function defenderLevelSelectionOnChange() {
    defenderLevel = Number(defenderLevelSelection.value);
    reset();
}
function toggleRepairOnChange() {
    requireRepairs = toggleRepair.value === "yes";
}
function togglePauseSaveLoadOnChange() {
    pauseSaveLoad = togglePauseSaveLoad.value === "yes";
}
function toggleInfiniteFoodOnChange() {
    infiniteFood = toggleInfiniteFood.value === "yes";
}
function toggleLogToRepairOnChange() {
    requireLogs = toggleLogToRepair.value === "yes";
}
