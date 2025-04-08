# OP Claim Bot

Bu bot, Optimism ağında her 61 saniyede bir token claim işlemi gerçekleştirmek için tasarlanmıştır. Düşük gas ücretleriyle otomatik olarak 888 kez claim işlemi yapabilir.

## Özellikler

- 61 saniyede bir otomatik claim işlemi
- Toplam 888 claim işlemi yapabilme
- Çok düşük gas ücretleriyle işlem yapma
- Hata durumunda otomatik yeniden deneme
- Bakiye takibi

## Gereksinimler

- Node.js v14 veya üzeri
- Optimism ağında ETH bakiyesi (işlem ücretleri için)
- Claim yapılacak bir token hakkı

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

4. `.env` dosyasını düzenleyerek kendi özel anahtarınızı ekleyin:

```
PRIVATE_KEY=senin_private_key_buraya_yazılacak
```

## Kullanım

Botu başlatmak için:

```bash
npm start
```

Bot çalışmaya başladığında, konsolda aşağıdaki bilgileri göreceksiniz:
- Cüzdan adresi
- Başlangıç token bakiyesi
- Her claim işleminin durumu
- İşlem hash'leri
- Güncel token bakiyesi

## Güvenlik Uyarıları

- `.env` dosyasında saklanan özel anahtarınızı asla paylaşmayın!
- Bu botu sadece güvenli olduğundan emin olduğunuz ağlarda ve kontratlarla kullanın.
- Önemli miktarda varlık içeren bir cüzdanın özel anahtarını kullanmaktan kaçının.

## Lisans

MIT