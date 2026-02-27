'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Application,
  Assets,
  Container,
  TilingSprite,
  Sprite,
  AnimatedSprite,
  Texture,
  Rectangle,
} from 'pixi.js';
import { useGameStore } from '../../store/gameStore';
import { progressAtT, MAX_BASE_SPEED } from '../../game/utils/raceProgress';
import {
  RACER_COUNT,
  FIELD_SETTINGS,
  RACER_SETTINGS,
  PARALLAX_MULT,
  CANVAS_W,
  CANVAS_H,
  FRAME_W,
  FRAME_H,
  FRAME_COUNT,
  RACER_REG_X,
  RACER_REG_Y,
  RACE,
} from '../../game/constants/vanillaAssets';

const FALLBACK_DURATION_MS = 30_000;

const SCORE_LIST_OFFSET_X = 165;
const ICON_SPACING = -35;
const PIN_RANGE = { sX: -170, eX: 195 };

const SPREAD_MULT = 4;

const LAST_LANE_Y = RACE.startY + (RACER_COUNT - 1) * RACE.laneSpaceY;
const GROUND_END_Y = LAST_LANE_Y + 40;

const SCOREBAR_SCALE = 1.15;
const SCOREBAR_Y = CANVAS_H * 0.95;

const DEBUG_FINISH_OFFSET_X = 0;

/**
 * Extra width (in logical px) for TilingSprites so they still cover
 * the viewport when the div aspect ratio differs from CANVAS_W:CANVAS_H.
 */
const TILE_W = CANVAS_W * 2;

interface SceneRefs {
  sky: TilingSprite;
  billboard: TilingSprite;
  ground: TilingSprite | null;
  endline: Sprite;
  end: Sprite;
  racers: AnimatedSprite[];
  shadows: Sprite[];
  icons: Sprite[];
  pin: Sprite;
  scoreListContainer: Container;
  world: Container;
}

interface RaceOverlayV2Props {
  preRace?: boolean;
}

export const RaceOverlayV2: React.FC<RaceOverlayV2Props> = ({ preRace = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const mountTimeRef = useRef(Date.now());
  const lastTimeRef = useRef(Date.now());
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const apiPhaseStartedAt = useGameStore((s) => s.apiPhaseStartedAt);
  const apiPhaseEndsAt = useGameStore((s) => s.apiPhaseEndsAt);
  const apiPhaseReceivedAt = useGameStore((s) => s.apiPhaseReceivedAt);
  const raceParams = useGameStore((s) => s.raceParams);

  const dur = apiPhaseEndsAt - apiPhaseStartedAt;
  const hasValid = dur > 0;
  const effStart = hasValid ? apiPhaseReceivedAt || apiPhaseStartedAt : mountTimeRef.current;
  const effDuration = hasValid ? dur : FALLBACK_DURATION_MS;
  const hasParams = !!(raceParams && raceParams.length >= RACER_COUNT);

  const fieldIndex = Math.floor((apiPhaseStartedAt || Date.now()) / 10000) % FIELD_SETTINGS.length;
  const field = FIELD_SETTINGS[fieldIndex];

  const sceneRef = useRef<SceneRefs | null>(null);
  const debugFreezeAtFinish = useGameStore((s) => s.debugFreezeAtFinish ?? false);
  const freezeAtFinishRef = useRef(false);

  const preRaceRef = useRef(preRace);
  preRaceRef.current = preRace;

  type JitterEntry = { phases: number[]; freqs: number[]; amp: number };
  const jitterRef = useRef<JitterEntry[] | null>(null);
  if (!jitterRef.current) {
    const TAU = Math.PI * 2;
    const j: JitterEntry[] = [];
    for (let i = 0; i < RACER_COUNT; i++) {
      j.push({
        phases: [Math.random() * TAU, Math.random() * TAU, Math.random() * TAU],
        freqs: [1.5 + Math.random() * 1.5, 3 + Math.random() * 3, 0.6 + Math.random() * 1],
        amp: 0.04 + Math.random() * 0.05,
      });
    }
    jitterRef.current = j;
  }

  /* ====================== tick ====================== */
  const tick = useCallback(() => {
    const app = appRef.current;
    const sc = sceneRef.current;
    if (!app || !sc) return;

    const isFrozen = freezeAtFinishRef.current;
    if (debugFreezeAtFinish && isFrozen) {
      return;
    }
    if (!debugFreezeAtFinish && isFrozen) {
      freezeAtFinishRef.current = false;
    }

    const now = Date.now();
    const deltaMs = now - lastTimeRef.current;
    lastTimeRef.current = now;
    const deltaS = deltaMs / 1000;

    /* ---------- cover-fill: scale world to fully cover the renderer ---------- */
    const rw = Math.max(1, (app as any).renderer?.width ?? CANVAS_W);
    const rh = Math.max(1, (app as any).renderer?.height ?? CANVAS_H);
    const scale = Math.max(rw / CANVAS_W, rh / CANVAS_H);
    sc.world.scale.set(scale);
    sc.world.x = Math.round((rw - CANVAS_W * scale) / 2);
    sc.world.y = Math.round((rh - CANVAS_H * scale) / 2);

    const tileMod = (sprite: TilingSprite | null, dx: number) => {
      if (!sprite?.tilePosition) return;
      const tw = sprite.texture.width || 400;
      let x = (sprite.tilePosition.x ?? 0) - dx;
      x = x % tw;
      if (x > 0) x -= tw;
      sprite.tilePosition.x = x;
    };

    /* ========== PRE-RACE: entrance animation + idle ========== */
    if (preRaceRef.current && !debugFreezeAtFinish) {
      const ENTRANCE_DURATION = 1200;
      const STAGGER = 80;
      const entElapsed = now - mountTimeRef.current;
      const startX = RACE.rangeX[0];
      const offScreenX = startX - 300;

      for (let n = 0; n < RACER_COUNT; n++) {
        const racerElapsed = Math.max(0, entElapsed - n * STAGGER);
        const t = Math.min(1, racerElapsed / ENTRANCE_DURATION);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const x = offScreenX + (startX - offScreenX) * eased;
        sc.racers[n].x = x;
        sc.shadows[n].x = x;
      }

      const idleSpeed = RACE.raceSpeed * 0.15;
      tileMod(sc.ground, deltaS * idleSpeed * PARALLAX_MULT.ground);
      tileMod(sc.billboard, deltaS * idleSpeed * PARALLAX_MULT.billboard);
      tileMod(sc.sky, deltaS * idleSpeed * PARALLAX_MULT.sky);

      sc.pin.x = PIN_RANGE.sX;
      sc.pin.y = 32;
      return;
    }

    /* ========== RACING MODE ========== */

    /* ---------- time progress from socket ---------- */
    let elapsed = now - effStart;
    if (elapsed < 0) elapsed = Math.max(0, now - mountTimeRef.current);
    const baseT = effDuration > 0 ? Math.min(1, Math.max(0, elapsed) / effDuration) : 0;
    const t = debugFreezeAtFinish ? 1 : baseT;
    const raceProgress = t * 100;

    const [rxMin, rxMax] = RACE.rangeX;
    const rawProgs: number[] = [];
    for (let n = 0; n < RACER_COUNT; n++) {
      if (hasParams && raceParams?.[n]) {
        rawProgs.push(progressAtT(raceParams[n], t));
      } else {
        rawProgs.push(t * MAX_BASE_SPEED);
      }
    }

    /* ---------- time remaining (ms) for time-based cutoffs ---------- */
    const remainingMs = debugFreezeAtFinish ? 0 : Math.max(0, effDuration - elapsed);

    /* ---------- client-side jitter: organic speed variation ---------- */
    const JITTER_FULL_AT = 8000;
    const JITTER_GONE_AT = 4000;
    const jitterFade =
      remainingMs > JITTER_FULL_AT
        ? 1
        : remainingMs < JITTER_GONE_AT
          ? 0
          : (remainingMs - JITTER_GONE_AT) / (JITTER_FULL_AT - JITTER_GONE_AT);

    if (jitterFade > 0 && jitterRef.current) {
      const TAU = Math.PI * 2;
      for (let n = 0; n < RACER_COUNT; n++) {
        const jp = jitterRef.current[n];
        const noise =
          Math.sin(t * jp.freqs[0] * TAU + jp.phases[0]) * 0.5 +
          Math.sin(t * jp.freqs[1] * TAU + jp.phases[1]) * 0.3 +
          Math.sin(t * jp.freqs[2] * TAU + jp.phases[2]) * 0.2;
        rawProgs[n] += noise * jp.amp * jitterFade;
      }
    }

    /* ---------- lock to final server order: last 6s ease-in, locked by 1.5s ---------- */
    const LOCK_BLEND_AT = 6000;
    const LOCK_FULL_AT = 1500;
    let lockBlend = 0;
    if (remainingMs < LOCK_BLEND_AT && hasParams && raceParams) {
      const linear =
        remainingMs < LOCK_FULL_AT
          ? 1
          : 1 - (remainingMs - LOCK_FULL_AT) / (LOCK_BLEND_AT - LOCK_FULL_AT);
      lockBlend = linear * linear * (3 - 2 * linear); // smoothstep easeInOut
    }

    /* ---------- pack-center positioning: everyone moves forward ---------- */
    const norms = rawProgs.map((p) => p / MAX_BASE_SPEED);
    const packCenter = norms.reduce((s, v) => s + v, 0) / RACER_COUNT;

    const racerWorldX: number[] = [];

    if (lockBlend > 0 && hasParams && raceParams) {
      const finalProgs = raceParams.map((p) => (p ? progressAtT(p, 1.0) : 0));
      const maxFinal = Math.max(...finalProgs, 0.001);
      const minFinal = Math.min(...finalProgs);
      const finalRange = maxFinal - minFinal || 0.001;

      for (let n = 0; n < RACER_COUNT; n++) {
        const deviation = (norms[n] - packCenter) * SPREAD_MULT;
        const packNorm = Math.max(0, Math.min(1, packCenter + deviation));
        const packX = rxMin + (rxMax - rxMin) * packNorm;

        const finalRatio = (finalProgs[n] - minFinal) / finalRange;
        const finalX = rxMin + (rxMax - rxMin) * finalRatio;

        racerWorldX.push(packX * (1 - lockBlend) + finalX * lockBlend);
      }
    } else {
      for (let n = 0; n < RACER_COUNT; n++) {
        const deviation = (norms[n] - packCenter) * SPREAD_MULT;
        const norm = Math.max(0, Math.min(1, packCenter + deviation));
        racerWorldX.push(rxMin + (rxMax - rxMin) * norm);
      }
    }

    /* ---------- parallax background (vanilla-style deltaS scroll) ---------- */
    const bgSpeed = RACE.raceSpeed * (1 + t * 0.6);

    tileMod(sc.ground, deltaS * bgSpeed * PARALLAX_MULT.ground);
    tileMod(sc.billboard, deltaS * bgSpeed * PARALLAX_MULT.billboard);
    tileMod(sc.sky, deltaS * bgSpeed * PARALLAX_MULT.sky);

    /* ---------- end line scrolls in near the finish ---------- */
    if (raceProgress > 92) {
      const endSpeed = bgSpeed * 1.5;
      sc.endline.x -= deltaS * endSpeed;
      sc.end.x -= deltaS * endSpeed;
    }

    /* ---------- place racers & shadows (smoothed, gradually faster near finish) ---------- */
    const lerpSpeed = 0.12 + lockBlend * 0.13;
    for (let n = 0; n < RACER_COUNT; n++) {
      sc.racers[n].x += (racerWorldX[n] - sc.racers[n].x) * lerpSpeed;
      sc.shadows[n].x = sc.racers[n].x;
    }

    /* ---------- scorebar: order icons by current visual positions ---------- */
    const order = racerWorldX
      .map((x, i) => ({ i, x }))
      .sort((a, b) => b.x - a.x)
      .map((s) => s.i);

    const listPositions: number[] = [];
    for (let n = 0; n < RACER_COUNT; n++) {
      listPositions.push(n * ICON_SPACING);
    }

    for (let rank = 0; rank < order.length; rank++) {
      const icon = sc.icons[order[rank]];
      if (icon) {
        const targetX = listPositions[rank];
        icon.x += (targetX - icon.x) * 0.15;
        sc.scoreListContainer.setChildIndex(icon, rank);
      }
    }

    const pinLen = PIN_RANGE.eX - PIN_RANGE.sX;
    const pinX = PIN_RANGE.sX + (raceProgress / 100) * pinLen;
    sc.pin.x = Math.min(pinX, PIN_RANGE.eX);
    sc.pin.y = 32;

    if (debugFreezeAtFinish && !freezeAtFinishRef.current) {
      let leaderIndex = 0;
      let leaderTargetX = racerWorldX[0] ?? RACE.rangeX[1];
      for (let n = 1; n < RACER_COUNT; n++) {
        if (racerWorldX[n] > leaderTargetX) {
          leaderTargetX = racerWorldX[n];
          leaderIndex = n;
        }
      }

      const finishX = sc.endline.x + DEBUG_FINISH_OFFSET_X;
      const dx = finishX - leaderTargetX;

      for (let n = 0; n < RACER_COUNT; n++) {
        const x = racerWorldX[n] + dx;
        sc.racers[n].x = x;
        sc.shadows[n].x = x;
      }

      sc.pin.x = PIN_RANGE.eX;

      freezeAtFinishRef.current = true;
      return;
    }
  }, [effStart, effDuration, hasParams, raceParams, debugFreezeAtFinish]);

  /* ====================== init ====================== */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let app: Application | null = null;
    let destroyed = false;

    (async () => {
      try {
        app = new Application();
        await (app as any).init({
          resizeTo: el,
          backgroundColor: 0x1a1a2e,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true,
          antialias: true,
        });
        if (destroyed) return;
        appRef.current = app;

        const world = new Container();
        app.stage.addChild(world);

        /* ---------- load textures ---------- */
        const [
          skyTex,
          billboardTex,
          groundTex,
          endlineTex,
          endTex,
          shadowTex,
          scoreBarTex,
          scorePinTex,
        ] = await Promise.all([
          Assets.load(field.sky),
          Assets.load(field.billboard),
          Assets.load(field.race),
          Assets.load(field.endline),
          Assets.load(field.end),
          Assets.load(field.shadow),
          Assets.load('/game/assets/item_race_score.png'),
          Assets.load('/game/assets/item_race_pin.png'),
        ]);
        const iconTextures: Texture[] = await Promise.all(
          RACER_SETTINGS.map((r) => Assets.load(r.icon)),
        );
        if (destroyed) return;

        /* ---------- parallax layers ---------- */
        const mkTile = (tex: Texture, y: number, h: number, sX?: number, sY?: number) => {
          const ts = new TilingSprite({
            texture: tex,
            width: TILE_W,
            height: h,
          });
          ts.x = -TILE_W / 4;
          ts.y = y;
          if (sX) ts.scale.x = sX;
          if (sY) ts.scale.y = sY;
          return ts;
        };

        const sky = mkTile(skyTex, RACE.billboardY - 50, 200);
        world.addChild(sky);

        const billboardH = 300;
        const billboard = mkTile(billboardTex, RACE.billboardY, billboardH, 0.75, 0.5);
        world.addChild(billboard);

        let ground: TilingSprite | null = null;
        const groundH = GROUND_END_Y - RACE.groundY;
        if (groundH > 0) {
          ground = mkTile(groundTex, RACE.groundY - 50, groundH + 10, 1, 1.25);
          world.addChild(ground);
        }

        /* ---------- end line ---------- */
        const endline = new Sprite(endlineTex);
        endline.anchor.set(1, 0);
        endline.x = RACE.endlineX;

        const baseTopY = ground ? ground.y : RACE.groundY - 50;
        const baseBottomY = ground ? ground.y + ground.height : GROUND_END_Y;

        const endlineTargetTopY = baseTopY + RACE.endlineTopOffset;
        const endlineTargetBottomY = baseBottomY + RACE.endlineBottomOffset;

        endline.y = endlineTargetTopY;
        const endlineBaseHeight = endline.height;
        if (endlineBaseHeight > 0) {
          const endlineNeededHeight = endlineTargetBottomY - endlineTargetTopY;
          if (endlineNeededHeight > 0) {
            endline.scale.y = endlineNeededHeight / endlineBaseHeight;
          }
        }
        world.addChild(endline);

        const endSprite = new Sprite(endTex);
        endSprite.anchor.set(1, 1);
        endSprite.x = RACE.endlineX + RACE.endSpriteOffsetX;
        endSprite.y = RACE.endlineY + RACE.endSpriteOffsetY;
        world.addChild(endSprite);

        /* ---------- shadows + racers ---------- */
        const shadows: Sprite[] = [];
        const racers: AnimatedSprite[] = [];

        for (let i = 0; i < RACER_COUNT; i++) {
          const baseTex = await Assets.load(RACER_SETTINGS[i].race);
          const frames: Texture[] = [];
          for (let f = 0; f < FRAME_COUNT; f++) {
            frames.push(
              new Texture({
                source: baseTex.source,
                frame: new Rectangle(f * FRAME_W, 0, FRAME_W, FRAME_H),
              }),
            );
          }
          const laneY = RACE.startY + i * RACE.laneSpaceY;

          const shadow = new Sprite(shadowTex);
          shadow.anchor.set(0.5, 0.5);
          shadow.x = RACE.rangeX[0];
          shadow.y = laneY;
          world.addChild(shadow);
          shadows.push(shadow);

          const anim = new AnimatedSprite(frames);
          anim.anchor.set(RACER_REG_X / FRAME_W, RACER_REG_Y / FRAME_H);
          anim.animationSpeed = 0.8;
          anim.play();
          anim.x = RACE.rangeX[0];
          anim.y = laneY;
          world.addChild(anim);
          racers.push(anim);
        }

        /* ---------- scorebar (vanilla layout) ---------- */
        const scoreContainer = new Container();
        scoreContainer.x = CANVAS_W / 2;
        scoreContainer.y = SCOREBAR_Y - 20;
        scoreContainer.scale.set(SCOREBAR_SCALE);

        const scoreBg = new Sprite(scoreBarTex);
        scoreBg.anchor.set(0.5, 0.5);
        scoreContainer.addChild(scoreBg);

        const pin = new Sprite(scorePinTex);
        pin.anchor.set(0.5, 0.5);
        pin.x = PIN_RANGE.sX;
        pin.y = 32;
        scoreContainer.addChild(pin);

        const scoreListContainer = new Container();
        scoreListContainer.x = SCORE_LIST_OFFSET_X;
        const icons: Sprite[] = [];
        for (let i = 0; i < RACER_COUNT; i++) {
          const ic = new Sprite(iconTextures[i]);
          ic.anchor.set(0.5, 0.5);
          ic.x = i * ICON_SPACING;
          ic.y = 10;
          scoreListContainer.addChild(ic);
          icons.push(ic);
        }
        scoreContainer.addChild(scoreListContainer);
        world.addChild(scoreContainer);

        /* ---------- store refs ---------- */
        sceneRef.current = {
          sky,
          billboard,
          ground,
          endline,
          end: endSprite,
          racers,
          shadows,
          icons,
          pin,
          scoreListContainer,
          world,
        };

        el.appendChild((app as any).canvas);
        setIsReady(true);
      } catch (err: any) {
        console.error('RaceOverlayV2 init error:', err);
        setLoadError(err?.message ?? 'Failed to load race assets');
      }
    })();

    return () => {
      destroyed = true;
      if (app) {
        try {
          const c = (app as any).canvas;
          if (c?.parentNode) c.parentNode.removeChild(c);
          app.destroy(true, { children: true, texture: true, textureSource: true } as any);
        } catch (e) {
          console.warn('RaceOverlayV2 cleanup:', e);
        }
        appRef.current = null;
        sceneRef.current = null;
      }
    };
  }, [field.sky, field.billboard, field.race, field.endline, field.end, field.shadow]);

  /* ====================== animation loop ====================== */
  useEffect(() => {
    if (!isReady) return;
    let rafId: number;
    const loop = () => {
      tick();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [tick, isReady]);

  if (loadError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400 text-sm z-10">
        {loadError}
      </div>
    );
  }

  return <div ref={containerRef} className="absolute inset-0 w-full h-full z-[10]" />;
};
