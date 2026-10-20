# Telegram komutları: Cloudflare Worker kurulumu

Telegram'a `/uzun` ya da `/shorts` yazınca video üretimi başlar. Kod: `telegram-worker.js`.
Bir kez kurulur; telefondan da yapılabilir. Toplam ~10 dakika.

## 1. Görevlere API tetikleyicisi ekle (claude.ai)

Her iki görev için ayrı ayrı (**Düşün Bakalım — elle uzun video** ve **Düşün Bakalım — elle Shorts**):

1. https://claude.ai/code/routines → görevi aç → **Edit**.
2. Bağlayıcılara **Claude Code Remote**'u ekle (görev repoyu bununla açar).
3. **Trigger** satırında **+** → **API** → **Generate token**.
4. Çıkan **Fire URL**'yi ve **token**'ı hemen bir yere not et (token bir daha gösterilmez).

## 2. Worker'ı oluştur (dash.cloudflare.com, ücretsiz hesap)

1. **Workers & Pages → Create → Worker** → adı ör. `dusun-bakalim-bot` → **Deploy**.
2. **Edit code** → içindekileri sil, `telegram-worker.js` dosyasının tamamını yapıştır → **Deploy**.
3. Worker → **Settings → Variables and Secrets** → aşağıdakileri **Secret** olarak ekle:

| Ad | Değer |
|---|---|
| `TELEGRAM_BOT_TOKEN` | BotFather'daki bot token'ı (GitHub secret'ı ile aynı) |
| `ALLOWED_CHAT_ID` | repodaki `config/telegram_chat_id` içindeki sayı |
| `WEBHOOK_SECRET` | kendin uydur: harf ve rakamdan oluşan uzun bir parola (ör. 30 karakter) |
| `LONG_FIRE_URL` / `LONG_FIRE_TOKEN` | "elle uzun video" görevinin Fire URL'i ve token'ı |
| `SHORT_FIRE_URL` / `SHORT_FIRE_TOKEN` | "elle Shorts" görevinin Fire URL'i ve token'ı |

## 3. Telegram'a bağla

Tarayıcıda bir kez aç (adres Worker sayfasında yazar):

```
https://dusun-bakalim-bot.<hesap>.workers.dev/setup?key=<WEBHOOK_SECRET>
```

Çıktıda `"ok": true` görünmeli. Bot menüsünde `/uzun`, `/shorts`, `/yardim` belirir.

## Kullanım

- `/uzun` — ek uzun video (konuyu Claude seçer)
- `/uzun Çanakkale 1915` — konuyu siz verirsiniz
- `/shorts`, `/shorts Lale Devri` — ek Shorts
- Bot "başlatıldı ✅" diye cevap verir; ilerleme aynı sohbetteki canlı durum mesajında görünür.

Güvenlik: Worker sadece `ALLOWED_CHAT_ID` sohbetinden gelen komutları kabul eder, Telegram'dan
gelmeyen istekleri (`WEBHOOK_SECRET` tutmazsa) reddeder. Sınır: saatte en fazla 30 başlatma (görev başına).

Not: webhook kurulduktan sonra `python tools/telegram.py setup` (getUpdates ile sohbet kimliği bulma)
çalışmaz; sohbet kimliği zaten `config/telegram_chat_id` içinde kayıtlı olduğu için gerekmez.
