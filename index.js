require('dotenv').config();
const { Bot } = require('grammy');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'subscribers.json');

// --- Массивы фраз ---

const PART1 = [
  "Любимая!",
  "Солнышко мое!",
  "Лучик мой!",
  "Счастье мое!",
  "Котеночка моя!",
  "Уважаемая Ольга Красотулевна!",
  "Красотулька моя!",
  "Милашка моя!",
  "Рыбка моя!",
  "Сексик мой!",
  "Душа моя!",
  "Принцесса моя!",
  "Невьебенная моя!",
  "Ахуенная моя!"
];

const PART2 = [
  "Я понимаю, что ты у нас и без этого ахуенная и невьебенная, но пора выпить таблетосик.",
  "Пора выпить таблеточку!",
  "Самое время для таблеточки!",
  "КОЛЁСА. ВКИД. БУРМАЛДА. БАЛДЕТЬ. СПАТЬ КРЕПКО.",
  "Конечно быть здоровой - здорово, но колеса сами себя не выпьют.",
  "Таблетосик!",
  "Такблэтку ебани побратске.",
  "Ахуительное время для употребление психотропных веществ!",
  "Меркурий стал в созвездие поноса, думаю это то самое время, чтобы принять лекарство!",
  "Чота ты забыла! Таблетос пей нах. пж.",
  "калесики калесики пит пит упатреблят."
];

const PART3 = [
  "Ты сегодня просто великолепна!",
  "Я очень сильно тебя люблю!!!",
  "Седня определенно твой день!",
  "Твой котенок тебя любит!",
  "Люблю!",
  "Целую в щечкинсы!",
  "Целую в губкинсы!",
  "Видел щяс тя по скрытой камере, ты просто божественна!",
  "Давай не мороси, все, обнял. ПОЦЕЛОВАЛ!",
  "Любимочкина моя!",
  "Красотулькам надо быть на режиме!",
  "Чотинькая ты у меня девчуля, ровная сразу вижу!",
  "Принцесска моя, ты большая молодец!",
  "Так держать!",
  "ЕХААй биЛЯ!",
  "НЕ забудь что твой котенок тебя любит, это оч важно!",
  "Умничка!",
  "Просто ебейши..",
  "Обнял. Связь."
];

// --- Работа с подписчиками ---

function loadSubscribers() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveSubscriber(chatId) {
  const subs = loadSubscribers();
  if (!subs.includes(chatId)) {
    subs.push(chatId);
    fs.writeFileSync(DATA_FILE, JSON.stringify(subs, null, 2));
  }
}

// Генерация случайной комбинации
function generateMessage() {
  const p1 = PART1[Math.floor(Math.random() * PART1.length)];
  const p2 = PART2[Math.floor(Math.random() * PART2.length)];
  const p3 = PART3[Math.floor(Math.random() * PART3.length)];

  return `${p1} ${p2} ${p3}`;
}

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "8994511117:AAEmLO_ymAMgn_ZJwqbErtgTpGZLEu-_NHY");

bot.command('start', async (ctx) => {
  saveSubscriber(ctx.chat.id);
  await ctx.reply('Привет, принцесса! Я буду напоминать тебе пить таблеточку каждый день в 20:00 ❤️');
});

// Ежедневная рассылка в 20:00 по Иркутску (Asia/Irkutsk UTC+8)
cron.schedule('0 20 * * *', async () => {
  const subscribers = loadSubscribers();
  for (const chatId of subscribers) {
    try {
      const msg = generateMessage();
      await bot.api.sendMessage(chatId, msg);
    } catch (err) {
      console.error(`Ошибка отправки пользователю ${chatId}:`, err.message);
    }
  }
}, {
  timezone: 'Asia/Irkutsk'
});

async function start() {
  try {
    await bot.api.deleteWebhook({ drop_pending_updates: true });
    await bot.api.setMyCommands([]);
  } catch (e) {}

  console.log('🤖 Бот-напоминалка запущен (только рассылка в 20:00)!');
  await bot.start();
}

start();