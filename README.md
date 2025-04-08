# Poopzter

This bot is designed to perform token claim operations on the Optimism network every 61 seconds. It can automatically execute 888 claim operations using real gas values obtained from the blockchain.


## Features

- Automatic claim operations every 61 seconds
- Total of 888 claim operations
- Uses real gas prices from the blockchain (0.000000000005073372 ETH - 0.005073372 Gwei)
- Accurate transaction cost using real gas limit (70,000)
- Automatic nonce management with real-time updates from the network
- Automatic retry in case of errors
- Uses transaction data directly seen in MetaMask (0x4e71d92d)
- Colorful and detailed console logging
- Records logs to files
- Displays statistics
- Transaction tracking and timeout protection


## Transactions Possible with Current Balance

The estimated number of transactions you can make with your current balance is now automatically displayed:

```
[i] Estimated transaction cost: 0.000000355 ETH
[i] Approximately 1000 transactions possible with current balance
```


## Requirements

- Node.js v14 or higher
- ETH balance on Optimism network (0.0001 ETH is usually enough for transaction fees)
- A token claim entitlement



## Installation

1. Clone this repository:

```bash
git clone https://github.com/getcakedieyoungx/poopzter-claim.git
cd poopzter-claim
```

2. Install required packages:

```bash
npm install
```

3. Copy `.env.example` to `.env` and add your private key:

```bash
cp .env.example .env
```

4. Edit the `.env` file to add your private key and other settings:

```
PRIVATE_KEY=your_private_key_here
GAS_PRICE=0.000000000005073372  # Real gas price from blockchain
```

## Usage

To start the bot:

```bash
npm start
```

When the bot starts:
- Status of each claim operation is tracked with colored logs
- Log files are created in the 'logs' folder for each run
- Statistics report is shown every 10 claims
- Automatic retry in case of errors

## Statistics

The bot displays the following statistics:

```
══════════════════════════════════════
📊 CLAIM BOT STATISTICS
══════════════════════════════════════
⏱️  Running Time:       00:28:55
✅ Successful Claims:  10
❌ Failed Claims:      0
🔄 Total Claims:       10
⛽ Total Gas:          0.00000355 ETH
💰 Tokens Earned:      10.0 tokens
══════════════════════════════════════
```

## To Stop

To stop the running bot, press `Ctrl+C` in the console. The bot will display a statistics summary before shutting down properly.

##  Join tg, I will post bots there too.
T.me/getcakedieyoungx


## For donations and buying me a coffee:
EVM: 0xE065339713A8D9BF897d595ED89150da521a7d09

SOLANA: CcBPMkpMbZ4TWE8HeUWyv9CkEVqPLJ5gYe163g5SR4Vf


## Security Warnings

- Never share your private key stored in the `.env` file!
- Only use this bot with networks and contracts that you are sure are secure.
- Avoid using a private key of a wallet containing significant assets.

## License

MIT
