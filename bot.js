const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// 🔐 CONFIG
const BOT_TOKEN = "8456828173:AAFI44ZMnIizSbl5mIGnD9g_noDxNWDG8K4";
const API_KEY = "1a73a4a2171f15d9a5bf2df27d636686f9db0cc85fac3e129a71603e57b038a9";
const ADMIN_ID = 8667797941;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ===== DATA =====
let users = {};
let orders = {};
let history = {};
let wallets = {};

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

// ===== 🔥 G2BULK FUNCTION =====
async function sendUCWithRetry({ chatId, user, uc, price, orderId, retries = 3 }) {
  try {
    const response = await axios.post(
      "https://api.g2bulk.com/v1/games/pubgm/order",
      {
        catalogue_name: uc.toString(),
        player_id: user.uid.toString()
      },
      {
        headers: {
          "X-API-Key": API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("API RESPONSE:", response.data);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    // ✅ SUCCESS
    orders[orderId].status = "completed";

    bot.sendMessage(chatId,
`🎉 UC Delivered Successfully!

🆔 Order ID: ${orderId}
💎 ${uc} UC sent

⏳ Please wait 1–3 minutes to receive in PUBG.

❤️ Thank you for choosing Sasto TopUp Center`
    );

    bot.sendMessage(ADMIN_ID,
`✅ UC Delivered

👤 User: ${chatId}
🎮 UID: ${user.uid}
💎 UC: ${uc}
💰 Rs ${price}
🆔 Order: ${orderId}`
    );

  } catch (error) {
    console.log("ERROR:", error.response?.data || error.message);

    if (retries > 0) {
      bot.sendMessage(chatId, `🔄 Retrying... (${4 - retries}/3)`);

      return sendUCWithRetry({
        chatId,
        user,
        uc,
        price,
        orderId,
        retries: retries - 1
      });
    }

    // ❌ FINAL FAIL
    orders[orderId].status = "failed";
    wallets[chatId].npr += price;

    bot.sendMessage(chatId,
`❌ Order Failed!

💰 Rs ${price} refunded

📞 Support: @SastoTopUpCenter`
    );
  }
}

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
        ["🎮 Game Top-Ups"],
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

  if (!wallets[chatId]) {
    wallets[chatId] = { npr: 0 };
  }

  // ===== SUPPORT =====
  if (text === "📞 Support") {
    bot.sendMessage(chatId,
`📞 Support: @SastoTopUpCenter`);
    return;
  }

  // ===== START TOPUP =====
  if (text === "🎮 Game Top-Ups") {
    users[chatId] = { waitingUID: true };
    bot.sendMessage(chatId, "👉 Send your PUBG UID");
    return;
  }

  // ===== UID =====
  if (user.waitingUID) {
    user.uid = text;
    user.waitingUID = false;
    users[chatId] = user;

    bot.sendMessage(chatId, "💎 Select UC", {
      reply_markup: {
        keyboard: [
          ["60 UC - Rs 140", "325 UC - Rs 720"],
          ["985 UC - Rs 2100", "1320 UC - Rs 2900"],
          ["1800 UC - Rs 3680"],
          ["3850 UC - Rs 6860", "8100 UC - Rs 13500"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  // ===== BUY UC =====
  const uc = text?.split(" ")[0];

  if (prices[uc]) {
    const price = prices[uc];

    if (!user.uid) {
      bot.sendMessage(chatId, "❌ UID missing!");
      return;
    }

    if (wallets[chatId].npr < price) {
      bot.sendMessage(chatId, "❌ Not enough balance!");
      return;
    }

    wallets[chatId].npr -= price;

    const orderId = Date.now();

    orders[orderId] = {
      userId: chatId,
      uid: user.uid,
      uc,
      price,
      status: "processing"
    };

    bot.sendMessage(chatId,
`🧾 Order Confirmed

🆔 Order ID: ${orderId}
🎮 UID: ${user.uid}
💎 UC: ${uc}
💰 Price: Rs ${price}

⏳ Status: Processing...`,
    {
      reply_markup: {
        keyboard: [
          ["🔁 More Order"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });

    await sendUCWithRetry({
      chatId,
      user,
      uc,
      price,
      orderId
    });

    return;
  }

  // ===== MORE ORDER =====
  if (text === "🔁 More Order") {
    users[chatId] = {};
    bot.sendMessage(chatId, "🎮 Choose Game", {
      reply_markup: {
        keyboard: [["🎮 Game Top-Ups"]],
        resize_keyboard: true
      }
    });
    return;
  }

  // ===== BACK =====
  if (text === "🔙 Back to Menu") {
    users[chatId] = {};
    bot.sendMessage(chatId, "🏠 Menu", {
      reply_markup: {
        keyboard: [
          ["🎮 Game Top-Ups"],
          ["👤 My Account", "📞 Support"]
        ],
        resize_keyboard: true
      }
    });
  }
});

console.log("🚀 Bot running...");

  
