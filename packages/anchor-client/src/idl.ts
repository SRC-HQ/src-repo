/**
 * IDL for the Sperm Race program
 * 
 * NOTE: This file should be auto-generated from the Anchor build.
 * Run `bun run generate:idl` after building the contract.
 * 
 * This is a placeholder that will be replaced by the generated IDL.
 */

export type SpermRace = {
  version: '0.1.0';
  name: 'sperm_race';
  instructions: [
    {
      name: 'initialize';
      accounts: [
        { name: 'authority'; isMut: true; isSigner: true },
        { name: 'gameState'; isMut: true; isSigner: false },
        { name: 'vault'; isMut: true; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [];
    },
    {
      name: 'depositBet';
      accounts: [
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'gameState'; isMut: true; isSigner: false },
        { name: 'betRecord'; isMut: true; isSigner: false },
        { name: 'vault'; isMut: true; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [
        { name: 'amount'; type: 'u64' },
        { name: 'spermId'; type: 'u8' },
        { name: 'roundId'; type: 'u64' },
      ];
    },
    {
      name: 'setPayout';
      accounts: [
        { name: 'authority'; isMut: true; isSigner: true },
        { name: 'gameState'; isMut: false; isSigner: false },
        { name: 'betRecord'; isMut: true; isSigner: false },
      ];
      args: [{ name: 'payoutAmount'; type: 'u64' }];
    },
    {
      name: 'claimWinnings';
      accounts: [
        { name: 'user'; isMut: true; isSigner: true },
        { name: 'betRecord'; isMut: true; isSigner: false },
        { name: 'vault'; isMut: true; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [];
    },
    {
      name: 'withdrawFees';
      accounts: [
        { name: 'authority'; isMut: true; isSigner: true },
        { name: 'gameState'; isMut: false; isSigner: false },
        { name: 'vault'; isMut: true; isSigner: false },
        { name: 'systemProgram'; isMut: false; isSigner: false },
      ];
      args: [{ name: 'amount'; type: 'u64' }];
    },
    {
      name: 'setPaused';
      accounts: [
        { name: 'authority'; isMut: true; isSigner: true },
        { name: 'gameState'; isMut: true; isSigner: false },
      ];
      args: [{ name: 'paused'; type: 'bool' }];
    },
  ];
  accounts: [
    {
      name: 'gameState';
      type: {
        kind: 'struct';
        fields: [
          { name: 'authority'; type: 'publicKey' },
          { name: 'currentRound'; type: 'u64' },
          { name: 'totalDeposited'; type: 'u64' },
          { name: 'isPaused'; type: 'bool' },
          { name: 'houseFeePercent'; type: 'u8' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
    {
      name: 'betRecord';
      type: {
        kind: 'struct';
        fields: [
          { name: 'user'; type: 'publicKey' },
          { name: 'amount'; type: 'u64' },
          { name: 'spermId'; type: 'u8' },
          { name: 'roundId'; type: 'u64' },
          { name: 'claimed'; type: 'bool' },
          { name: 'payoutAmount'; type: 'u64' },
          { name: 'bump'; type: 'u8' },
        ];
      };
    },
  ];
  errors: [
    { code: 6000; name: 'InvalidSpermId'; msg: 'Invalid sperm ID. Must be 0-9.' },
    { code: 6001; name: 'BetTooSmall'; msg: 'Bet amount too small. Minimum is 0.01 SOL.' },
    { code: 6002; name: 'BetTooLarge'; msg: 'Bet amount too large. Maximum is 10 SOL.' },
    { code: 6003; name: 'GamePaused'; msg: 'Game is paused.' },
    { code: 6004; name: 'Unauthorized'; msg: 'Unauthorized action.' },
    { code: 6005; name: 'AlreadyClaimed'; msg: 'Winnings already claimed.' },
    { code: 6006; name: 'NotAWinner'; msg: 'Not a winner. No payout available.' },
    { code: 6007; name: 'InsufficientFunds'; msg: 'Insufficient funds in vault.' },
    { code: 6008; name: 'Overflow'; msg: 'Arithmetic overflow.' },
  ];
};

export const IDL: SpermRace = {
  version: '0.1.0',
  name: 'sperm_race',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'gameState', isMut: true, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'depositBet',
      accounts: [
        { name: 'user', isMut: true, isSigner: true },
        { name: 'gameState', isMut: true, isSigner: false },
        { name: 'betRecord', isMut: true, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [
        { name: 'amount', type: 'u64' },
        { name: 'spermId', type: 'u8' },
        { name: 'roundId', type: 'u64' },
      ],
    },
    {
      name: 'setPayout',
      accounts: [
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'gameState', isMut: false, isSigner: false },
        { name: 'betRecord', isMut: true, isSigner: false },
      ],
      args: [{ name: 'payoutAmount', type: 'u64' }],
    },
    {
      name: 'claimWinnings',
      accounts: [
        { name: 'user', isMut: true, isSigner: true },
        { name: 'betRecord', isMut: true, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'withdrawFees',
      accounts: [
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'gameState', isMut: false, isSigner: false },
        { name: 'vault', isMut: true, isSigner: false },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [{ name: 'amount', type: 'u64' }],
    },
    {
      name: 'setPaused',
      accounts: [
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'gameState', isMut: true, isSigner: false },
      ],
      args: [{ name: 'paused', type: 'bool' }],
    },
  ],
  accounts: [
    {
      name: 'gameState',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'publicKey' },
          { name: 'currentRound', type: 'u64' },
          { name: 'totalDeposited', type: 'u64' },
          { name: 'isPaused', type: 'bool' },
          { name: 'houseFeePercent', type: 'u8' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
    {
      name: 'betRecord',
      type: {
        kind: 'struct',
        fields: [
          { name: 'user', type: 'publicKey' },
          { name: 'amount', type: 'u64' },
          { name: 'spermId', type: 'u8' },
          { name: 'roundId', type: 'u64' },
          { name: 'claimed', type: 'bool' },
          { name: 'payoutAmount', type: 'u64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: 'InvalidSpermId', msg: 'Invalid sperm ID. Must be 0-9.' },
    { code: 6001, name: 'BetTooSmall', msg: 'Bet amount too small. Minimum is 0.01 SOL.' },
    { code: 6002, name: 'BetTooLarge', msg: 'Bet amount too large. Maximum is 10 SOL.' },
    { code: 6003, name: 'GamePaused', msg: 'Game is paused.' },
    { code: 6004, name: 'Unauthorized', msg: 'Unauthorized action.' },
    { code: 6005, name: 'AlreadyClaimed', msg: 'Winnings already claimed.' },
    { code: 6006, name: 'NotAWinner', msg: 'Not a winner. No payout available.' },
    { code: 6007, name: 'InsufficientFunds', msg: 'Insufficient funds in vault.' },
    { code: 6008, name: 'Overflow', msg: 'Arithmetic overflow.' },
  ],
};
