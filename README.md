# BaSim (modified and expanded by 96jonesa)

Fork of Henke's Old School RuneScape Barbarian Assault simulator. At the time of forking, the simulator only supported Runners, Defenders, and Collectors, each with limited/simplified behavior.

I inherited the code as the monolith that it is, with no knowledge of JavaScript, and treated the project of expanding the simulator as purely functional - ~~maybe one day I'll refactor it, but not today.~~

I've refactored the simulator and re-written it in TypeScript! This was a few afternoons of effort, and it was a massive change, so do let me know if you find any bugs.

# Features Added

- Different foods
- Call changes
- Trap decay (toggleable)
- Trap repair
- Log pickup
- Hammer pickup
- Customizable tick duration
- Pause/unpause
- Save/load game state
- Toggleable infinite food
- Toggleable hammer+log requirement to repair
