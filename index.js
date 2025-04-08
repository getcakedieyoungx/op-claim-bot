const { ethers } = require('ethers');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Sabit değişkenler
const CLAIM_CONTRACT_ADDRESS = '0xE2702b85f5bF9870d25035B09FFC24Dbd1021151';
const TOKEN_ADDRESS = '0x4a05d55ead18a25838a8fec6f3879f4110ffedbb';
const CLAIM_INTERVAL = 61000; // 61 saniye
const TOTAL_CLAIMS = 888;
const TRANSACTION_TIMEOUT = 60000; // 60 saniye işlem bekleme süresi
const MAX_RETRIES = 3; // İşlem başına maksimum yeniden deneme sayısı
const GAS_LIMIT = 70000; // Daha düşük gas limiti
const GAS_PRICE = ethers.utils.parseUnits('0.00000063', 'ether'); // Site tarafından önerilen gas fiyatı

// Log dizini oluştur
const LOG_DIR = path.join(__dirname, 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

// Log dosyası adı
const LOG_FILE = path.join(LOG_DIR, `claim_log_${new Date().toISOString().replace(/:/g, '-')}.log`);

// Loglama fonksiyonu
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  let consoleMessage;
  let fileMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
  
  switch(type) {
    case 'success':
      consoleMessage = chalk.green(`[✓] ${message}`);
      break;
    case 'error':
      consoleMessage = chalk.red(`[✗] ${message}`);
      break;
    case 'warning':
      consoleMessage = chalk.yellow(`[!] ${message}`);
      break;
    case 'info':
      consoleMessage = chalk.blue(`[i] ${message}`);
      break;
    case 'claim':
      consoleMessage = chalk.magenta(`[🔄] ${message}`);
      break;
    case 'transaction':
      consoleMessage = chalk.cyan(`[💰] ${message}`);
      break;
    case 'balance':
      consoleMessage = chalk.yellowBright(`[💎] ${message}`);
      break;
    case 'system':
      consoleMessage = chalk.gray(`[🔧] ${message}`);
      break;
    default:
      consoleMessage = `[${type.toUpperCase()}] ${message}`;
  }
  
  console.log(consoleMessage);
  fs.appendFileSync(LOG_FILE, fileMessage + '\n');
}

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

// İstatistik bilgileri
const stats = {
  startTime: null,
  successfulClaims: 0,
  failedClaims: 0,
  totalGasUsed: ethers.BigNumber.from(0),
  startBalance: ethers.BigNumber.from(0),
  currentBalance: ethers.BigNumber.from(0)
};

// İstatistik bilgilerini göster
function showStats() {
  const runTime = Math.floor((Date.now() - stats.startTime) / 1000);
  const hours = Math.floor(runTime / 3600);
  const minutes = Math.floor((runTime % 3600) / 60);
  const seconds = runTime % 60;
  const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const earned = stats.currentBalance.sub(stats.startBalance);
  
  console.log('\n' + chalk.yellow('═'.repeat(50)));
  console.log(chalk.yellowBright('📊 CLAIM BOT İSTATİSTİKLERİ'));
  console.log(chalk.yellow('═'.repeat(50)));
  console.log(chalk.cyan('⏱️  Çalışma Süresi:     ') + chalk.white(timeString));
  console.log(chalk.green('✅ Başarılı Claimler:  ') + chalk.white(stats.successfulClaims));
  console.log(chalk.red('❌ Başarısız Claimler: ') + chalk.white(stats.failedClaims));
  console.log(chalk.magenta('🔄 Toplam Claimler:    ') + chalk.white(stats.successfulClaims + stats.failedClaims));
  console.log(chalk.blue('⛽ Toplam Gas:         ') + chalk.white(ethers.utils.formatEther(stats.totalGasUsed) + ' ETH'));
  console.log(chalk.green('💰 Kazanılan Token:    ') + chalk.white(ethers.utils.formatEther(earned) + ' token'));
  console.log(chalk.yellow('═'.repeat(50)) + '\n');
}

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
        
        // 5 saniyede bir durum güncellemesi
        if ((Date.now() - startTime) % 5000 < 1000) {
          log(`${txHash} işlemi bekleniyor... (${Math.floor((Date.now() - startTime) / 1000)}s)`, 'system');
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
    console.log('\n' + chalk.cyan('═'.repeat(60)));
    console.log(chalk.cyan('      🚀 OP CLAİM BOTU BAŞLATILIYOR 🚀 '));
    console.log(chalk.cyan('═'.repeat(60)) + '\n');
    
    stats.startTime = Date.now();
    
    // Bağlantı ve cüzdan kurulumu
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      log('Lütfen .env dosyasında PRIVATE_KEY tanımlayın!', 'error');
      process.exit(1);
    }
    
    // Nonce değeri çevreden alınabiliyor mu diye kontrol et
    let initialNonce = process.env.INITIAL_NONCE;
    if (initialNonce) {
      initialNonce = parseInt(initialNonce, 10);
      log(`Başlangıç nonce değeri: ${initialNonce}`, 'system');
    }
    
    const rpcUrl = 'https://mainnet.optimism.io';
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    log(`Cüzdan adresi: ${wallet.address}`, 'system');
    log(`RPC URL: ${rpcUrl}`, 'system');
    log(`Claim kontrat adresi: ${CLAIM_CONTRACT_ADDRESS}`, 'system');
    log(`Token adresi: ${TOKEN_ADDRESS}`, 'system');
    log(`Claim aralığı: ${CLAIM_INTERVAL / 1000} saniye`, 'system');
    log(`Hedef claim sayısı: ${TOTAL_CLAIMS}`, 'system');
    log(`Gas limiti: ${GAS_LIMIT}`, 'system');
    log(`Gas fiyatı: ${ethers.utils.formatEther(GAS_PRICE)} ETH`, 'system');
    
    // Cüzdan bakiyesi kontrolü
    const ethBalance = await provider.getBalance(wallet.address);
    log(`ETH bakiyesi: ${ethers.utils.formatEther(ethBalance)} ETH`, 'balance');
    
    if (ethBalance.lt(GAS_PRICE.mul(GAS_LIMIT).mul(10))) {
      log('Uyarı: Cüzdanda çok az ETH var. En az 10 işlem için yeterli bakiye bulundurun.', 'warning');
    }
    
    // Nonce değerini al
    let currentNonce = initialNonce;
    if (!currentNonce) {
      currentNonce = await provider.getTransactionCount(wallet.address);
      log(`Mevcut nonce değeri: ${currentNonce}`, 'system');
    }
    
    // Kontrat bağlantıları
    const claimContract = new ethers.Contract(CLAIM_CONTRACT_ADDRESS, CLAIM_ABI, wallet);
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    
    // Başlangıç bakiyesini kontrol et
    stats.startBalance = await tokenContract.balanceOf(wallet.address);
    stats.currentBalance = stats.startBalance;
    log(`Başlangıç bakiyesi: ${ethers.utils.formatEther(stats.startBalance)} token`, 'balance');
    
    // Claim işlemini gerçekleştir
    let claimCount = 0;
    
    const performClaim = async (retryCount = 0) => {
      try {
        if (claimCount >= TOTAL_CLAIMS) {
          log(`Toplam ${TOTAL_CLAIMS} claim işlemi hedefine ulaşıldı. Bot durduruluyor.`, 'success');
          showStats();
          process.exit(0);
        }
        
        log(`Claim işlemi #${claimCount + 1}/${TOTAL_CLAIMS} başlatılıyor...`, 'claim');
        
        // Her 10 claimde bir istatistikleri göster
        if (claimCount > 0 && claimCount % 10 === 0) {
          showStats();
        }
        
        // Claim işlemini gerçekleştir
        const tx = await claimContract.claim({
          gasLimit: GAS_LIMIT,
          gasPrice: GAS_PRICE,
          nonce: currentNonce + claimCount
        });
        
        log(`İşlem gönderildi: ${tx.hash} (Nonce: ${currentNonce + claimCount})`, 'transaction');
        
        // İşlemin tamamlanmasını bekle (zaman aşımı ile)
        const receipt = await waitForTransaction(provider, tx.hash);
        
        // Gas kullanımını topla
        const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
        stats.totalGasUsed = stats.totalGasUsed.add(gasUsed);
        
        log(`İşlem onaylandı! Blok: ${receipt.blockNumber}, Gas: ${ethers.utils.formatEther(gasUsed)} ETH`, 'success');
        stats.successfulClaims++;
        
        // 3 saniye bekle
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Güncel bakiyeyi kontrol et
        stats.currentBalance = await tokenContract.balanceOf(wallet.address);
        log(`Güncel bakiye: ${ethers.utils.formatEther(stats.currentBalance)} token`, 'balance');
        
        claimCount++;
        
        // Bir sonraki claim için zamanlayıcı ayarla
        const nextTime = new Date(Date.now() + CLAIM_INTERVAL);
        log(`Bir sonraki claim zamanı: ${nextTime.toLocaleTimeString()}`, 'info');
        setTimeout(performClaim, CLAIM_INTERVAL);
      } catch (error) {
        log(`Claim işlemi sırasında hata oluştu: ${error.message}`, 'error');
        stats.failedClaims++;
        
        // Hata mesajını daha detaylı göster
        if (error.code === 'INSUFFICIENT_FUNDS') {
          log('ETH bakiyesi yetersiz. Cüzdanınıza biraz ETH eklemelisiniz.', 'error');
        }
        
        // Belirli bir sayıya kadar yeniden dene
        if (retryCount < MAX_RETRIES) {
          log(`Yeniden deneniyor (${retryCount + 1}/${MAX_RETRIES})...`, 'warning');
          
          // Yeniden denemede gas fiyatını biraz daha düşür
          GAS_PRICE = GAS_PRICE.mul(9).div(10); // %10 daha düşük
          log(`Gas fiyatı düşürüldü: ${ethers.utils.formatEther(GAS_PRICE)} ETH`, 'system');
          
          setTimeout(() => performClaim(retryCount + 1), 10000);  // 10 saniye sonra tekrar dene
        } else {
          log('Maksimum yeniden deneme sayısına ulaşıldı. Bir sonraki claim işlemine geçiliyor...', 'warning');
          claimCount++;  // Başarısız olsa bile sayacı artır
          setTimeout(performClaim, CLAIM_INTERVAL);
        }
      }
    };
    
    // İlk claim işlemini başlat
    log('İlk claim işlemi başlatılıyor...', 'system');
    performClaim();
    
  } catch (error) {
    log(`Bot başlatılırken hata oluştu: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Hata yönetimi
process.on('uncaughtException', (error) => {
  log(`Beklenmeyen hata: ${error.message}`, 'error');
  showStats();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('İşlenmeyen Promise reddi: ' + reason, 'error');
});

// Kapatma işlemi
process.on('SIGINT', () => {
  log('Bot kullanıcı tarafından durduruldu.', 'system');
  showStats();
  process.exit(0);
});

// Botu başlat
main();