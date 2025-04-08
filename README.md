# OP Claim Bot

Bu bot, Optimism ağında her 61 saniyede bir token claim işlemi gerçekleştirmek için tasarlanmıştır. Düşük gas ücretleriyle otomatik olarak 888 kez claim işlemi yapabilir.

![OP Logo](https://optimism.io/assets/images/red-op.svg)

## Özellikler

- 61 saniyede bir otomatik claim işlemi
- Toplam 888 claim işlemi yapabilme
- Ultra düşük gas ücretleriyle işlem yapma (0.00000025 ETH)
- Otomatik gas fiyatı ayarlama ve düşük bakiye durumunda fiyatı azaltma
- Nonce yönetimi ve otomatik artırma
- Hata durumunda otomatik yeniden deneme
- Renkli ve detaylı konsolda loglama
- Log dosyalarına kayıt tutma
- İstatistik bilgilerini görüntüleme
- İşlem takibi ve zaman aşımı koruması

## Hatalar ve Çözümleri

### Yetersiz Bakiye Hatası

Eğer aşağıdaki gibi bir hata alırsanız:

```
[✗] Claim işlemi sırasında hata oluştu: insufficient funds for intrinsic transaction cost
[✗] ETH bakiyesi yetersiz. Cüzdanınıza biraz ETH eklemelisiniz.
```

Bu, cüzdanınızda işlem ücretleri için yeterli ETH olmadığı anlamına gelir. Çözüm yolları:

1. **Cüzdanınıza ETH ekleyin**: Optimism ağında bir miktar ETH (0.001 ETH bile yeterli olabilir) cüzdanınıza gönderin.

2. **Gas fiyatını düşürün**: `.env` dosyasında GAS_PRICE değerini daha düşük bir değere ayarlayın:

```
GAS_PRICE=0.0000001
```

3. **Alternatif RPC kullanın**: Farklı bir RPC URL'si kullanmak sorunu çözebilir:

```
RPC_URL=https://opt-mainnet.g.alchemy.com/v2/your-api-key
```

### Nonce Hatası

Eğer işlem nonce hatası alırsanız, `.env` dosyasında `INITIAL_NONCE` değerini MetaMask'tan görebileceğiniz mevcut nonce değeri ile ayarlayın.

### "Assignment to constant variable" Hatası

Bu hata kodda sabit bir değişkene yeniden değer atamaya çalışıldığında oluşur. Son güncellemede bu sorun düzeltildi.

## Gereksinimler

- Node.js v14 veya üzeri
- Optimism ağında ETH bakiyesi (işlem ücretleri için, 0.001 ETH genellikle yeterlidir)
- Claim yapılacak bir token hakkı

## Ekran Görüntüsü

```
════════════════════════════════════════════════════════════
      🚀 OP CLAİM BOTU BAŞLATILIYOR 🚀 
════════════════════════════════════════════════════════════

[🔧] Başlangıç nonce değeri: 40
[🔧] Gas fiyatı: 0.00000025 ETH
[🔧] Cüzdan adresi: 0x8d43EB58A51e5fd33A037d866228cA76be3A8d3d
[🔧] RPC URL: https://mainnet.optimism.io
[🔧] Claim kontrat adresi: 0xE2702b85f5bF9870d25035B09FFC24Dbd1021151
[🔧] Token adresi: 0x4a05d55ead18a25838a8fec6f3879f4110ffedbb
[🔧] Claim aralığı: 61 saniye
[🔧] Hedef claim sayısı: 888
[🔧] Gas limiti: 50000
[💎] ETH bakiyesi: 0.000380078831047264 ETH
[💎] Başlangıç bakiyesi: 4.0 token
[🔧] İlk claim işlemi başlatılıyor...
[🔄] Claim işlemi #1/888 başlatılıyor...
[i] Bu işlem için gas fiyatı: 0.00000025 ETH
[💰] İşlem gönderildi: 0xa1b2c3... (Nonce: 40)
[✓] İşlem onaylandı! Blok: 134281024, Gas: 0.0000011 ETH
[💎] Güncel bakiye: 5.0 token
[i] Bir sonraki claim zamanı: 10:28:17
```

## Kurulum

1. Bu repoyu klonlayın:

```bash
git clone https://github.com/getcakedieyoungx/op-claim-bot.git
cd op-claim-bot
```

2. Gerekli paketleri yükleyin:

```bash
npm install
```

3. `.env.example` dosyasını `.env` olarak kopyalayın ve özel anahtarınızı ekleyin:

```bash
cp .env.example .env
```

4. `.env` dosyasını düzenleyerek kendi özel anahtarınızı ve diğer ayarları ekleyin:

```
PRIVATE_KEY=senin_private_key_buraya_yazılacak
INITIAL_NONCE=40  # İsteğe bağlı: MetaMask'tan görülen nonce değeri
GAS_PRICE=0.00000025  # İsteğe bağlı: Gas fiyatını ayarlama
```

## Kullanım

Botu başlatmak için:

```bash
npm start
```

Bot çalışmaya başladığında:
- Her claim işleminin durumu renkli loglarla takip edilir
- 'logs' klasöründe her çalıştırma için log dosyası oluşturulur
- Her 10 claimde bir istatistik raporu gösterilir
- Hata durumlarında otomatik yeniden deneme yapılır
- Düşük bakiye durumunda gas fiyatı otomatik olarak düşürülür

## İstatistikler

Bot, aşağıdaki istatistikleri gösterir:

```
══════════════════════════════════════
📊 CLAIM BOT İSTATİSTİKLERİ
══════════════════════════════════════
⏱️  Çalışma Süresi:     00:28:55
✅ Başarılı Claimler:  10
❌ Başarısız Claimler: 0
🔄 Toplam Claimler:    10
⛽ Toplam Gas:         0.000011 ETH
💰 Kazanılan Token:    10.0 token
══════════════════════════════════════
```

## Durdurmak İçin

Çalışan botu durdurmak için konsolda `Ctrl+C` tuşlarına basın. Bot, istatistik özetini göstererek düzgün bir şekilde kapatılacaktır.

## Güvenlik Uyarıları

- `.env` dosyasında saklanan özel anahtarınızı asla paylaşmayın!
- Bu botu sadece güvenli olduğundan emin olduğunuz ağlarda ve kontratlarla kullanın.
- Önemli miktarda varlık içeren bir cüzdanın özel anahtarını kullanmaktan kaçının.

## Lisans

MIT