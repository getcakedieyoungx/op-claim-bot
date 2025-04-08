const { ethers } = require('ethers');
require('dotenv').config();

// Sabit değişkenler
const CLAIM_CONTRACT_ADDRESS = '0xE2702b85f5bF9870d25035B09FFC24Dbd1021151';
const TOKEN_ADDRESS = '0x4a05d55ead18a25838a8fec6f3879f4110ffedbb';
const CLAIM_INTERVAL = 61000; // 61 saniye
const TOTAL_CLAIMS = 888;
const TRANSACTION_TIMEOUT = 60000; // 60 saniye işlem bekleme süresi
const MAX_RETRIES = 3; // İşlem başına maksimum yeniden deneme sayısı

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

// İşlem kontrol fonksiyonu - belirli bir süre sonra işlem tamamlanmazsa zaman aşımına uğrar
async function waitForTransaction(provider, txHash, timeout = TRANSACTION_TIMEOUT) {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const checkTx = async () => {
      try {
        const receipt = await provider.getTransactionReceipt(txHash);
        
        if (receipt) {
          if (receipt.status === 1) {
            return resolve(receipt);
          } else {
            return reject(new Error(`İşlem başarısız oldu: ${txHash}`));
          }
        }
        
        // Zaman aşımı kontrolü
        if (Date.now() - startTime > timeout) {
          return reject(new Error(`İşlem zaman aşımına uğradı: ${txHash}`));
        }
        
        // Yeniden kontrol et
        setTimeout(checkTx, 2000);
      } catch (error) {
        return reject(error);
      }
    };
    
    checkTx();
  });
}

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
    
    const performClaim = async (retryCount = 0) => {
      try {
        if (claimCount >= TOTAL_CLAIMS) {
          console.log(`Toplam ${TOTAL_CLAIMS} claim işlemi tamamlandı. Bot durduruluyor.`);
          process.exit(0);
        }
        
        console.log(`Claim işlemi #${claimCount + 1} başlatılıyor...`);
        
        // Gas fiyatlarını kontrol et
        const feeData = await provider.getFeeData();
        
        // Claim işlemini gerçekleştir
        const tx = await claimContract.claim({
          gasLimit: 150000,
          maxFeePerGas: feeData.maxFeePerGas || ethers.utils.parseUnits('0.001', 'gwei'),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || ethers.utils.parseUnits('0.001', 'gwei')
        });
        
        console.log(`İşlem gönderildi: ${tx.hash}`);
        
        // İşlemin tamamlanmasını bekle (zaman aşımı ile)
        const receipt = await waitForTransaction(provider, tx.hash);
        console.log(`İşlem onaylandı! Blok: ${receipt.blockNumber}`);
        
        // 3 saniye bekle
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Güncel bakiyeyi kontrol et
        const currentBalance = await tokenContract.balanceOf(wallet.address);
        console.log(`Güncel bakiye: ${ethers.utils.formatEther(currentBalance)} token`);
        
        claimCount++;
        
        // Bir sonraki claim için zamanlayıcı ayarla
        setTimeout(performClaim, CLAIM_INTERVAL);
      } catch (error) {
        console.error(`Claim işlemi sırasında hata oluştu: ${error.message}`);
        
        // Belirli bir sayıya kadar yeniden dene
        if (retryCount < MAX_RETRIES) {
          console.log(`Yeniden deneniyor (${retryCount + 1}/${MAX_RETRIES})...`);
          setTimeout(() => performClaim(retryCount + 1), 10000);  // 10 saniye sonra tekrar dene
        } else {
          console.log('Maksimum yeniden deneme sayısına ulaşıldı. Bir sonraki claim işlemine geçiliyor...');
          claimCount++;  // Başarısız olsa bile sayacı artır
          setTimeout(performClaim, CLAIM_INTERVAL);
        }
      }
    };
    
    // İlk claim işlemini başlat
    performClaim();
    
  } catch (error) {
    console.error(`Bot başlatılırken hata oluştu: ${error.message}`);
    process.exit(1);
  }
}

// Hata yönetimi
process.on('uncaughtException', (error) => {
  console.error(`Beklenmeyen hata: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('İşlenmeyen Promise reddi:', reason);
});

// Botu başlat
main();