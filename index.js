const { ethers } = require('ethers');
require('dotenv').config();

// Sabit değişkenler
const CLAIM_CONTRACT_ADDRESS = '0xE2702b85f5bF9870d25035B09FFC24Dbd1021151';
const TOKEN_ADDRESS = '0x4a05d55ead18a25838a8fec6f3879f4110ffedbb';
const CLAIM_INTERVAL = 61000; // 61 saniye
const TOTAL_CLAIMS = 888;

// ABI tanımları
const CLAIM_ABI = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const ERC20_ABI = [
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Ana fonksiyon
async function main() {
  try {
    console.log('OP Claim Botu başlatılıyor...');
    
    // Bağlantı ve cüzdan kurulumu
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Lütfen .env dosyasında PRIVATE_KEY tanımlayın!');
    }
    
    const rpcUrl = 'https://mainnet.optimism.io';
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    console.log(`Cüzdan adresi: ${wallet.address}`);
    
    // Kontrat bağlantıları
    const claimContract = new ethers.Contract(CLAIM_CONTRACT_ADDRESS, CLAIM_ABI, wallet);
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    
    // Başlangıç bakiyesini kontrol et
    const initialBalance = await tokenContract.balanceOf(wallet.address);
    console.log(`Başlangıç bakiyesi: ${ethers.utils.formatEther(initialBalance)} token`);
    
    // Claim işlemini gerçekleştir
    let claimCount = 0;
    
    const performClaim = async () => {
      try {
        if (claimCount >= TOTAL_CLAIMS) {
          console.log(`Toplam ${TOTAL_CLAIMS} claim işlemi tamamlandı. Bot durduruluyor.`);
          process.exit(0);
        }
        
        console.log(`Claim işlemi #${claimCount + 1} başlatılıyor...`);
        
        // Claim işlemini gerçekleştir
        const tx = await claimContract.claim({
          gasLimit: 150000,
          maxFeePerGas: ethers.utils.parseUnits('0.001', 'gwei'),
          maxPriorityFeePerGas: ethers.utils.parseUnits('0.001', 'gwei')
        });
        
        console.log(`İşlem gönderildi: ${tx.hash}`);
        await tx.wait();
        console.log(`İşlem onaylandı!`);
        
        // Güncel bakiyeyi kontrol et
        const currentBalance = await tokenContract.balanceOf(wallet.address);
        console.log(`Güncel bakiye: ${ethers.utils.formatEther(currentBalance)} token`);
        
        claimCount++;
        
        // Bir sonraki claim için zamanlayıcı ayarla
        setTimeout(performClaim, CLAIM_INTERVAL);
      } catch (error) {
        console.error(`Claim işlemi sırasında hata oluştu: ${error.message}`);
        
        // Hata durumunda 2 dakika bekleyip tekrar dene
        console.log('2 dakika sonra tekrar denenecek...');
        setTimeout(performClaim, 120000);
      }
    };
    
    // İlk claim işlemini başlat
    performClaim();
    
  } catch (error) {
    console.error(`Bot başlatılırken hata oluştu: ${error.message}`);
    process.exit(1);
  }
}

// Botu başlat
main();