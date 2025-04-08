# OP Claim Bot

Bu bot, Optimism ağında her 61 saniyede bir token claim işlemi gerçekleştirmek için tasarlanmıştır. Blockchain'den alınan gerçek gas değerleriyle otomatik olarak 888 kez claim işlemi yapabilir.

![OP Logo](https://optimism.io/assets/images/red-op.svg)

## Özellikler

- 61 saniyede bir otomatik claim işlemi
- Toplam 888 claim işlemi yapabilme
- Blockchain'den alınan gerçek gas fiyatlarını kullanma (0.000000000005073372 ETH - 0.005073372 Gwei)
- Gerçek gas limitini (70.000) kullanarak doğru işlem maliyeti
- Nonce yönetimi ve otomatik artırma
- Hata durumunda otomatik yeniden deneme
- MetaMask'ta görülen işlem verisini doğrudan kullanma
- Renkli ve detaylı konsolda loglama
- Log dosyalarına kayıt tutma
- İstatistik bilgilerini görüntüleme
- İşlem takibi ve zaman aşımı koruması

## Son Güncelleme: Blockchain'den Alınan Gerçek Değerlerle Güncellendi

Son güncellemede, blockchain'den alınan gerçek değerlere göre düzenlemeler yapıldı:

1. **Gerçek Gas Fiyatı**: 0.000000000005073372 ETH (0.005073372 Gwei) olarak güncellendi
2. **Gerçek Gas Limiti**: 70.000 birime ayarlandı (gerçekleşen işlemde 69.049 kullanılmış)
3. **Doğru Tahmini Maliyet**: İşlem başına yaklaşık 0.000000355 ETH
4. **İşlem Verisi**: MetaMask'tan alınan 0x4e71d92d verisi kullanılıyor

## Blockchain'de Görülen İşlem

Gerçek işlem detaylarını inceleyerek, aşağıdaki değerler tam olarak alındı:

```
Transaction Hash: 0x4b339b58c89e4881a0a971224fd8fe5a5b2bb41b6a55af3a2e40df7b50c40641
Status: Başarılı
Gas Kullanımı: 69,049 / 69,049 (100%)
Gas Fiyatı: 0.005073372 Gwei (0.000000000005073372 ETH)
Toplam İşlem Ücreti: 0.000000355181906942 ETH
Nonce: 40
İşlev: claim() - 0x4e71d92d
```

## Mevcut Bakiyeyle Yapılabilecek İşlemler

Mevcut bakiyenizle yapabileceğiniz tahmini işlem sayısı artık otomatik olarak gösterilir:

```
[i] Tahmini işlem maliyeti: 0.000000355 ETH
[i] Mevcut bakiye ile yaklaşık 1000 işlem yapılabilir
```

## Hatalar ve Çözümleri

### Yetersiz Bakiye Hatası

Eğer aşağıdaki gibi bir hata alırsanız:

```
[✗] ETH bakiyesi yetersiz. İşlem maliyeti: 0.000000355 ETH, Bakiye: 0.0000001 ETH
```

Çözüm:
- Optimism ağında bir miktar ETH (0.0001 ETH yeterlidir) cüzdanınıza gönderin

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
[🔧] Blockchain'den alınan gas fiyatı: 0.000000000005073372 ETH (0.005073372 Gwei)
[🔧] Kullanılan gas fiyatı: 0.000000000005073372 ETH
[🔧] Cüzdan adresi: 0x8d43EB58A51e5fd33A037d866228cA76be3A8d3d
[🔧] RPC URL: https://mainnet.optimism.io
[🔧] Claim kontrat adresi: 0xE2702b85f5bF9870d25035B09FFC24Dbd1021151
[🔧] Token adresi: 0x4a05d55ead18a25838a8fec6f3879f4110ffedbb
[🔧] Claim aralığı: 61 saniye
[🔧] Hedef claim sayısı: 888
[🔧] Gas limiti: 70000
[🔧] İşlem verisi: 0x4e71d92d
[💎] ETH bakiyesi: 0.000380078831047264 ETH
[i] Tahmini işlem maliyeti: 0.000000355 ETH
[i] Mevcut bakiye ile yaklaşık 1000 işlem yapılabilir
[💎] Başlangıç bakiyesi: 4.0 token
[🔧] İlk claim işlemi başlatılıyor...
[🔄] Claim işlemi #1/888 başlatılıyor...
[i] Bu işlem için gas fiyatı: 0.000000000005073372 ETH
[i] Toplam maliyet: 0.000000355 ETH
[💰] İşlem gönderildi: 0x4b339b58c89e4881a0a971224fd8fe5a5b2bb41b6a55af3a2e40df7b50c40641 (Nonce: 40)
[✓] İşlem onaylandı! Blok: 134255541, Gas: 0.000000355 ETH
[💎] Güncel bakiye: 5.0 token
[i] Bir sonraki claim zamanı: 11:00:40
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
GAS_PRICE=0.000000000005073372  # Blockchain'den alınan gerçek gas fiyatı
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
⛽ Toplam Gas:         0.00000355 ETH
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