import {FoodType} from "./FoodType.js";
import {BarbarianAssault} from "./BarbarianAssault.js";
import {Position} from "./Position.js";
import {
    Worker, isMainThread, parentPort, workerData,
  } from 'node:worker_threads';

  import { fileURLToPath } from 'url';
  import { createWriteStream } from 'fs';
//   var fs = require('fs');

  
  const __filename = fileURLToPath(import.meta.url);

var barbarianAssault: BarbarianAssault;
var infiniteFood: boolean;
var requireLogs: boolean;
var requireRepairs: boolean;
var tickTimerId;
var wave: number;
var defenderLevel: number;
var TICK_LENGTH = 2;
var bestTime = 200;
var bestPerm = "";
var perm = "";

function init(): void {
    infiniteFood = true
    requireLogs = true
    requireRepairs = true
    wave = 1;
    defenderLevel = 5
}

/**
 * Resets the simulator: the simulator is stopped and the underlying {@link BarbarianAssault} game
 * is replaced with a new game according to the currently selected configuration.
 */
function reset(movements: string[]): void {
    barbarianAssault = new BarbarianAssault(wave, requireRepairs, requireLogs, infiniteFood, movements, defenderLevel);
}

function start(movements: string[]): void {
    reset(movements);
    barbarianAssault.tick();
    tickTimerId = setInterval(tick, TICK_LENGTH);
}


function tick(): void {
    barbarianAssault.tick();
}

async function runto(p: Position): Promise<string> {
    // console.log('runto');
    barbarianAssault.defenderPlayer.findPath(barbarianAssault, p);

    const poll = resolve => {
        if(barbarianAssault.defenderPlayer.position.equals(p)) resolve();
        else setTimeout(_ => poll(resolve), TICK_LENGTH / 2);
    }
    
    return new Promise(poll);
}

async function checkForComplete(): Promise<[number, string]> {
    const poll = resolve => {
        if(barbarianAssault.totalRunners == barbarianAssault.runnersKilled || barbarianAssault.ticks > 50)
        {
            clearInterval(tickTimerId);
            // console.log(`wavetime: ${barbarianAssault.ticks * .6}`);
            if(barbarianAssault.ticks < bestTime) {
                bestTime = barbarianAssault.ticks;
                bestPerm = perm;
                // console.log(`new best time!! ${bestTime} : ${bestPerm}`);
            }
            resolve([barbarianAssault.ticks - 1, perm]);
        }
        else setTimeout(_ => poll(resolve), TICK_LENGTH / 2);
    }
    
    return new Promise(poll);
}

function dropGoodFood(): void {
    // console.log('dropGoodFood', barbarianAssault.defenderPlayer.position);
    barbarianAssault.defenderPlayer.dropFood(barbarianAssault, barbarianAssault.defenderFoodCall);
}

function dropBadFood(): void {
    // console.log('dropBadFood', barbarianAssault.defenderPlayer.position);
    if(barbarianAssault.defenderFoodCall == FoodType.TOFU) {
        barbarianAssault.defenderPlayer.dropFood(barbarianAssault, FoodType.CRACKERS);
    } else {
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
async function testrun(n : number): Promise<void> {
    var trapPositions = getTrapPositions();
    var msPositions = getMsLocations();
    var trailPositions = getTrailPositions();
    var i = 0;
    var times = [];
    var runMovement = MOVEMENT_COMBOS[n];
    for( var trapPos of trapPositions ) {
        for( var trailPos of trailPositions ) {
            for( var msPos of msPositions ) {
                perm = `RUNS: (${runMovement.join(', ')}), TRAP: (${trapPos.x}, ${trapPos.y}) TRAIL: (${trailPos.x}, ${trailPos.y}) MS: (${msPos.x}, ${msPos.y})`;
                // console.log(`run ${i} - perm ${perm}`);
                init();
                start(runMovement);
                // first we will always drop a trap food
                await runto(trapPos);
                dropGoodFood();
                dropGoodFood();
                // drop a trail somewhere 38,33 - 41,30
                await runto(trailPos);
                dropBadFood();
                // drop an ms 33,38 - 43,34
                await runto(msPos);
                dropGoodFood();
                dropGoodFood();
                i++;
                var [time, message] = await checkForComplete();
                times.push(`${time} | ${message}`);
            }
        }
    }

    var file = createWriteStream(`test-${n}.txt`);
    file.on('error', function(_err) { /* error handling */ });
    times.forEach(function(v) { file.write(v + '\n'); });
    file.end();
}

function getMsLocations(): Position[] {
    var positions = [];
    for(let i = 33; i < 44; i++) {
        for(let j = 34; j < 39; j++) {
            positions.push(new Position(i,j));
        }
    }
    return positions;
}

function getTrailPositions(): Position[] {
    var positions = [];
    for(let i = 38; i < 42; i++) {
        for(let j = 30; j < 34; j++) {
            positions.push(new Position(i,j));
        }
    }
    return positions;
}

function getTrapPositions(): Position[] {
    var positions = [];
    for(let i = 44; i < 47; i++) {
        for(let j = 25; j < 28; j++) {
            positions.push(new Position(i,j));
        }
    }
    return positions;
}
  
const threads = new Set<any>();

if (isMainThread) {
    [0,1,2,3,4,5,6,7,8].forEach((p) => {
        threads.add(
            new Worker(__filename, {
                workerData: {
                    perm: p
                }
            })
        );
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
} else {
    testrun(workerData.perm);
    parentPort.postMessage(
        `STARTING ${workerData.perm}`
    );
}