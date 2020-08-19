# BaSim (modified by 96jonesa)

Fork of Henke's Old School RuneScape Barbarian Assault simulator. At the time of forking, the simulator only supported Runners, Defenders, and Collectors.

I intend to expand the simulator to include all relevant components required to run reinforcement learning on it for the purpose of solving for best strategies. Before expanding, I will polish the existing code and give reinforcement learning a whirl on solving for useful Defender strategies using heuristic reward functions determined by current Healer meta strategies (as opposed to wave completion time, which will define the reward functions in the full game).

I am using this as an excuse to learn JavaScript + Node.js and test out reinforcement learning on JavaScript. (This seems a more worthwhile and less excruciating approach than reimplementing in C++).

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
