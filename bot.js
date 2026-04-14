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

  // ===== GAME TOPUP MODE =====
  if (text === "🎮 Game Top-Ups") {
    users[chatId] = { mode: "topup" };

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

  // ===== VOUCHER MODE =====
  if (text === "🎁 Gift Card & PUBG Voucher") {
    users[chatId] = { mode: "voucher" };

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

  // ===== CURRENCY =====
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

    // 🎁 VOUCHER MODE → NO UID
    if (user.mode === "voucher") {
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

      bot.sendMessage(chatId, "🎫 PUBG UC Voucher List:", {
        reply_markup: {
          keyboard: [
            [
              `60 UC Voucher - ${currency === "💵 USD" ? "$" + priceList["60"] : "Rs " + priceList["60"]}`,
              `325 UC Voucher - ${currency === "💵 USD" ? "$" + priceList["325"] : "Rs " + priceList["325"]}`
            ],
            [
              `985 UC Voucher - ${currency === "💵 USD" ? "$" + priceList["985"] : "Rs " + priceList["985"]}`,
              `1320 UC Voucher - ${currency === "💵 USD" ? "$" + priceList["1320"] : "Rs " + priceList["1320"]}`
            ],
            [
              `1800 UC Voucher - ${currency === "💵 USD" ? "$" + priceList["1800"] : "Rs " + priceList["1800"]}`
            ],
            [
              `3850 UC Voucher - ${currency === "💵 USD" ? "$" + priceList["3850"] : "Rs " + priceList["3850"]}`,
              `8100 UC Voucher - ${currency === "💵 USD" ? "$" + priceList["8100"] : "Rs " + priceList["8100"]}`
            ],
            ["🔙 Back to Menu"]
          ],
          resize_keyboard: true
        }
      });

      return;
    }

    // 🎮 TOPUP MODE → ASK UID
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
              [`60 UC - ${currency === "💵 USD" ? "$" + priceList["60"] : "Rs " + priceList["60"]}`],
              [`325 UC - ${currency === "💵 USD" ? "$" + priceList["325"] : "Rs " + priceList["325"]}`],
              [`985 UC - ${currency === "💵 USD" ? "$" + priceList["985"] : "Rs " + priceList["985"]}`],
              [`1320 UC - ${currency === "💵 USD" ? "$" + priceList["1320"] : "Rs " + priceList["1320"]}`],
              [`1800 UC - ${currency === "💵 USD" ? "$" + priceList["1800"] : "Rs " + priceList["1800"]}`],
              [`3850 UC - ${currency === "💵 USD" ? "$" + priceList["3850"] : "Rs " + priceList["3850"]}`],
              [`8100 UC - ${currency === "💵 USD" ? "$" + priceList["8100"] : "Rs " + priceList["8100"]}`],
              ["🔙 Back to Menu"]
            ],
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
});

console.log("Bot running...");
