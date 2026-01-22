# Solana Keypairs

This directory contains Solana keypairs for development and deployment.

**⚠️ All `.json` keypair files are gitignored - NEVER commit them!**

## Files

| File | Description | Importance |
|------|-------------|------------|
| `program.json` | Program keypair (controls upgrades) | **CRITICAL** - backup securely! |
| `authority.json` | Game authority wallet | Important |
| `user1-5.json` | Test user wallets | Development only |

## Commands

```bash
# Generate test keypairs (authority + users)
bun run generate-keys

# Fund wallets on devnet
bun run fund-devnet

# Backup program keypair (after first build)
bun run backup-program-key
```

## Security Notes

1. **`program.json`** - This keypair controls the program's upgrade authority
   - Losing it = losing ability to upgrade the program
   - Leaking it = someone else can upgrade/modify your program
   - **Back it up securely** (password manager, encrypted drive, hardware wallet)

2. **For mainnet deployment:**
   - Consider using a hardware wallet (Ledger)
   - Consider using a multisig (Squads Protocol)
   - Keep the keypair in a secure secrets manager

3. **To make program immutable:**
   - Set upgrade authority to `None` after deployment
   - The keypair becomes unnecessary (but keep backup anyway)
