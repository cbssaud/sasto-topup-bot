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

// ===== PRICES =====
const prices = {
  "60": 140,
  "325": 720,
  "985": 2100,
  "1320": 2900,
  "1800": 3680,
  "3850": 6860,
  "8100": 13500
};

const catalogueMap = {
  "60": "60",
  "325": "325",
  "985": "985",
  "1320": "1320",
  "1800": "1800",
  "3850": "3850 UC (discounted)",
  "8100": "8100 UC (discounted)"
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
        ["🎮 Game Top-Ups", "🎁 GiftCards & Vouchers"],
        ["👤 My Account", "📞 Support"]
      ],
      resize_keyboard: true
    }
  });
});

// ===== MAIN HANDLER =====
bot.on("message", async msg => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const user = users[chatId] || {};

if (text === "🆕 New Order") {
  users[chatId] = {};
  bot.sendMessage(chatId, "👉 Send your PUBG UID");
  return;
}

  if (!history[chatId]) {
    history[chatId] = { purchases: [], topups: [], transactions: [] };
  }

  // 🎁 GiftCards
  if (text === "🎁 GiftCards & Vouchers") {
    bot.sendMessage(chatId, "🎁 GiftCards & Vouchers coming soon...");
    return;
  }

  // 🎮 Game Top-Up
  if (text === "🎮 Game Top-Ups") {
    users[chatId] = {};
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

  // Other Games
  if (["🗡 Mobile Legends", "🔥 Free Fire", "🛡 Honor of Kings"].includes(text)) {
    bot.sendMessage(chatId, "🚧 Coming soon...");
    return;
  }

  if (text === "🎮 More Games") {
    bot.sendMessage(chatId, "🎮 More games coming soon...");
    return;
  }

  // PUBG
  if (text === "🎯 PUBGM UC & Items") {
    users[chatId] = {};
    bot.sendMessage(chatId, "👉 Send your PUBG UID");
    return;
  }

  // 📞 Support
  if (text === "📞 Support") {
    bot.sendMessage(chatId, "📞 Contact: @SastoTopUpCenter");
    return;
  }

  // 👤 My Account
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

  if (text === "🔙 Back to Menu") {
    users[chatId] = {};
    bot.sendMessage(chatId, "🏠 Main Menu", {
      reply_markup: {
        keyboard: [
          ["🎮 Game Top-Ups", "🎁 GiftCards & Vouchers"],
          ["👤 My Account", "📞 Support"]
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

      bot.sendMessage(chatId, `✅ Player: ${user.name}
🆔 ${user.uid}

💎 Select UC`, {
        reply_markup: {
          keyboard: [
            ["60 UC - Rs. 140", "325 UC - Rs. 720"],
            ["985 UC - Rs. 2100", "1320 UC - Rs. 2900"],
            ["1800 UC - Rs. 3680"],
            ["3850 UC - Rs. 6860", "8100 UC - Rs. 13500"],
            ["🔙 Back to Menu"]
          ],
          resize_keyboard: true
        }
      });

    } else {
      bot.sendMessage(chatId, "❌ PUBG account (Global) not found.\nPlease send correct UID.");
    }

  } catch {
    bot.sendMessage(chatId, "❌ PUBG account (Global) not found.\nPlease send correct UID.");
  }
  return;
}

  // ===== SELECT UC =====
  if (prices[text?.split(" ")[0]]) {
    const uc = text.split(" ")[0];
    user.package = uc;
    users[chatId] = user;

    bot.sendMessage(chatId, `🧾 Order Details
👤 ${user.name}
🆔 ${user.uid}
💎 ${uc} UC
💰 Rs ${prices[uc]}`, {
      reply_markup: {
        keyboard: [
          ["📱 Esewa", "🏦 Bank"],
          ["💳 Khalti"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  // ===== PAYMENT METHOD =====
  if (["📱 Esewa", "🏦 Bank", "💳 Khalti"].includes(text)) {
    user.awaitingPayment = true;
    users[chatId] = user;

    bot.sendMessage(chatId, "💰 Pay now then press Paid", {
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

  // ===== PAID =====
  if (text === "✅ Paid" && user.awaitingPayment) {
    user.awaitingPayment = false;
    user.awaitingScreenshot = true;
    users[chatId] = user;

    bot.sendMessage(chatId, "📸 Send payment screenshot");
    return;
  }

  // CANCEL BEFORE SCREENSHOT
  if (text === "❌ Cancel Order") {
    users[chatId] = {};
    bot.sendMessage(chatId, "❌ Order cancelled");
    return;
  }

  // ===== RECEIVE SCREENSHOT =====
  if (user.awaitingScreenshot && msg.photo) {
    user.awaitingScreenshot = false;
    const photo = msg.photo.at(-1).file_id;

    const orderId = Date.now();
    orders[orderId] = {
      userId: chatId,
      name: user.name,
      uid: user.uid,
      uc: user.package,
      price: prices[user.package],
      screenshot: photo,
      status: "pending"
    };

    bot.sendMessage(chatId, "⏳ Verifying payment...\nPlease wait 1–10 minutes", {
      reply_markup: {
        keyboard: [
          ["❌ I didn’t pay, cancel order"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });

    // ===== SEND TO ADMIN (WITH NPR) =====
    bot.sendPhoto(ADMIN_ID, photo, {
      caption: `💰 Payment Request

👤 User: ${user.name}
🆔 UID: ${user.uid}
💎 UC: ${user.package}
💵 Amount: Rs ${prices[user.package]}`,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Confirm", callback_data: `ok_${orderId}` },
            { text: "❌ Cancel", callback_data: `no_${orderId}` }
          ]
        ]
      }
    });
    return;
  }

  // CANCEL AFTER SCREENSHOT
  if (text === "❌ I didn’t pay, cancel order") {
    const orderId = Object.keys(orders).find(
      id => orders[id].userId === chatId && orders[id].status === "pending"
    );

    if (orderId) {
      orders[orderId].status = "cancelled";
      bot.sendMessage(ADMIN_ID, `❌ Order ${orderId} cancelled by user`);
    }

    bot.sendMessage(chatId, "❌ Order cancelled");
  }
});

// ===== AUTO RETRY UC DELIVERY =====
async function deliverUC(order) {
  for (let i = 1; i <= 3; i++) {
    try {
      await axios.post(
        "https://api.g2bulk.com/v1/games/pubgm/order",
        {
          catalogue_name: catalogueMap[order.uc],
          player_id: order.uid
        },
        { headers: { "X-API-Key": API_KEY } }
      );
      return true;
    } catch (e) {
      console.log(`Retry ${i} failed`);
      if (i === 3) return false;
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// ===== ADMIN ACTION =====
bot.on("callback_query", async q => {
  const [action, id] = q.data.split("_");
  const order = orders[id];

  if (!order || order.status !== "pending") {
    return bot.answerCallbackQuery(q.id, {
      text: "Already handled",
      show_alert: true
    });
  }

  // ===== CONFIRM =====
  if (action === "ok") {
    order.status = "processing";

    // tell user order is processing
    bot.sendMessage(
      order.userId,
      "⏳ Payment verified!\n🎮 UC delivery in progress…\nPlease wait 0–3 minutes."
    );

    const success = await deliverUC(order);

    if (success) {
      order.status = "approved";

      // save history
      history[order.userId].purchases.push(`${order.uc} UC`);
      history[order.userId].topups.push(`${order.uc} UC`);
      history[order.userId].transactions.push(
        `Paid Rs ${order.price} for ${order.uc} UC`
      );

      // notify admin
      bot.sendMessage(
        ADMIN_ID,
        `✅ UC delivered\nUID: ${order.uid}\nUC: ${order.uc}`
      );

      // notify user
      bot.sendMessage(
        order.userId,
        "🎉 UC delivered successfully!\n\n🙏 Thank you for choosing Sasto TopUp Center.",
        {
          reply_markup: {
            keyboard: [
              ["🆕 New Order"],
              ["🔙 Back to Menu"]
            ],
            resize_keyboard: true
          }
        }
      );
    } else {
      order.status = "failed";

      bot.sendMessage(
        ADMIN_ID,
        `❌ UC delivery failed\nUID: ${order.uid}`
      );

      bot.sendMessage(
        order.userId,
        "⚠️ Payment verified but UC delivery is delayed.\nAdmin will fix shortly."
      );
    }
  }

  // ===== CANCEL =====
  if (action === "no") {
    order.status = "cancelled";

    bot.sendMessage(
      order.userId,
      "❌ Order cancelled by admin",
      {
        reply_markup: {
          keyboard: [
            ["🆕 New Order"],
            ["🔙 Back to Menu"]
          ],
          resize_keyboard: true
        }
      }
    );
  }

  bot.answerCallbackQuery(q.id);
});

console.log("Bot running...");
