import web3, { LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

// Connect to the Sonic Devnet using the custom URL
const connection = new web3.Connection('https://devnet.sonic.game', 'confirmed');


const TO_ADDRESS = "HvfTyqSVwQCEPSa7nKhetS1auErU3crtKeCfg8rKG72T";

// Decode the secret key from base58


// Convert the TO_ADDRESS string into a PublicKey object
const toPublicKey = new web3.PublicKey(TO_ADDRESS);

// Function to create and send a transaction
async function sendTransaction(fromWallet, toWallet, lamports) {
  try {
    console.log('From PublicKey:', fromWallet.publicKey.toString());
    console.log('To PublicKey:', toWallet.toString());

    let transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: fromWallet.publicKey,
        toPubkey: toWallet,
        lamports: lamports,
      })
    );

    let signature = await web3.sendAndConfirmTransaction(
      connection,
      transaction,
      [fromWallet]
    );
    console.log('SIGNATURE', signature);
  } catch (error) {
    console.error('Transaction Error:', error);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestAirdropIfNeeded(wallet, requiredBalance) {
  const currentBalance = await connection.getBalance(wallet.publicKey);
  console.log(`Current Balance: ${currentBalance} lamports (${currentBalance / web3.LAMPORTS_PER_SOL} SOL)`);

  if (currentBalance < requiredBalance) {
    console.log("Insufficient balance, requesting airdrop...");
    const airdropSignature = await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);
    console.log("Airdrop completed");
  }
}



async function main() {
  const requiredBalance = 100 * 0.005 * web3.LAMPORTS_PER_SOL;

  const addressList = [
    "3zLVSrgDkegbQH3RDb6AmZf28tHG3GrUPK2s7EAz63b1CzgAP8KGCnwTpEt9PptJXJvqQs1hhUSGBmGN1XTfRSCK",
    "3brvWBdEKBxjUPLzhunCteD7zjjdTaonJt1qNE1Axg2AZZLVpcy6bxT2aoCPz9e8um2Bux2Bw2sY1fen57oTkWAh"
  ]
  for(let a = 0 ; a< addressList.length; a++){
    console.log(`Starting ${a+1} Account...`);
    const secretKey = await  bs58.decode(addressList[a]);
    const fromWallet = await  web3.Keypair.fromSecretKey(secretKey);
    // Request airdrop if needed
    // await requestAirdropIfNeeded(fromWallet, requiredBalance);
    console.log('Account ${a +1} ,Starting 100 transactions...'); 
    for (let i = 0; i < 100; i++) {
      try {
        await sendTransaction(fromWallet, toPublicKey, 4000000); // Sending 0.004 SOL each time
        console.log(` Account ${a +1} , Transaction ${i + 1} completed\n`); 
      } catch (error) {
        console.error(`Error in  Account ${a +1} ,transaction ${i + 1}:`, error);
        return
      }
    }

    console.log(`Account ${a+1} completed`);
  
  } 
 
  console.log('All transactions completed');
}

main().catch(err => {
  console.error(err);
});
