/**
 * Vanilla JS game asset paths and layout constants.
 * Matches fieldSettings, racerSettings, and prepareRace() from game.js.
 */

export const RACER_COUNT = 10;

export const FIELD_SETTINGS = [
  {
    sky: '/game/assets/bg_sky_01.png',
    race: '/game/assets/bg_race_01.png',
    billboard: '/game/assets/bg_billboard_01.png',
    end: '/game/assets/bg_end_01.png',
    endline: '/game/assets/bg_end_line_01.png',
    shadow: '/game/assets/bg_shadow_01.png',
  },
  {
    sky: '/game/assets/bg_sky_02.png',
    race: '/game/assets/bg_race_02.png',
    billboard: '/game/assets/bg_billboard_02.png',
    end: '/game/assets/bg_end_01.png',
    endline: '/game/assets/bg_end_line_01.png',
    shadow: '/game/assets/bg_shadow_02.png',
  },
  {
    sky: '/game/assets/bg_sky_03.png',
    race: '/game/assets/bg_race_03.png',
    billboard: '/game/assets/bg_billboard_03.png',
    end: '/game/assets/bg_end_01.png',
    endline: '/game/assets/bg_end_line_01.png',
    shadow: '/game/assets/bg_shadow_03.png',
  },
];

export const RACER_SETTINGS = Array.from({ length: RACER_COUNT }, (_, i) => ({
  name: ['President', 'Doctor', 'Astronaut', 'Bartender', 'Teacher', 'Chef', 'Farmer', 'Pilot', 'Artist', 'Scientist'][i] ?? `Racer ${i + 1}`,
  icon: `/game/assets/icon_${String(i + 1).padStart(2, '0')}.png`,
  race: `/game/assets/racer_${String(i + 1).padStart(2, '0')}.png`,
}));

export const PARALLAX_MULT = { ground: 1, billboard: 0.8, sky: 0.3 } as const;

/**
 * Canvas / world dimensions that match the vanilla game exactly.
 * Vanilla uses a 1280×768 canvas.
 */
export const CANVAS_W = 1280;
export const CANVAS_H = 768;

/** Racer sprite frame dimensions (from createRacer in game.js) */
export const FRAME_W = 131;
export const FRAME_H = 91;
export const FRAME_COUNT = 10;

/** Racer registration point (vanilla: regX = 131/2+5, regY = 91-2) */
export const RACER_REG_X = FRAME_W / 2 + 5;
export const RACER_REG_Y = FRAME_H - 2;

/**
 * Race layout — pixel positions inside the 1280×768 world.
 * Racers sit in fixed lanes. The **camera** (world container) scrolls
 * so the leader is always visible near the right side of the viewport.
 */
export const RACE = {
  /** Racers horizontal range in *world* coords (vanilla rangeX) */
  rangeX: [100, 400] as [number, number],
  /** First lane centre-Y */
  startY: 220,
  /** Vertical gap between lanes */
  laneSpaceY: 50,
  /** Background layer Y offsets */
  skyY: -10,
  billboardY: 10,
  groundY: 100,
  /** End-line initial X and Y */
  endlineX: 1310,
  endlineY: 428,
  /** vanilla raceSpeed */
  raceSpeed: 480,
};
