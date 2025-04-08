# OP Claim Bot

Bu bot, Optimism ağında her 61 saniyede bir token claim işlemi gerçekleştirmek için tasarlanmıştır. Ultra düşük gas ücretleriyle otomatik olarak 888 kez claim işlemi yapabilir.

![OP Logo](https://optimism.io/assets/images/red-op.svg)

## Özellikler

- 61 saniyede bir otomatik claim işlemi
- Toplam 888 claim işlemi yapabilme
- Ultra düşük gas ücretleriyle işlem yapma (0.000000005 ETH)
- Akıllı gas fiyatı ayarlama - bakiyenize göre otomatik hesaplama
- Standart gas limiti (21.000) ile minimum işlem maliyeti
- Nonce yönetimi ve otomatik artırma
- Hata durumunda otomatik yeniden deneme
- MetaMask'ta görülen işlem verisini doğrudan kullanma
- Renkli ve detaylı konsolda loglama
- Log dosyalarına kayıt tutma
- İstatistik bilgilerini görüntüleme
- İşlem takibi ve zaman aşımı koruması

## Son Güncelleme: Çok Düşük Bakiye İçin Çözüm

Son güncellemede, çok düşük bakiyeli hesaplar için şu iyileştirmeler yapıldı:

1. **Gas limiti düşürüldü**: 21.000 birime düşürüldü (Ethereum'da standart transfer değeri)
2. **Gas fiyatı ultra düşük seviyeye indirildi**: 0.000000005 ETH (5 gwei)
3. **Akıllı gas fiyatı ayarlama**: Bakiyenize göre otomatik gas fiyatı hesaplanması
4. **Daha hassas işlem maliyeti hesaplaması**: Gerçekçi maliyet hesaplaması ve görüntüleme

Bu değişikliklerle, çok düşük bakiyeye sahip cüzdanlar bile işlem yapabilir. Örneğin:
- 0.0001 ETH bakiye ile 4-5 işlem gerçekleştirilebilir
- Bot bakiyenizi kontrol eder ve ona göre en düşük gas fiyatını otomatik olarak ayarlar
- İşlemler her zaman cüzdan bakiyesinin %90'ından az maliyette gerçekleştirilir

## Hatalar ve Çözümleri

### Yetersiz Bakiye Hatası

Eğer aşağıdaki gibi bir hata alırsanız:

```
[✗] ETH bakiyesi yetersiz. İşlem maliyeti: 0.0000001 ETH, Bakiye: 0.00000008 ETH
```

Bot şimdi otomatik olarak bakiyeye göre gas fiyatını ayarlayacak:

```
[!] Gas fiyatını bakiyeye göre ayarlıyorum: 0.000000003 ETH
```

Yine de bakiye çok düşükse, birkaç çözüm:

1. **Cüzdanınıza ETH ekleyin**: Optimism ağında çok az miktarda ETH (0.0001 ETH bile yeterli) cüzdanınıza gönderin
2. **Daha düşük gas fiyatı kullanın**: `.env` dosyasında GAS_PRICE değerini daha da düşürün:

```
GAS_PRICE=0.000000001
```

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
[🔧] Gas fiyatı: 0.000000005 ETH
[🔧] Cüzdan adresi: 0x8d43EB58A51e5fd33A037d866228cA76be3A8d3d
[🔧] RPC URL: https://mainnet.optimism.io
[🔧] Claim kontrat adresi: 0xE2702b85f5bF9870d25035B09FFC24Dbd1021151
[🔧] Token adresi: 0x4a05d55ead18a25838a8fec6f3879f4110ffedbb
[🔧] Claim aralığı: 61 saniye
[🔧] Hedef claim sayısı: 888
[🔧] Gas limiti: 21000
[🔧] İşlem verisi: 0x4e71d92d
[💎] ETH bakiyesi: 0.000380078831047264 ETH
[i] Tahmini işlem maliyeti: 0.000000105 ETH
[💎] Başlangıç bakiyesi: 4.0 token
[🔧] İlk claim işlemi başlatılıyor...
[🔄] Claim işlemi #1/888 başlatılıyor...
[i] Bu işlem için gas fiyatı: 0.000000005 ETH
[i] Toplam maliyet: 0.000000105 ETH
[💰] İşlem gönderildi: 0xa1b2c3... (Nonce: 40)
[✓] İşlem onaylandı! Blok: 134281024, Gas: 0.000000095 ETH
[💎] Güncel bakiye: 5.0 token
[i] Bir sonraki claim zamanı: 10:51:23
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
GAS_PRICE=0.000000005  # İsteğe bağlı: Gas fiyatını ayarlama
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
⛽ Toplam Gas:         0.00000095 ETH
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