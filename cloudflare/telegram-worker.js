// Düşün Bakalım — Telegram komut dinleyicisi (Cloudflare Worker, ücretsiz plan yeter).
// Bot sürekli açık bir program değil; bu Worker Telegram'ın webhook'u olur ve komut gelince
// claude.ai'deki "Düşün Bakalım günlük üretim" görevini API ile "EK VİDEO" isteğiyle başlatır
// (görev, payload'da "EK VİDEO" görünce günlük plan yerine tek bir ek video üretir).
//
// Komutlar (sadece ALLOWED_CHAT_ID'den kabul edilir):
//   /uzun [konu]    ek uzun video üret ve yayınla (konu isteğe bağlı)
//   /shorts [konu]  ek Shorts üret ve yayınla
//   /yardim         komut listesi
//
// Ortam değişkenleri (Worker → Settings → Variables and Secrets; hepsi "Secret" olabilir):
//   TELEGRAM_BOT_TOKEN   BotFather'daki token (GitHub secret'ı ile aynı)
//   ALLOWED_CHAT_ID      sadece bu sohbetten komut alınır (repo: config/telegram_chat_id)
//   WEBHOOK_SECRET       uydurma uzun bir parola (Telegram her istekte başlıkta yollar)
//   FIRE_URL, FIRE_TOKEN  "Düşün Bakalım günlük üretim" görevinin API Fire URL'i ve token'ı
//
// Kurulumdan sonra bir kez tarayıcıda açın: https://<worker-adresi>/setup?key=<WEBHOOK_SECRET>
// (Worker kendi adresini Telegram'a webhook olarak kaydeder ve komut menüsünü ayarlar.)

const COMMANDS = {
  uzun: { kind: 'long', label: '📺 Uzun video' },
  shorts: { kind: 'short', label: '📱 Shorts' },
  short: { kind: 'short', label: '📱 Shorts' },
};

const HELP = [
  '<b>🎥 Düşün Bakalım</b>',
  '',
  '<code>/uzun</code> — ek uzun video üret ve yayınla',
  '<code>/shorts</code> — ek Shorts üret ve yayınla',
  '<code>/uzun Çanakkale 1915</code> — konuyu siz verin',
  '',
  'İlerleme bu sohbetteki canlı durum mesajında görünür.',
].join('\n');

async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json().catch(() => ({}));
}

const reply = (env, chat, text) =>
  tg(env, 'sendMessage', { chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true });

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function fire(env, kind, topic) {
  const url = env.FIRE_URL, token = env.FIRE_TOKEN;
  if (!url || !token) return { ok: false, error: 'FIRE_URL / FIRE_TOKEN ayarlı değil' };
  const text = `EK VİDEO: ${kind === 'long' ? 'uzun' : 'shorts'} · Konu: ${topic || 'verilmedi, sen seç'}` +
    " (kanal sahibi Telegram'dan başlattı)";
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'anthropic-beta': 'experimental-cc-routine-2026-04-01',
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) return { ok: false, error: `HTTP ${r.status} ${esc(JSON.stringify(body).slice(0, 200))}` };
  return { ok: true, url: body.claude_code_session_url };
}

async function setup(env, origin) {
  const hook = await tg(env, 'setWebhook', {
    url: `${origin}/telegram`,
    secret_token: env.WEBHOOK_SECRET,
    allowed_updates: ['message'],
    drop_pending_updates: true,
  });
  const cmds = await tg(env, 'setMyCommands', {
    commands: [
      { command: 'uzun', description: 'Ek uzun video üret ve yayınla' },
      { command: 'shorts', description: 'Ek Shorts üret ve yayınla' },
      { command: 'yardim', description: 'Komutlar' },
    ],
  });
  return new Response(JSON.stringify({ webhook: hook, commands: cmds }, null, 1),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/setup') {
      if (url.searchParams.get('key') !== env.WEBHOOK_SECRET) return new Response('forbidden', { status: 403 });
      return setup(env, url.origin);
    }
    if (url.pathname !== '/telegram' || request.method !== 'POST') return new Response('ok');
    if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) {
      return new Response('forbidden', { status: 403 });
    }
    // Always answer 200: Telegram re-sends an update that got an error, which would start a video twice.
    try {
      const update = await request.json();
      const msg = update.message;
      if (!msg || !msg.text) return new Response('ok');
      const chat = String(msg.chat.id);
      if (chat !== String(env.ALLOWED_CHAT_ID).trim()) return new Response('ok');   // strangers are ignored
      const m = msg.text.trim().match(/^\/([a-zçğıöşü]+)(?:@\w+)?\s*([\s\S]*)$/i);
      if (!m) return new Response('ok');
      const cmd = m[1].toLowerCase(), topic = m[2].trim().slice(0, 300);
      const c = COMMANDS[cmd];
      if (!c) {
        await reply(env, chat, HELP);
        return new Response('ok');
      }
      const res = await fire(env, c.kind, topic);
      if (res.ok) {
        await reply(env, chat, [
          `<b>${c.label} başlatıldı</b> ✅`,
          topic ? `Konu: <code>${esc(topic)}</code>` : 'Konu: <code>Claude seçecek</code>',
          'Senaryo → sahneler → eleştiri → render → YouTube (~1 saat).',
          res.url ? `<a href="${res.url}">Oturumu aç ↗</a>` : '',
        ].filter(Boolean).join('\n'));
      } else {
        await reply(env, chat, `<b>❌ Başlatılamadı</b>\n<code>${res.error}</code>`);
      }
    } catch (e) {
      // swallow: see the comment above
    }
    return new Response('ok');
  },
};
