/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/sperm_race.json`.
 */
export type SpermRace = {
  "address": "2y2AdrVLKqwcA5GQEC1ULEHac3hH9ck565UBqzPaReJZ",
  "metadata": {
    "name": "spermRace",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Sperm Race betting game on Solana"
  },
  "instructions": [
    {
      "name": "claimWinnings",
      "discriminator": [
        161,
        215,
        24,
        59,
        14,
        236,
        242,
        221
      ],
      "accounts": [
        {
          "name": "roundAccount",
          "writable": true
        },
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "babyKingVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  98,
                  121,
                  95,
                  107,
                  105,
                  110,
                  103,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "betRecord",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "treasury",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "spermId",
          "type": "u8"
        }
      ]
    },
    {
      "name": "closeRoundAccount",
      "docs": [
        "Reclaims rent from a RoundAccount after all claims are finished"
      ],
      "discriminator": [
        36,
        31,
        187,
        149,
        214,
        73,
        228,
        48
      ],
      "accounts": [
        {
          "name": "roundAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "round_account.round_id",
                "account": "roundAccount"
              }
            ]
          }
        },
        {
          "name": "globalState",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeGame",
      "docs": [
        "Initialize the game with an authority"
      ],
      "discriminator": [
        44,
        62,
        102,
        247,
        126,
        208,
        130,
        215
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "babyKingVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  98,
                  121,
                  95,
                  107,
                  105,
                  110,
                  103,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "treasury",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "lockBetting",
      "discriminator": [
        9,
        125,
        7,
        62,
        99,
        72,
        131,
        204
      ],
      "accounts": [
        {
          "name": "globalState"
        },
        {
          "name": "roundAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "global_state.current_round",
                "account": "globalState"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "globalState"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "placeBet",
      "docs": [
        "Place a bet on a sperm (user action)"
      ],
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "roundAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        },
        {
          "name": "betRecord",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roundId",
          "type": "u64"
        },
        {
          "name": "spermId",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resolveRound",
      "discriminator": [
        165,
        114,
        237,
        158,
        1,
        36,
        70,
        254
      ],
      "accounts": [
        {
          "name": "globalState"
        },
        {
          "name": "roundAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "global_state.current_round",
                "account": "globalState"
              }
            ]
          }
        },
        {
          "name": "babyKingVault",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  98,
                  121,
                  95,
                  107,
                  105,
                  110,
                  103,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "globalState"
          ]
        }
      ],
      "args": [
        {
          "name": "winnerId",
          "type": "u8"
        },
        {
          "name": "serverSeed",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "startRound",
      "docs": [
        "Start a new round (authority only)"
      ],
      "discriminator": [
        144,
        144,
        43,
        7,
        193,
        42,
        217,
        215
      ],
      "accounts": [
        {
          "name": "globalState",
          "writable": true
        },
        {
          "name": "roundAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  111,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "roundId"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "globalState"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roundId",
          "type": "u64"
        },
        {
          "name": "hashedSeed",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "babyKingVault",
      "discriminator": [
        16,
        115,
        28,
        91,
        209,
        216,
        248,
        224
      ]
    },
    {
      "name": "betRecord",
      "discriminator": [
        144,
        217,
        102,
        109,
        200,
        164,
        66,
        178
      ]
    },
    {
      "name": "globalState",
      "discriminator": [
        163,
        46,
        74,
        168,
        216,
        123,
        133,
        98
      ]
    },
    {
      "name": "roundAccount",
      "discriminator": [
        130,
        93,
        63,
        79,
        92,
        58,
        4,
        134
      ]
    }
  ],
  "events": [
    {
      "name": "claimWinningsEvent",
      "discriminator": [
        141,
        122,
        74,
        70,
        105,
        110,
        174,
        165
      ]
    },
    {
      "name": "lockBettingEvent",
      "discriminator": [
        180,
        189,
        163,
        160,
        250,
        204,
        161,
        132
      ]
    },
    {
      "name": "placeBetEvent",
      "discriminator": [
        177,
        144,
        212,
        92,
        60,
        242,
        202,
        134
      ]
    },
    {
      "name": "resolveRoundEvent",
      "discriminator": [
        138,
        62,
        188,
        243,
        95,
        97,
        16,
        55
      ]
    },
    {
      "name": "startRoundEvent",
      "discriminator": [
        11,
        189,
        160,
        46,
        250,
        130,
        121,
        148
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unauthorized",
      "msg": "Unauthorized: Only authority can perform this action"
    },
    {
      "code": 6001,
      "name": "invalidSpermId",
      "msg": "Invalid sperm ID: Must be 0-9"
    },
    {
      "code": 6002,
      "name": "invalidBetAmount",
      "msg": "Invalid bet amount"
    },
    {
      "code": 6003,
      "name": "bettingLocked",
      "msg": "Betting is locked"
    },
    {
      "code": 6004,
      "name": "roundOverflow",
      "msg": "Round overflow"
    },
    {
      "code": 6005,
      "name": "amountOverflow",
      "msg": "Amount overflow"
    },
    {
      "code": 6006,
      "name": "invalidSeed",
      "msg": "Invalid seed hash"
    },
    {
      "code": 6007,
      "name": "roundNotResolved",
      "msg": "Round not resolved"
    },
    {
      "code": 6008,
      "name": "notAWinner",
      "msg": "Not a winner"
    },
    {
      "code": 6009,
      "name": "roundMismatch",
      "msg": "Round mismatch"
    },
    {
      "code": 6010,
      "name": "invalidPayout",
      "msg": "Invalid payout"
    }
  ],
  "types": [
    {
      "name": "babyKingVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalAccumulated",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "betRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "spermId",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "claimWinningsEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "spermId",
            "type": "u8"
          },
          {
            "name": "amountClaimed",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "currentRound",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "lockBettingEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "placeBetEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "spermId",
            "type": "u8"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "resolveRoundEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "winnerId",
            "type": "u8"
          },
          {
            "name": "totalPot",
            "type": "u64"
          },
          {
            "name": "isBabyKingHit",
            "type": "bool"
          },
          {
            "name": "babyKingJackpotSnapshot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roundAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "hashedSeed",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "winnerId",
            "type": "u8"
          },
          {
            "name": "isLocked",
            "type": "bool"
          },
          {
            "name": "totalPot",
            "type": "u64"
          },
          {
            "name": "isResolved",
            "type": "bool"
          },
          {
            "name": "betsPerSperm",
            "type": {
              "array": [
                "u64",
                10
              ]
            }
          },
          {
            "name": "babyKingHit",
            "type": "bool"
          },
          {
            "name": "babyKingJackpotSnapshot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "startRoundEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roundId",
            "type": "u64"
          },
          {
            "name": "hashedSeed",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
