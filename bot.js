const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// 🔑 CONFIG
const BOT_TOKEN = "8456828173:AAFI44ZMnIizSbl5mIGnD9g_noDxNWDG8K4";
const API_KEY = "1a73a4a2171f15d9a5bf2df27d636686f9db0cc85fac3e129a71603e57b038a9";
const ADMIN_ID = 8667797941;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let users = {};
let orders = {};
let history = {};

// ===== PRICES (NPR) =====
const prices = {
  "60": 140,
  "325": 720,
  "985": 2100,
  "1320": 2900,
  "1800": 3680,
  "3850": 6860,
  "8100": 13500
};

// ===== START =====
bot.onText(/\/start/, msg => {
  const chatId = msg.chat.id;
  users[chatId] = {};

  bot.sendMessage(chatId, `🎉 Welcome to Sasto TopUp Bot`, {
    reply_markup: {
      keyboard: [
        ["🎮 Game Top-Ups", "🎁 Gift Card & PUBG Voucher"],
        ["👤 My Account", "📞 Support"]
      ],
      resize_keyboard: true
    }
  });
});

// ===== MAIN =====
bot.on("message", async msg => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = users[chatId] || {};

  if (!history[chatId]) {
    history[chatId] = { purchases: [], topups: [], transactions: [] };
  }

  // ===== CURRENCY SELECT =====
  if (text === "🎮 Game Top-Ups" || text === "🎁 Gift Card & PUBG Voucher") {
    users[chatId] = {};
    bot.sendMessage(chatId, "💱 Choose Currency:", {
      reply_markup: {
        keyboard: [
          ["🇳🇵 Nepali (NPR)", "💵 USD"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  if (text === "🇳🇵 Nepali (NPR)" || text === "💵 USD") {
    user.currency = text;
    users[chatId] = user;

    bot.sendMessage(chatId, "🎮 Choose Your Game:", {
      reply_markup: {
        keyboard: [
          ["🎯 PUBGM UC & Items"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  // ===== GIFT CATEGORY =====
  if (text === "🎁 Gift Card & PUBG Voucher") {
    bot.sendMessage(chatId, "🎁 Select Category:", {
      reply_markup: {
        keyboard: [
          ["🎯 PUBG UC Voucher"],
          ["🍎 iTunes", "🔥 Free Fire"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  if (text === "🎯 PUBG UC Voucher") {
    bot.sendMessage(chatId, "🎯 Select PUBG Voucher:", {
      reply_markup: {
        keyboard: [
          ["60 UC - Rs 140"],
          ["325 UC - Rs 720"],
          ["1800 UC - Rs 3680"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  // ===== VERIFY UID =====
  if (!user.uid && text && !text.startsWith("/")) {
    try {
      const res = await axios.post(
        "https://api.g2bulk.com/v1/games/checkPlayerId",
        { game: "pubgm", user_id: text }
      );

      if (res.data.valid === "valid") {
        user.uid = text;
        user.name = res.data.name;
        users[chatId] = user;

        const currency = user.currency || "🇳🇵 Nepali (NPR)";

        let priceList = prices;

        if (currency === "💵 USD") {
          priceList = {
            "60": "0.93",
            "325": "4.65",
            "985": "13.70",
            "1320": "18.90",
            "1800": "24.00",
            "3850": "45.00",
            "8100": "88.00"
          };
        }

        bot.sendMessage(chatId, `✅ Player: ${user.name}`, {
          reply_markup: {
            keyboard: [
              [`60 UC - ${currency === "💵 USD" ? "$" + priceList["60"] : "Rs " + priceList["60"]}`],
              [`325 UC - ${currency === "💵 USD" ? "$" + priceList["325"] : "Rs " + priceList["325"]}`],
              ["🔙 Back to Menu"]
            ],
            resize_keyboard: true
          }
        });

      } else {
        bot.sendMessage(chatId, "❌ Invalid UID");
      }
    } catch {
      bot.sendMessage(chatId, "❌ Error");
    }
    return;
  }

  // ===== SELECT UC =====
  if (prices[text?.split(" ")[0]]) {
    const uc = text.split(" ")[0];
    user.package = uc;
    users[chatId] = user;

    const currency = user.currency;

    let paymentButtons;

    if (currency === "💵 USD") {
      paymentButtons = [
        ["💳 USDT (BEP20)", "💳 Binance Pay"],
        ["🔙 Back to Menu"]
      ];
    } else {
      paymentButtons = [
        ["📱 Esewa", "🏦 Bank"],
        ["💳 Khalti"],
        ["🔙 Back to Menu"]
      ];
    }

    bot.sendMessage(chatId, "💰 Choose payment method", {
      reply_markup: {
        keyboard: paymentButtons,
        resize_keyboard: true
      }
    });

    return;
  }

  // ===== USD PAYMENT =====
  if (user.currency === "💵 USD") {
    if (text === "💳 Binance Pay") {
      user.awaitingPayment = true;
      users[chatId] = user;

      bot.sendMessage(chatId, "Send Binance Pay then press Paid");
      return;
    }
  }

  // ===== NPR PAYMENT =====
  if (["📱 Esewa", "🏦 Bank", "💳 Khalti"].includes(text)) {
    user.awaitingPayment = true;
    users[chatId] = user;

    bot.sendMessage(chatId, "Send payment then press Paid");
    return;
  }

  if (text === "✅ Paid" && user.awaitingPayment) {
    user.awaitingPayment = false;
    user.awaitingScreenshot = true;
    users[chatId] = user;

    bot.sendMessage(chatId, "📸 Send screenshot");
    return;
  }

  if (user.awaitingScreenshot && msg.photo) {
    const orderId = Date.now();

    orders[orderId] = {
      userId: chatId,
      uid: user.uid,
      uc: user.package,
      status: "pending"
    };

    bot.sendPhoto(ADMIN_ID, msg.photo[0].file_id, {
      caption: `Order ${orderId}`,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "OK", callback_data: `ok_${orderId}` },
            { text: "NO", callback_data: `no_${orderId}` }
          ]
        ]
      }
    });

    bot.sendMessage(chatId, "⏳ Waiting admin...");
  }
});

// ===== ADMIN =====
bot.on("callback_query", async q => {
  const [action, id] = q.data.split("_");
  const order = orders[id];

  if (action === "ok") {
    bot.sendMessage(order.userId, "✅ Delivered");
  }

  if (action === "no") {
    bot.sendMessage(order.userId, "❌ Cancelled");
  }

  bot.answerCallbackQuery(q.id);
});
