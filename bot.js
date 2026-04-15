const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const { MongoClient } = require("mongodb");

// 🔴 PUT YOUR PASSWORD HERE
cccc

const client = new MongoClient(MONGO_URI);
let db;

// connect database
async function connectDB() {
  try {
    await client.connect();
    db = client.db("sasto_bot");
    console.log("MongoDB Connected ✅");
  } catch (err) {
    console.log("MongoDB Error ❌", err);
  }
}
connectDB();

async function getWallet(userId) {
  const user = await db.collection("wallets").findOne({ userId });

  if (!user) {
    await db.collection("wallets").insertOne({
      userId,
      npr: 0,
      usd: 0
    });
    return { userId, npr: 0, usd: 0 };
  }

  return user;
}

async function updateWallet(userId, data) {
  await db.collection("wallets").updateOne(
    { userId },
    { $set: data },
    { upsert: true }
  );
}


// 🔑 CONFIG
ccccc
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

// ===== PRICES (USD) =====

const pricesUSD = {
  "60": "0.93",
  "325": "4.65",
  "985": "13.70",
  "1320": "18.90",
  "1800": "24.00",
  "3850": "45.00",
  "8100": "88.00"
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
  // 🔁 MORE ORDER BUTTON
if (text === "🔁 More Order") {
  users[chatId] = {}; // reset user

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

  // ===== MODES =====
  
  if (text === "🎮 Game Top-Ups") {
    users[chatId] = { mode: "topup" };
  }

  if (text === "🎁 Gift Card & PUBG Voucher") {
  users[chatId] = { mode: "voucher" };

  bot.sendMessage(chatId,
`🎁 Here are our GiftCards & Vouchers categories

📄 Page 1/1 | Total Categories: 10`, {
    reply_markup: {
      keyboard: [
        ["🎯 PUBG MOBILE UC Vouchers"],
        ["💳 RAZER Gold Accounts"],
        ["🍎 iTunes USA"],
        ["🎮 RAZER Gold GiftCards"],
        ["🎮 PlayStation GiftCards"],
        ["🔥 Free Fire Vouchers"],
        ["🎲 Yalla Ludo"],
        ["🆕 New State Mobile"],
        ["🎴 Jawaker GiftCards"],
        ["📱 IMO GiftCards"],
        ["🔙 Back to Menu"]
      ],
      resize_keyboard: true
    }
  });

  return;
}

  if (text === "🎮 Game Top-Ups" || text === "🎁 Gift Card & PUBG Voucher") {
    bot.sendMessage(chatId, "💱 Choose Currency:", {
      reply_markup: {
        keyboard: [["🇳🇵 Nepali (NPR)", "💵 USD"], ["🔙 Back to Menu"]],
        resize_keyboard: true
      }
    });
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
    const data = history[chatId].purchases;
    bot.sendMessage(chatId, data.length ? "🛒 Your Purchases:\n\n" + data.join("\n") : "No purchases yet");
    return;
  }

  if (text === "🎮 My TopUps") {
    const data = history[chatId].topups;
    bot.sendMessage(chatId, data.length ? "🎮 Your TopUps:\n\n" + data.join("\n") : "No topups yet");
    return;
  }

  if (text === "📄 Transactions") {
    const data = history[chatId].transactions;
    bot.sendMessage(chatId, data.length ? "📄 Your Transactions:\n\n" + data.join("\n") : "No transactions yet");
    return;
  }

  // ===== SUPPORT =====
if (text === "📞 Support") {
  bot.sendMessage(chatId,
                  
`📞 24/7 Support

Need help? Contact our admin 👇

👤 Telegram: @SastoTopUpCenter
⚡ Fast reply (1–10 minutes)

Thank you for using Sasto TopUp ❤️`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "💬 Contact Support",
            url: "https://t.me/SastoTopUpCenter"
          }
        ]
      ]
    }
  });
  return;
}


  // ===== WALLET =====
  
  if (text === "💰 My Wallet") {
    bot.sendMessage(chatId, "💼 Choose Wallet Type:", {
      reply_markup: {
        keyboard: [
          ["🇳🇵 NPR Wallet", "💵 USD Wallet"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });
    return;
  }

  // ===== NPR WALLET =====
  
  if (text === "🇳🇵 NPR Wallet") {
    user.walletMode = "npr";
    users[chatId] = user;

    const wallet = await getWallet(chatId);
const balance = wallet.npr;


    bot.sendMessage(chatId, `💰 NPR Wallet

👤 ID: ${chatId}
💵 Balance: Rs ${balance}

📥 Please deposit using below payment methods:`, {
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

  // ===== DEPOSIT METHOD =====
  
  if (["📱 Esewa", "🏦 Bank", "💳 Khalti"].includes(text) && user.walletMode === "npr") {
    user.depositMethod = text;
    user.awaitingAmount = true;
    users[chatId] = user;

    bot.sendMessage(chatId, "💰 Enter amount you want to deposit (NPR):");
    return;
  }

  // ===== ENTER AMOUNT =====
  
  if (user.awaitingAmount && !isNaN(text)) {
    user.amount = parseInt(text);
    user.awaitingAmount = false;
    user.awaitingWalletPayment = true;
    users[chatId] = user;

    let details = "";

    if (user.depositMethod === "📱 Esewa") details = "Esewa ID: YOUR_ESEWA_ID";
    if (user.depositMethod === "🏦 Bank") details = "Bank Account: YOUR_BANK_ACCOUNT";
    if (user.depositMethod === "💳 Khalti") details = "Khalti ID: YOUR_KHALTI_ID";

    bot.sendMessage(chatId,
`💰 Deposit NPR ${user.amount}

${details}

After payment click Paid`, {
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
  
  if (text === "✅ Paid" && user.awaitingWalletPayment) {
    user.awaitingWalletPayment = false;
    user.awaitingWalletScreenshot = true;
    users[chatId] = user;

    bot.sendMessage(chatId, "📸 Send payment screenshot");
    return;
  }

  // ===== SCREENSHOT =====
  
  if (user.awaitingWalletScreenshot && msg.photo) {
    user.awaitingWalletScreenshot = false;

    const photo = msg.photo.at(-1).file_id;
    const orderId = Date.now();

    orders[orderId] = {
      userId: chatId,
      type: "wallet",
      amount: user.amount,
      screenshot: photo,
      status: "pending"
    };

    bot.sendMessage(chatId,
`⏳ Screenshot received!

Please wait 1–10 minutes

⚠️ If it takes more than 10 minutes,
contact admin: @SastoTopUpCenter`, {
      reply_markup: {
        keyboard: [
          ["❌ I didn’t pay, cancel order"],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });

    bot.sendPhoto(ADMIN_ID, photo, {
      caption: `💰 Wallet Deposit

👤 User: ${chatId}
💵 Amount: Rs ${user.amount}`,
      reply_markup: {
        inline_keyboard: [
          [
            { text: "✅ Confirm", callback_data: `wallet_ok_${orderId}` },
            { text: "❌ Cancel", callback_data: `wallet_no_${orderId}` }
          ]
        ]
      }
    });

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

  // ===== OTHER VOUCHERS =====
if (
  text === "💳 RAZER Gold Accounts" ||
  text === "🍎 iTunes USA" ||
  text === "🎮 RAZER Gold GiftCards" ||
  text === "🎮 PlayStation GiftCards" ||
  text === "🔥 Free Fire Vouchers" ||
  text === "🎲 Yalla Ludo" ||
  text === "🆕 New State Mobile" ||
  text === "🎴 Jawaker GiftCards" ||
  text === "📱 IMO GiftCards"
) {
  bot.sendMessage(chatId, "🚧 Coming soon...");
  return;
}

  // ===== PUBG =====
  
  if (text === "🎯 PUBGM UC & Items" || text === "🎯 PUBG MOBILE UC Vouchers") {

  // 🎁 VOUCHER MODE (NO UID)
  if (user.mode === "voucher") {

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

    const format = (uc) =>
      `${uc} UC Voucher - ${currency === "💵 USD" ? "$" + priceList[uc] : "Rs " + priceList[uc]}`;

    bot.sendMessage(chatId, "🎫 PUBG UC Voucher List:", {
      reply_markup: {
        keyboard: [
          [format("60"), format("325")],
          [format("985"), format("1320")],
          [format("1800")],
          [format("3850"), format("8100")],
          ["🔙 Back to Menu"]
        ],
        resize_keyboard: true
      }
    });

    return;
  }

  // 🎮 TOPUP MODE (ASK UID)
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
  {
    game: "pubgm",
    user_id: text
  },
  {
    headers: {
      "X-API-Key": API_KEY,
      "Content-Type": "application/json"
    }
  }
);

    if (res.data.valid === "valid") {
      user.uid = text;
      user.name = res.data.name;
      user.waitingUID = false;
      users[chatId] = user;

      bot.sendMessage(chatId,
`✅ Player Verified!

👤 Name: ${user.name}
🆔 UID: ${user.uid}`
      );

      const format = (uc) => `${uc} UC - Rs ${prices[uc]}`;

      bot.sendMessage(chatId, "💎 Select UC", {
        reply_markup: {
          keyboard: [
            [format("60"), format("325")],
            [format("985"), format("1320")],
            [format("1800")],
            [format("3850"), format("8100")],
            ["🔙 Back to Menu"]
          ],
          resize_keyboard: true
        }
      });

    } else {
      bot.sendMessage(chatId, "❌ Invalid PUBG UID");
    }

  } catch (error) {
    bot.sendMessage(chatId, "⚠️ Verify error, try again");
  }

  return;
}

   // ===== BUY UC =====
if (prices[text?.split(" ")[0]]) {

  const uc = text.split(" ")[0];
  const price = prices[uc];

  // ✅ CHECK BALANCE
  const wallet = await getWallet(chatId);

if (wallet.npr < price) {
    return bot.sendMessage(chatId,
`❌ Not enough balance!

💰 Your balance: Rs ${wallets[chatId].npr}
💵 Required: Rs ${price}`);
  }

  // deduct balance
  await updateWallet(chatId, {
  npr: wallet.npr - price
});

  const orderId = Date.now();

  // ✅ SAVE ORDER (avoid crash)
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

⏳ Status: Processing...`
  );

  // 🔥 CALL G2BULK API
  try {
    const response = await axios.post(
      "https://api.g2bulk.com/v1/games/pubgm/order",
      {
        catalogue_name: `${uc} UC`, // ✅ FIXED HERE
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

💎 ${uc} UC sent to UID: ${user.uid}

⏳ Please wait 1–3 minutes

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

    // ❌ FAIL → REFUND
    orders[orderId].status = "failed";
    const wallet2 = await getWallet(chatId);
await updateWallet(chatId, {
  npr: wallet2.npr + price
});

    bot.sendMessage(chatId,
`❌ Order Failed!

💰 Rs ${price} refunded

📞 Support: @SastoTopUpCenter`
    );
  }

  return;
}
});

// ===== ADMIN =====

bot.on("callback_query", async q => {
  const [type, action, id] = q.data.split("_");
  const order = orders[id];

  if (!order) return;

  if (type === "wallet") {

    if (order.status !== "pending") {
      return bot.answerCallbackQuery(q.id, {
        text: "Already handled",
        show_alert: true
      });
    }

    if (!wallets[order.userId]) {
      wallets[order.userId] = { npr: 0, usd: 0 };
    }

    if (action === "ok") {
      order.status = "approved";
      const wallet = await getWallet(order.userId);
await updateWallet(order.userId, {
  npr: wallet.npr + order.amount
});

      bot.sendMessage(order.userId,
`✅ Deposit successful!

💰 Rs ${order.amount} added`);
    }

    if (action === "no") {
      order.status = "cancelled";
      bot.sendMessage(order.userId, "❌ Deposit rejected");
    }

    bot.answerCallbackQuery(q.id);
  }
});

console.log("Bot running...");
