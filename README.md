# BaSim

Old School RuneScape Barbarian Assault simulator.

## Development guide

**Only create and make changes to TypeScript files in the `BaSim/src/` and `BaSim/test/` directories, and `BaSim/index.html`** - the JavaScript files
in the `BaSim/built/` directory are automatically generated when the project is built.

Install `typescript`, `tsc`, `node`, `npm`, and `vitest`. It is recommended to install the latest version of each of these.

Navigate to the root directory (`BaSim/`) of the project directory in the terminal.

Install dependencies by running `npm install` in the terminal.

Build by running `npm run build` in the terminal.

Run tests by running `npm run test` in the terminal.

Run tests and generate a coverage report by running `npm run coverage` in the terminal.

Delete all transpiled JavaScript, delete the coverage report, and uninstall dependencies by running `npm run clean` in the terminal.

In JetBrains IDEs, you can run the simulator by right-clicking `BaSim/index.html` in the project browser and selecting "Open in" > "Browser" > {your choice of browser}.
