var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { FoodType } from "./FoodType.js";
import { BarbarianAssault } from "./BarbarianAssault.js";
import { Position } from "./Position.js";
import { Worker, isMainThread, parentPort, workerData, } from 'node:worker_threads';
import { fileURLToPath } from 'url';
import { createWriteStream } from 'fs';
//   var fs = require('fs');
const __filename = fileURLToPath(import.meta.url);
var barbarianAssault;
var infiniteFood;
var requireLogs;
var requireRepairs;
var tickTimerId;
var wave;
var defenderLevel;
var TICK_LENGTH = 2;
var bestTime = 200;
var bestPerm = "";
var perm = "";
function init() {
    infiniteFood = true;
    requireLogs = true;
    requireRepairs = true;
    wave = 1;
    defenderLevel = 5;
}
/**
 * Resets the simulator: the simulator is stopped and the underlying {@link BarbarianAssault} game
 * is replaced with a new game according to the currently selected configuration.
 */
function reset(movements) {
    barbarianAssault = new BarbarianAssault(wave, requireRepairs, requireLogs, infiniteFood, movements, defenderLevel);
}
function start(movements) {
    reset(movements);
    barbarianAssault.tick();
    tickTimerId = setInterval(tick, TICK_LENGTH);
}
function tick() {
    barbarianAssault.tick();
}
function runto(p) {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log('runto');
        barbarianAssault.defenderPlayer.findPath(barbarianAssault, p);
        const poll = resolve => {
            if (barbarianAssault.defenderPlayer.position.equals(p))
                resolve();
            else
                setTimeout(_ => poll(resolve), TICK_LENGTH / 2);
        };
        return new Promise(poll);
    });
}
function checkForComplete() {
    return __awaiter(this, void 0, void 0, function* () {
        const poll = resolve => {
            if (barbarianAssault.totalRunners == barbarianAssault.runnersKilled || barbarianAssault.ticks > 50) {
                clearInterval(tickTimerId);
                // console.log(`wavetime: ${barbarianAssault.ticks * .6}`);
                if (barbarianAssault.ticks < bestTime) {
                    bestTime = barbarianAssault.ticks;
                    bestPerm = perm;
                    // console.log(`new best time!! ${bestTime} : ${bestPerm}`);
                }
                resolve([barbarianAssault.ticks - 1, perm]);
            }
            else
                setTimeout(_ => poll(resolve), TICK_LENGTH / 2);
        };
        return new Promise(poll);
    });
}
function dropGoodFood() {
    // console.log('dropGoodFood', barbarianAssault.defenderPlayer.position);
    barbarianAssault.defenderPlayer.dropFood(barbarianAssault, barbarianAssault.defenderFoodCall);
}
function dropBadFood() {
    // console.log('dropBadFood', barbarianAssault.defenderPlayer.position);
    if (barbarianAssault.defenderFoodCall == FoodType.TOFU) {
        barbarianAssault.defenderPlayer.dropFood(barbarianAssault, FoodType.CRACKERS);
    }
    else {
        barbarianAssault.defenderPlayer.dropFood(barbarianAssault, FoodType.TOFU);
    }
}
var MOVEMENT_COMBOS = [
    ["w", "w"],
    ["w", "e"],
    ["w", "s"],
    ["e", "w"],
    ["e", "e"],
    ["e", "s"],
    ["s", "s"],
    ["s", "e"],
    ["s", "w"]
];
// find possible combos that will give us 50 ticks
function testrun(n) {
    return __awaiter(this, void 0, void 0, function* () {
        var trapPositions = getTrapPositions();
        var msPositions = getMsLocations();
        var trailPositions = getTrailPositions();
        var i = 0;
        var times = [];
        var runMovement = MOVEMENT_COMBOS[n];
        for (var trapPos of trapPositions) {
            for (var trailPos of trailPositions) {
                for (var msPos of msPositions) {
                    perm = `RUNS: (${runMovement.join(', ')}), TRAP: (${trapPos.x}, ${trapPos.y}) TRAIL: (${trailPos.x}, ${trailPos.y}) MS: (${msPos.x}, ${msPos.y})`;
                    // console.log(`run ${i} - perm ${perm}`);
                    init();
                    start(runMovement);
                    // first we will always drop a trap food
                    yield runto(trapPos);
                    dropGoodFood();
                    dropGoodFood();
                    // drop a trail somewhere 38,33 - 41,30
                    yield runto(trailPos);
                    dropBadFood();
                    // drop an ms 33,38 - 43,34
                    yield runto(msPos);
                    dropGoodFood();
                    dropGoodFood();
                    i++;
                    var [time, message] = yield checkForComplete();
                    times.push(`${time} | ${message}`);
                }
            }
        }
        var file = createWriteStream(`test-${n}.txt`);
        file.on('error', function (_err) { });
        times.forEach(function (v) { file.write(v + '\n'); });
        file.end();
    });
}
function getMsLocations() {
    var positions = [];
    for (let i = 33; i < 44; i++) {
        for (let j = 34; j < 39; j++) {
            positions.push(new Position(i, j));
        }
    }
    return positions;
}
function getTrailPositions() {
    var positions = [];
    for (let i = 38; i < 42; i++) {
        for (let j = 30; j < 34; j++) {
            positions.push(new Position(i, j));
        }
    }
    return positions;
}
function getTrapPositions() {
    var positions = [];
    for (let i = 44; i < 47; i++) {
        for (let j = 25; j < 28; j++) {
            positions.push(new Position(i, j));
        }
    }
    return positions;
}
const threads = new Set();
if (isMainThread) {
    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((p) => {
        threads.add(new Worker(__filename, {
            workerData: {
                perm: p
            }
        }));
    });
    threads.forEach((thread) => {
        thread.on("error", (err) => {
            throw err;
        });
        thread.on("exit", () => {
            threads.delete(thread);
            console.log(`Thread exiting, ${threads.size} running...`);
        });
        thread.on("message", (msg) => {
            console.log(msg);
        });
    });
}
else {
    testrun(workerData.perm);
    parentPort.postMessage(`STARTING ${workerData.perm}`);
}
