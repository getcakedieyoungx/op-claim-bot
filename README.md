# OP Claim Bot

Bu bot, Optimism ağında her 61 saniyede bir token claim işlemi gerçekleştirmek için tasarlanmıştır. Site tarafından önerilen gas ücretleriyle otomatik olarak 888 kez claim işlemi yapabilir.

![OP Logo](https://optimism.io/assets/images/red-op.svg)

## Özellikler

- 61 saniyede bir otomatik claim işlemi
- Toplam 888 claim işlemi yapabilme
- Site tarafından önerilen gas fiyatını kullanma (0.00000063 ETH)
- Standart gas limiti (21.000) ile minimum işlem maliyeti
- Nonce yönetimi ve otomatik artırma
- Hata durumunda otomatik yeniden deneme
- MetaMask'ta görülen işlem verisini doğrudan kullanma
- Renkli ve detaylı konsolda loglama
- Log dosyalarına kayıt tutma
- İstatistik bilgilerini görüntüleme
- İşlem takibi ve zaman aşımı koruması

## Son Güncelleme: Site Önerilerine Göre Ayarlandı

Son güncellemede, sitenin önerdiği değerlere göre düzenlemeler yapıldı:

1. **Site önerisi gas fiyatı**: 0.00000063 ETH olarak ayarlandı
2. **Gas limiti düşürüldü**: 21.000 birime düşürüldü (Ethereum'da standart transfer değeri)
3. **Tahmini maliyet**: İşlem başına yaklaşık 0.00001323 ETH (GasLimit * GasPrice)
4. **İşlem verisi**: MetaMask'tan alınan 0x4e71d92d verisi kullanılıyor

## Site Bilgileri

Claim ekranında görülen değerler:

```
Ağ ücreti: 0 ETH < $0,01
L1 ücreti: 0 ETH < $0,01
L2 ücreti: 0 ETH < $0,01
Hız: 🌐 Site önerisi ~2 sn
Maks. ücret: 0.00000063 ETH < $0,01
Nonce: 40
İşlev: claim (0x4e71d92d)
```

## Hatalar ve Çözümleri

### Yetersiz Bakiye Hatası

Eğer aşağıdaki gibi bir hata alırsanız:

```
[✗] ETH bakiyesi yetersiz. İşlem maliyeti: 0.00001323 ETH, Bakiye: 0.00000008 ETH
```

Tek çözüm cüzdanınıza ETH eklemektir:
- Optimism ağında bir miktar ETH (0.0001 ETH yeterlidir) cüzdanınıza gönderin
- Site önerilerine göre ayarlandığı için gas fiyatını değiştirmiyoruz

### Nonce Hatası

Eğer işlem nonce hatası alırsanız, `.env` dosyasında `INITIAL_NONCE` değerini MetaMask'tan görebileceğiniz mevcut nonce değeri ile ayarlayın.

## Gereksinimler

- Node.js v14 veya üzeri
- Optimism ağında ETH bakiyesi (işlem ücretleri için, 0.0001 ETH genellikle yeterlidir)
- Claim yapılacak bir token hakkı

## Ekran Görüntüsü

```
════════════════════════════════════════════════════════════
      🚀 OP CLAİM BOTU BAŞLATILIYOR 🚀 
════════════════════════════════════════════════════════════

[🔧] Başlangıç nonce değeri: 40
[🔧] Site önerisi gas fiyatı: 0.00000063 ETH
[🔧] Kullanılan gas fiyatı: 0.00000063 ETH
[🔧] Cüzdan adresi: 0x8d43EB58A51e5fd33A037d866228cA76be3A8d3d
[🔧] RPC URL: https://mainnet.optimism.io
[🔧] Claim kontrat adresi: 0xE2702b85f5bF9870d25035B09FFC24Dbd1021151
[🔧] Token adresi: 0x4a05d55ead18a25838a8fec6f3879f4110ffedbb
[🔧] Claim aralığı: 61 saniye
[🔧] Hedef claim sayısı: 888
[🔧] Gas limiti: 21000
[🔧] İşlem verisi: 0x4e71d92d
[💎] ETH bakiyesi: 0.000380078831047264 ETH
[i] Tahmini işlem maliyeti: 0.00001323 ETH
[💎] Başlangıç bakiyesi: 4.0 token
[🔧] İlk claim işlemi başlatılıyor...
[🔄] Claim işlemi #1/888 başlatılıyor...
[i] Bu işlem için gas fiyatı: 0.00000063 ETH
[i] Toplam maliyet: 0.00001323 ETH
[💰] İşlem gönderildi: 0xa1b2c3... (Nonce: 40)
[✓] İşlem onaylandı! Blok: 134281024, Gas: 0.00001323 ETH
[💎] Güncel bakiye: 5.0 token
[i] Bir sonraki claim zamanı: 10:56:42
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
GAS_PRICE=0.00000063  # Site önerisi gas fiyatı
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
⛽ Toplam Gas:         0.0001323 ETH
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