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
const GAS_LIMIT = 21000; // Standart işlem gas limiti - daha da düşük
const CLAIM_FUNCTION_DATA = '0x4e71d92d'; // MetaMask'tan alınan gerçek işlem verisi

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

// ABI tanımları - İsteğe bağlı, doğrudan işlem verisi kullanılıyor
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

// Raw Transaction ile claim işlemi gerçekleştir
async function sendClaimTransaction(wallet, provider, nonce, gasPrice) {
  try {
    // Raw transaction ile işlem gönderme
    const tx = {
      to: CLAIM_CONTRACT_ADDRESS,
      data: CLAIM_FUNCTION_DATA,
      nonce: nonce,
      gasLimit: GAS_LIMIT,
      gasPrice: gasPrice,
      chainId: 10 // Optimism chain ID
    };
    
    const signedTx = await wallet.signTransaction(tx);
    const txResponse = await provider.sendTransaction(signedTx);
    return txResponse;
  } catch (error) {
    throw error;
  }
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
    
    // Özel RPC ve gas fiyatı ayarları
    let rpcUrl = process.env.RPC_URL || 'https://mainnet.optimism.io';
    let gasPrice = ethers.utils.parseUnits(process.env.GAS_PRICE || '0.000000005', 'ether'); // Ultra düşük gas fiyatı
    
    log(`Gas fiyatı: ${ethers.utils.formatEther(gasPrice)} ETH`, 'system');
    
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    log(`Cüzdan adresi: ${wallet.address}`, 'system');
    log(`RPC URL: ${rpcUrl}`, 'system');
    log(`Claim kontrat adresi: ${CLAIM_CONTRACT_ADDRESS}`, 'system');
    log(`Token adresi: ${TOKEN_ADDRESS}`, 'system');
    log(`Claim aralığı: ${CLAIM_INTERVAL / 1000} saniye`, 'system');
    log(`Hedef claim sayısı: ${TOTAL_CLAIMS}`, 'system');
    log(`Gas limiti: ${GAS_LIMIT}`, 'system');
    log(`İşlem verisi: ${CLAIM_FUNCTION_DATA}`, 'system');
    
    // Cüzdan bakiyesi kontrolü
    const ethBalance = await provider.getBalance(wallet.address);
    log(`ETH bakiyesi: ${ethers.utils.formatEther(ethBalance)} ETH`, 'balance');
    
    // İşlem maliyeti
    const txCost = gasPrice.mul(GAS_LIMIT);
    log(`Tahmini işlem maliyeti: ${ethers.utils.formatEther(txCost)} ETH`, 'info');
    
    // Minimum gerekli ETH miktarı - 1 işlem için yeterli olsun
    const minimumEth = txCost;
    
    if (ethBalance.lt(minimumEth)) {
      log(`Uyarı: Cüzdanda çok az ETH var. İşlem maliyeti: ${ethers.utils.formatEther(minimumEth)} ETH, Bakiye: ${ethers.utils.formatEther(ethBalance)} ETH`, 'warning');
      
      // Gas fiyatını bakiyeye göre ayarla - mümkün olduğunca düşük
      const maxAffordableGasPrice = ethBalance.div(GAS_LIMIT);
      
      if (maxAffordableGasPrice.gt(ethers.utils.parseUnits('0.000000001', 'ether'))) {
        gasPrice = maxAffordableGasPrice.mul(9).div(10); // Bakiyenin %90'ını kullan
        log(`Gas fiyatı bakiyeye göre ayarlandı: ${ethers.utils.formatEther(gasPrice)} ETH`, 'system');
        log(`Yeni tahmini işlem maliyeti: ${ethers.utils.formatEther(gasPrice.mul(GAS_LIMIT))} ETH`, 'info');
      } else {
        log('Cüzdanda çok az ETH var, işlem yapılamayabilir.', 'error');
      }
    }
    
    // Nonce değerini al
    let currentNonce = initialNonce;
    if (!currentNonce) {
      currentNonce = await provider.getTransactionCount(wallet.address);
      log(`Mevcut nonce değeri: ${currentNonce}`, 'system');
    }
    
    // Token kontratı tanımla (bakiye kontrolü için)
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    
    // Başlangıç bakiyesini kontrol et
    stats.startBalance = await tokenContract.balanceOf(wallet.address);
    stats.currentBalance = stats.startBalance;
    log(`Başlangıç bakiyesi: ${ethers.utils.formatEther(stats.startBalance)} token`, 'balance');
    
    // Claim işlemini gerçekleştir
    let claimCount = 0;
    
    const performClaim = async (retryCount = 0, currentGasPrice = gasPrice) => {
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
        
        // İşlem maliyeti hesapla ve bakiye kontrolü yap
        const txCost = currentGasPrice.mul(GAS_LIMIT);
        const currentEthBalance = await provider.getBalance(wallet.address);
        
        if (currentEthBalance.lt(txCost)) {
          log(`ETH bakiyesi yetersiz. İşlem maliyeti: ${ethers.utils.formatEther(txCost)} ETH, Bakiye: ${ethers.utils.formatEther(currentEthBalance)} ETH`, 'error');
          
          // Bakiyeye göre gas fiyatını ayarla
          const maxAffordableGasPrice = currentEthBalance.div(GAS_LIMIT);
          
          if (maxAffordableGasPrice.gt(ethers.utils.parseUnits('0.0000000001', 'ether'))) {
            const lowerGasPrice = maxAffordableGasPrice.mul(9).div(10); // Bakiyenin %90'ını kullan
            log(`Gas fiyatını bakiyeye göre ayarlıyorum: ${ethers.utils.formatEther(lowerGasPrice)} ETH`, 'warning');
            
            setTimeout(() => performClaim(retryCount + 1, lowerGasPrice), 5000);
            return;
          } else {
            log('Gas fiyatı çok düşük. Daha fazla düşürülemez.', 'error');
            log('Cüzdanınıza biraz daha ETH eklemelisiniz.', 'warning');
            
            if (retryCount < MAX_RETRIES) {
              log(`Yeniden deneniyor (${retryCount + 1}/${MAX_RETRIES})...`, 'warning');
              setTimeout(() => performClaim(retryCount + 1, currentGasPrice), 10000);
            } else {
              log('Maksimum yeniden deneme sayısına ulaşıldı. Bir sonraki claim işlemine geçiliyor...', 'warning');
              claimCount++;
              setTimeout(() => performClaim(0, gasPrice), CLAIM_INTERVAL);
            }
            return;
          }
        }
        
        // Gas fiyatını loglama
        log(`Bu işlem için gas fiyatı: ${ethers.utils.formatEther(currentGasPrice)} ETH`, 'info');
        log(`Toplam maliyet: ${ethers.utils.formatEther(txCost)} ETH`, 'info');
        
        // Raw transaction kullanarak claim işlemini gerçekleştir
        const tx = await sendClaimTransaction(wallet, provider, currentNonce + claimCount, currentGasPrice);
        
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
        setTimeout(() => performClaim(0, gasPrice), CLAIM_INTERVAL); // Her seferinde ilk gas fiyatıyla başla
      } catch (error) {
        log(`Claim işlemi sırasında hata oluştu: ${error.message}`, 'error');
        stats.failedClaims++;
        
        // Gas fiyatını bakiyeye göre ayarla ve tekrar dene
        if (error.code === 'INSUFFICIENT_FUNDS') {
          log('ETH bakiyesi yetersiz. Cüzdanınıza biraz ETH eklemelisiniz veya gas fiyatını düşürün.', 'error');
          
          // Mevcut bakiyeyi al
          const currentBalance = await provider.getBalance(wallet.address);
          
          // Bakiyeye göre gas fiyatını hesapla - bakiyenin %80'ini kullan
          if (currentBalance.gt(0)) {
            const affordableGasPrice = currentBalance.mul(8).div(10).div(GAS_LIMIT);
            
            if (affordableGasPrice.gt(ethers.utils.parseUnits('0.0000000001', 'ether'))) {
              log(`Gas fiyatını bakiyeye göre ayarlıyorum: ${ethers.utils.formatEther(affordableGasPrice)} ETH`, 'warning');
              
              if (retryCount < MAX_RETRIES) {
                log(`Yeniden deneniyor (${retryCount + 1}/${MAX_RETRIES})...`, 'warning');
                setTimeout(() => performClaim(retryCount + 1, affordableGasPrice), 10000);
                return;
              }
            }
          }
          
          // Eğer bu noktaya geldiysek, bakiye çok düşük veya max deneme sayısına ulaşıldı
          log('Bir sonraki claim işlemine geçiliyor...', 'warning');
          claimCount++;
          setTimeout(() => performClaim(0, gasPrice), CLAIM_INTERVAL);
        } else {
          // Diğer hatalar için
          if (retryCount < MAX_RETRIES) {
            log(`Yeniden deneniyor (${retryCount + 1}/${MAX_RETRIES})...`, 'warning');
            setTimeout(() => performClaim(retryCount + 1, currentGasPrice), 10000);
          } else {
            log('Maksimum yeniden deneme sayısına ulaşıldı. Bir sonraki claim işlemine geçiliyor...', 'warning');
            claimCount++;
            setTimeout(() => performClaim(0, gasPrice), CLAIM_INTERVAL);
          }
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