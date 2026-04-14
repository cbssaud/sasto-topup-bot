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

  bot.sendMessage(chatId, `🎉 Welcome to Sasto TopUp Bot

⚡ Fast & Cheap Gaming Topup
🔒 Secure Payment

👇 Choose option`, {
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

  // ===== MENU =====
  if (text === "🔙 Back to Menu") {
    users[chatId] = {};
    bot.sendMessage(chatId, "🏠 Main Menu", {
      reply_markup: {
        keyboard: [
          ["🎮 Game Top-Ups", "🎁 Gift Card & PUBG Voucher"],
          ["👤 My Account", "📞 Support"]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  // ===== SUPPORT =====
  if (text === "📞 Support") {
    bot.sendMessage(chatId, "📞 Contact: @SastoTopUpCenter");
    return;
  }

  // ===== ACCOUNT =====
  if (text === "👤 My Account") {
    bot.sendMessage(chatId, "👤 My Account", {
      reply_markup: {
        keyboard: [
          ["🛒 My Purchases", "🎮 My TopUps"],
          ["📄 Transactions", "💰 My Wallet"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  if (text === "🛒 My Purchases") {
    bot.sendMessage(chatId, history[chatId].purchases.join("\n") || "No purchases");
    return;
  }

  if (text === "🎮 My TopUps") {
    bot.sendMessage(chatId, history[chatId].topups.join("\n") || "No topups");
    return;
  }

  if (text === "📄 Transactions") {
    bot.sendMessage(chatId, history[chatId].transactions.join("\n") || "No transactions");
    return;
  }

  if (text === "💰 My Wallet") {
    bot.sendMessage(chatId, "💰 Wallet coming soon");
    return;
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
          ["🗡 Mobile Legends", "🔥 Free Fire"],
          ["🛡 Honor of Kings", "🎮 More Games"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  // ===== OTHER GAMES =====
  if (
    text === "🗡 Mobile Legends" ||
    text === "🔥 Free Fire" ||
    text === "🛡 Honor of Kings" ||
    text === "🎮 More Games"
  ) {
    bot.sendMessage(chatId, "🚧 Coming soon...");
    return;
  }

  // ===== PUBG =====
  if (text === "🎯 PUBGM UC & Items") {
    user.waitingUID = true;
    users[chatId] = user;

    bot.sendMessage(chatId, "👉 Send your PUBG UID");
    return;
  }

  // ===== VERIFY UID =====
  if (user.waitingUID && text && !text.startsWith("/")) {
    try {
      const res = await axios.post(
        "https://api.g2bulk.com/v1/games/checkPlayerId",
        { game: "pubgm", user_id: text }
      );

      if (res.data.valid === "valid") {
        user.uid = text;
        user.name = res.data.name;
        user.waitingUID = false;
        users[chatId] = user;

        const currency = user.currency;

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

        bot.sendMessage(chatId, `✅ Player: ${user.name}
🆔 ${user.uid}

💎 Select UC`, {
          reply_markup: {
            keyboard: [
  [
    `60 UC - ${currency === "💵 USD" ? "$" + priceList["60"] : "Rs " + priceList["60"]}`,
    `325 UC - ${currency === "💵 USD" ? "$" + priceList["325"] : "Rs " + priceList["325"]}`
  ],
  [
    `985 UC - ${currency === "💵 USD" ? "$" + priceList["985"] : "Rs " + priceList["985"]}`,
    `1320 UC - ${currency === "💵 USD" ? "$" + priceList["1320"] : "Rs " + priceList["1320"]}`
  ],
  [
    `1800 UC - ${currency === "💵 USD" ? "$" + priceList["1800"] : "Rs " + priceList["1800"]}`
  ],
  [
    `3850 UC - ${currency === "💵 USD" ? "$" + priceList["3850"] : "Rs " + priceList["3850"]}`,
    `8100 UC - ${currency === "💵 USD" ? "$" + priceList["8100"] : "Rs " + priceList["8100"]}`
  ],
  ["🔙 Back to Menu"]
]
,
            resize_keyboard: true
          }
        });

      } else {
        bot.sendMessage(chatId, "❌ Invalid UID");
      }

    } catch {
      bot.sendMessage(chatId, "❌ Error verifying UID");
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

  // ===== PAYMENT =====
  if (
    ["📱 Esewa", "🏦 Bank", "💳 Khalti", "💳 Binance Pay"].includes(text)
  ) {
    user.awaitingPayment = true;
    users[chatId] = user;

    bot.sendMessage(chatId, "💰 Send payment then press Paid", {
      reply_markup: {
        keyboard: [
          ["✅ Paid", "❌ Cancel Order"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  if (text === "✅ Paid" && user.awaitingPayment) {
    user.awaitingPayment = false;
    user.awaitingScreenshot = true;
    users[chatId] = user;

    bot.sendMessage(chatId, "📸 Send payment screenshot");
    return;
  }

  if (text === "❌ Cancel Order") {
    users[chatId] = {};
    bot.sendMessage(chatId, "❌ Order cancelled");
    return;
  }

  // ===== SCREENSHOT =====
  if (user.awaitingScreenshot && msg.photo) {
    const orderId = Date.now();

    orders[orderId] = {
      userId: chatId,
      name: user.name,
      uid: user.uid,
      uc: user.package,
      price: prices[user.package],
      status: "pending"
    };

    bot.sendPhoto(ADMIN_ID, msg.photo.at(-1).file_id, {
      caption: `💰 Order

👤 ${user.name}
🆔 ${user.uid}
💎 ${user.package}
💰 Rs ${prices[user.package]}`,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Confirm", callback_data: `ok_${orderId}` },
            { text: "❌ Cancel", callback_data: `no_${orderId}` }
          ]
        ]
      }
    });

    bot.sendMessage(chatId, "⏳ Waiting admin...");
    return;
  }
});

// ===== ADMIN =====
bot.on("callback_query", async q => {
  const [action, id] = q.data.split("_");
  const order = orders[id];

  if (!order) return;

  if (action === "ok") {
    history[order.userId].purchases.push(`${order.uc} UC`);
    history[order.userId].topups.push(`${order.uc} UC`);
    history[order.userId].transactions.push(
      `Paid Rs ${order.price} for ${order.uc} UC`
    );

    bot.sendMessage(order.userId, "🎉 Order successful!");
  }

  if (action === "no") {
    bot.sendMessage(order.userId, "❌ Order cancelled");
  }

  bot.answerCallbackQuery(q.id);
});

console.log("Bot running...");
