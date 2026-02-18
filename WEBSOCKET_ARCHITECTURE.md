# WebSocket Architecture — End-to-End Flow

> Temporary reference document explaining the real-time update pipeline from
> blockchain event to frontend render.

---

## High-Level Diagram

```
┌──────────────┐     onLogs      ┌──────────────┐     save       ┌──────────────┐
│ Solana Chain │ ──────────────▶ │   Indexer    │ ─────────────▶ │  PostgreSQL  │
│  (Program)   │                 │  Service     │                │   (DB)       │
└──────────────┘                 └──────┬───────┘                └──────────────┘
                                        │
                                        │ PUBLISH (after DB write)
                                        ▼
                                 ┌──────────────┐
                                 │    Redis     │
                                 │  Pub/Sub     │
                                 └──────┬───────┘
                                        │
                                        │ SUBSCRIBE
                                        ▼
                                 ┌──────────────┐    emit()     ┌──────────────┐
                                 │   Game       │ ────────────▶ │  Frontend    │
                                 │  Gateway     │  (Socket.io)  │  (Next.js)   │
                                 └──────────────┘               └──────────────┘
```

---

## Detailed Flow: New Bet Placed

### 1. User places a bet on-chain

The user signs a `PlaceBet` Solana transaction from the frontend wallet.
The transaction is confirmed on the Solana cluster.

### 2. Indexer catches the transaction

`IndexingService` subscribes to program logs via `connection.onLogs()`.
When it detects a `PlaceBet` instruction, it routes the raw payload to
`BetHistoryService.handleInstruction()`.

### 3. BetHistoryService saves to DB + publishes to Redis

```
BetHistoryService.recordBet(bet)
  │
  ├─ 1. INSERT into bet_history (PostgreSQL)  ← source of truth
  │
  └─ 2. publishPoolUpdate(bet)                ← "stealth" update
       │
       ├─ INCRBY  game:round:{id}:totalPot
       ├─ INCRBY  game:round:{id}:sperm:{sid}:totalBets
       ├─ SADD    game:round:{id}:sperm:{sid}:bettors
       │
       ├─ GET totalPot, totalBets, SCARD bettorCount
       │
       └─ PUBLISH game:pool:update → {
            roundId, spermId, totalBets, bettorCount, totalPot
          }
```

### 4. GameGateway receives the Pub/Sub message

The gateway subscribed to `game:pool:update` on `onModuleInit()`.
When the message arrives:

```
GameGateway.onPoolUpdate(data)
  │
  └─ server.to(`round:${roundId}`).emit('pool:update', data)
```

### 5. Frontend receives the Socket.io event

The frontend's Socket.io client receives `pool:update` and updates the UI:
- Total bet amount in the current round (`totalPot`)
- Number of unique users per sperm (`bettorCount`)
- Total bet amount per sperm (`totalBets`)

**No user-sperm bet map is ever sent** — the frontend only sees aggregates.

---

## Detailed Flow: Phase Transitions

### GameContractService orchestrates the game loop

```
Round N
  │
  ├─ Preparation Phase (betting open)
  │   ├─ Start round on-chain (commitment + end_slot)
  │   ├─ SET Redis: active round, phase info, init pool to 0
  │   ├─ PUBLISH game:phase:update → { phase: PREPARATION, endsAt, commitment }
  │   └─ Sleep(preparationDuration)
  │
  ├─ Resolution Phase (race / winner reveal) — Strategy A
  │   ├─ Lock betting on-chain
  │   ├─ Derive winner (slot hash + server seed)
  │   ├─ Derive raceParams (base speeds + 1–3 randomized boosts for non-winners)
  │   ├─ SET Redis phase → RESOLUTION { startedAt, endsAt, winner, raceParams }
  │   ├─ PUBLISH game:phase:update → { phase: RESOLUTION, startedAt, endsAt, winner, raceParams }
  │   ├─ Resolve round on-chain
  │   ├─ PUBLISH game:round:result → { winnerId, totalPot, isBabyKingHit, raceParams }
  │   └─ Sleep(remaining)
  │
  └─ Distribution Phase (claim winnings)
      ├─ Fetch round results from chain
      ├─ SET Redis phase → DISTRIBUTION (with winner)
      ├─ PUBLISH game:phase:update → { phase: DISTRIBUTION, endsAt, winner, totalPot }
      ├─ Sleep(distributionDuration)
      └─ EXPIRE all round Redis keys (5 min TTL)
```

### Gateway handles phase updates

- `phase:update` → emits to current round room
- On new round (preparation phase with `previousRoundId`):
  migrates all connected sockets from old room to new room
- `round:result` → emits winner to round room (triggers race animation)

---

## Client Connection Flow

```
Frontend connects to ws://host:4000/game
  │
  ├─ Gateway.handleConnection(socket)
  │   ├─ Get active round ID from Redis (fallback: contract service)
  │   ├─ socket.join(`round:${roundId}`)
  │   └─ Emit 'game:state' → full snapshot:
  │       {
  │         roundId, phase, phaseStartedAt, phaseEndsAt, totalPot,
  │         sperms: [{ spermId, totalBets, bettorCount }, ...],
  │         commitment?, winner?, raceParams?
  │       }
  │
  └─ Client renders immediately with the snapshot,
     then applies incremental pool:update / phase:update events.
```

---

## Redis Key Strategy

| Key Pattern | Type | Purpose |
|---|---|---|
| `game:active` | String | Current active round ID |
| `game:round:{id}:phase` | String (JSON) | Phase info: `{ phase, endsAt, commitment?, winner?, raceParams?, leaderboard? }` |
| `game:round:{id}:totalPot` | String (int) | Total pot in lamports (INCRBY-safe) |
| `game:round:{id}:sperm:{sid}:totalBets` | String (int) | Total bets on sperm in lamports |
| `game:round:{id}:sperm:{sid}:bettors` | Set | Unique bettor wallet addresses |

All round-specific keys receive a 5-minute TTL after the round ends.

## Redis Pub/Sub Channels

| Channel | Payload | Trigger |
|---|---|---|
| `game:pool:update` | `{ roundId, spermId, totalBets, bettorCount, totalPot }` | New bet indexed |
| `game:phase:update` | `{ roundId, phase, startedAt, endsAt, commitment?, winner?, raceParams?, leaderboard?, totalPot?, previousRoundId? }` | Phase transition |
| `game:round:result` | `{ roundId, winnerId, totalPot, isBabyKingHit, raceParams?, leaderboard? }` | Round resolved |

---

## Socket.io Events (Server → Client)

| Event | Payload | When |
|---|---|---|
| `game:state` | `GameStatePayload` | On connect (full snapshot) |
| `pool:update` | `PoolUpdatePayload` | Each new bet indexed |
| `phase:update` | `PhaseUpdatePayload` | Phase transitions |
| `round:result` | `RoundResultPayload` | Winner determined |
| `error` | `{ code, message }` | Error conditions |

### Payload sizes (approximate)

- `game:state`: ~1 KB (10 sperms × ~60 bytes + metadata + raceParams)
- `pool:update`: ~120 bytes
- `phase:update`: ~400 bytes (with raceParams + boost segments during resolution)
- `round:result`: ~400 bytes (with raceParams)

---

## Frontend Display Requirements

| Requirement | Source Event | Field |
|---|---|---|
| Total bet in current round | `game:state` / `pool:update` | `totalPot` |
| User count per sperm | `game:state` / `pool:update` | `bettorCount` |
| Bet amount per sperm | `game:state` / `pool:update` | `totalBets` |
| Phase countdown | `game:state` / `phase:update` | `phaseEndsAt` / `endsAt` |
| Winner reveal | `round:result` / `phase:update` | `winnerId` |
| Leaderboard (1st–10th) | `round:result`, `phase:update` (distribution), `game:state` (distribution) | `leaderboard` |
| Race animation position | `phase:update` / `game:state` | `raceParams`, `phaseStartedAt`, `phaseEndsAt` |

### Strategy A: Deterministic race animation (with speed boosts)

Race positions are derived from `raceParams`, `phaseStartedAt`, and `phaseEndsAt`. Each sperm has:
- `baseSpeed`: base velocity (winner = 1.0, others 0.7–0.95)
- `segments` (optional): `[{ from, to, mult }]` — speed multiplier during time segment. Gaps use baseSpeed.

0–5 sperms per round (including the winner) get a randomized boost (early surge, mid burst, or late sprint).
Boosts are cosmetic only; outcome is fixed. Winner can have a boost too, so there is no predictable pattern.

**Progress formula (with segments):** For `t = elapsed / duration` (0–1), integrate speed:
- If no segments: `progress = t * baseSpeed / maxBaseSpeed`
- If segments: integrate `baseSpeed * segment.mult` over [0, t]. Example: segments
  `[{0, 0.4, 1.4}, {0.4, 1, 1}]` → progress = (0.4×1.4 + 0.6×1) × t_effective (split by segment boundaries).

### Countdown implementation (clock-drift safe)

Both `startedAt` and `endsAt` are server-clock timestamps. The frontend derives
the total duration from the server pair and runs a local timer — no dependency
on `Date.now()` matching the server:

```typescript
// Frontend pseudo-code — immune to client/server clock drift
const duration = endsAt - startedAt;                     // total phase length (server)
const elapsed  = Date.now() - localReceiveTime;          // time since we got the event
const remaining = Math.max(0, duration - elapsed);
const seconds   = Math.ceil(remaining / 1000);
```

---

## Why This Avoids the "Database Loop" Trap

1. **Indexer writes to DB** → source of truth, append-only
2. **Indexer publishes to Redis** → real-time notification (fire-and-forget)
3. **Gateway subscribes to Redis** → emits to sockets (never queries DB for live updates)
4. **DB is only queried** on initial connect (fallback) and for historical REST endpoints

The gateway **never polls** the database. Live updates flow exclusively through
Redis Pub/Sub, keeping latency low and DB load constant regardless of connected
client count.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `REDIS_URL` | — | Full Redis URL (alternative to host/port/password) |
| `REDIS_HOST` | `localhost` | Redis hostname (`redis` in Docker) |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | — | Redis AUTH password |

---

## Horizontal Scaling

The Socket.io Redis adapter (`@socket.io/redis-adapter`) ensures that:
- `emit()` to a room reaches clients on **all** NestJS instances
- `join()` / `leave()` are synchronized across instances
- No sticky sessions required at the load balancer level

Each NestJS instance has its own pair of Redis connections for the adapter
(separate from the application-level `RedisService` connections).
