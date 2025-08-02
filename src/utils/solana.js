const web3 = require('@solana/web3.js');
const bip39 = require('bip39');
const ed25519 = require('ed25519-hd-key');
const { getOrCreateAssociatedTokenAccount, createTransferInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'"; // BIP44 derivation path for Solana

const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'), 'confirmed');

// Create a new wallet
const createWallet = () => {
    const keypair = web3.Keypair.generate();
    return {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: keypair.secretKey,
    };
};


const createWalletWithMnemonics = async () => {
    try {
        // Generate a 12-word mnemonic
        const mnemonic = bip39.generateMnemonic();

        // Convert mnemonic to seed
        const seed = await bip39.mnemonicToSeed(mnemonic);

        // Derive the seed using the BIP44 path for Solana
        const derivedSeed = ed25519.derivePath(SOLANA_DERIVATION_PATH, seed.toString('hex')).key;

        // Create the keypair using the derived seed
        const wallet = web3.Keypair.fromSeed(derivedSeed);

        // Get wallet address in base58 format
        const address = wallet.publicKey.toBase58(); // Correct way to get base58 encoded public key

        return { mnemonic, address };

    } catch (error) {
        console.error("Error creating mnemonics wallet:", error);
    }
};

// Get SOL balance
const checkSolBalance = async (walletAddress) => {
    try {
        // Ensure walletAddress is a PublicKey object
        const wallet = typeof walletAddress === 'string' ? new web3.PublicKey(walletAddress) : walletAddress;

        // Fetch the balance
        const balance = await connection.getBalance(wallet);
        const solBalance = balance / web3.LAMPORTS_PER_SOL;

        return solBalance

    } catch (error) {
        console.error("Error checking sol balance of wallet:", error);
    }

}

const mnemonicToKeypair = async (mnemonic) => {
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const derivedSeed = ed25519.derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
    return web3.Keypair.fromSeed(derivedSeed);
}

// Transfer SOL
const transferSol = async (senderMnemonic, receiver, amount) => {
    try {
        let payer = await mnemonicToKeypair(senderMnemonic);
        receiver = new web3.PublicKey(receiver);

        const blockhashData = await connection.getLatestBlockhash();
        const blockhash = blockhashData.blockhash;

        // Convert amount to BigInt to avoid floating-point errors
        const lamportsToSend = BigInt(Math.floor(amount * web3.LAMPORTS_PER_SOL));

        // Create transfer instruction
        const transferInstruction = web3.SystemProgram.transfer({
            fromPubkey: payer.publicKey,
            toPubkey: receiver,
            lamports: lamportsToSend,
        });

        // Compile the transaction message
        const messageV0 = new web3.TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: blockhash,
            instructions: [transferInstruction],
        }).compileToV0Message();

        // Get estimated transaction fee
        const feeData = await connection.getFeeForMessage(messageV0);
        const fee = BigInt(feeData.value || 5000); // Default to 5000 lamports if fee is null

        console.log(`Estimated Transaction Fee: ${fee} lamports`);

        // Check payer's balance
        const payerBalance = BigInt(await connection.getBalance(payer.publicKey));

        // Get rent-exempt balance (minimum required to keep an account open)
        const minRentExempt = BigInt(await connection.getMinimumBalanceForRentExemption(0));

        console.log(`Current SOL Balance: ${payerBalance / BigInt(web3.LAMPORTS_PER_SOL)}`);
        console.log(`Minimum Rent-Exempt Balance: ${minRentExempt / BigInt(web3.LAMPORTS_PER_SOL)}`);
        console.log(`Transferring: ${lamportsToSend / BigInt(web3.LAMPORTS_PER_SOL)} SOL`);

        // Ensure balance is enough for transfer + fee + rent-exemption
        if (payerBalance < lamportsToSend + fee + minRentExempt) {
            throw new Error("Insufficient balance after considering rent exemption and fees.");
        }

        // Create and sign transaction
        const transaction = new web3.VersionedTransaction(messageV0);
        transaction.sign([payer]);

        // Send transaction
        const txid = await connection.sendTransaction(transaction);
        console.log(`Transaction ID: ${txid}`);

        return { transactionId: txid };
    } catch (error) {
        console.error("Error transferring SOL:", error.message);
        return { error: error.message };
    }
};


const checkTokenBalance = async (walletAddress, tokenMintAddress) => {
    try {
        walletAddress = new web3.PublicKey(walletAddress)
        const mintAddress = new web3.PublicKey(tokenMintAddress);

        const tokenAccounts = await connection.getTokenAccountsByOwner(walletAddress, {
            mint: mintAddress,
        });

        if (tokenAccounts.value.length === 0) {
            return 0
        }
        else {
            for (const { pubkey, account } of tokenAccounts.value) {
                const parsedData = account.data;
                const amount = Buffer.from(parsedData).readBigUInt64LE(64); // Extracts the token balance from the account data
                return Number(amount) / 10 ** 6
            }
        }
    } catch (error) {
        console.error("Error checking TOKEN balance:", error.message);
    }

}

const transferToken = async (senderMnemonic, receiver, amount, tokenMintWalletAddress) => {
    try {
        let payer = await mnemonicToKeypair(senderMnemonic);
        receiver = new web3.PublicKey(receiver);

        // Get the latest blockhash for the transaction
        let { blockhash } = await connection.getLatestBlockhash();

        // USDT mint address on Solana
        const tokenMintAddress = new web3.PublicKey(tokenMintWalletAddress);

        // Get or create the receiver's associated token account
        const receiverTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            tokenMintAddress,
            receiver
        );

        // Get the payer's associated token account
        const payerTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            tokenMintAddress,
            payer.publicKey
        );

        // Create transfer instruction to transfer USDT
        const transferInstruction = createTransferInstruction(
            payerTokenAccount.address,
            receiverTokenAccount.address,
            payer.publicKey,
            amount * 1000000 // Amount of USDT to transfer in smallest unit (1 USDT = 1_000_000)
        );

        // Create the transaction message
        const messageV0 = new web3.TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: blockhash,
            instructions: [transferInstruction],
        }).compileToV0Message();

        // Create a versioned transaction
        const transaction = new web3.VersionedTransaction(messageV0);

        // Sign the transaction with the payer's keypair
        transaction.sign([payer]);

        // Send the transaction to the network
        const txid = await connection.sendTransaction(transaction);

        return { transactionId: txid };
    } catch (error) {
        console.error("Error transferring TOKEN:", error.message);
        return { error: error.message };  // Ensure the function always returns an object
    }
};


const isValidWalletAddress = (address) => {
    try {
        const pubkey = new web3.PublicKey(address);
        return web3.PublicKey.isOnCurve(pubkey);
    } catch (err) {
        return false;
    }
};




module.exports = {
    createWallet,
    createWalletWithMnemonics,
    checkSolBalance,
    transferSol,
    checkTokenBalance,
    transferToken,
    isValidWalletAddress
};
