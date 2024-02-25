# BaSim

Old School RuneScape Barbarian Assault simulator.

## Development guide

Install `typescript`, `tsc`, `node`, `npm`, and `vitest`. It is recommended to install the latest version of each of these.

Navigate to the root directory (`BaSim/`) of the project directory in the terminal.

Install dependencies by running `npm install` in the terminal.

Build by running `npm run build` in the terminal.

Run tests against TypeScript files by running `npm run test-ts` in the terminal.

Run tests against TypeScript files and generate a coverage report by running `npm run coverage-ts` in the terminal.

Run tests against JavaScript files by running `npm run test-ts` in the terminal.

Run tests against JavaScript files and generate a coverage report by running `npm run coverage-ts` in the terminal.

Run tests against all files by running `npm run test` in the terminal.

Run tests against all files and generate a coverage report by running `npm run coverage` in the terminal.

Delete all transpiled JavaScript, delete the coverage report, and uninstall dependencies by running `npm run clean` in the terminal.

In JetBrains IDEs, you can run the simulator by right-clicking `BaSim/index.html` in the project browser and selecting "Open in" > "Browser" > {your choice of browser}.

## A note on typings

TypeScript doesn't like importing npm modules (e.g. `vitest`) out-of-the-box, but will transpile to JavaScript and even use the
imported modules without issue in the TypeScript files themselves. However, when building it will output errors for each of these
imports claiming it cannot find the modules.

To avoid this very verbose error output, custom typing declaration files can be
created and included in `tsconfig.json`. The downside is that this leads to the class types defined in
those modules not being found (which, again, is only superficial and does not affect functionality).

There may be a more comprehensive solution, but for now the simple solution to be used in this project is to
**use `// @ts-ignore` on each of the affected import statements**, to omit the errors.

## Changes from Henke's code

### Functional

- Different foods
- Call changes
- Trap decay (toggleable)
- Trap repair (toggleable)
- Log pickup (toggleable)
- Customizable tick duration
- Pause/unpause
- Save/load game state
- Toggleable infinite food
- Toggleable hammer+log requirement to repair
- Tile markers

### Non-functional

- Ported entire codebase to TypeScript
- Re-factored from a single-file monolith to a structured object-oriented project
- Added TSDoc to everything
