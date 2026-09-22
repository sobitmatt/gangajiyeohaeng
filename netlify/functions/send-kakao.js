const crypto = require("crypto");

function onlyNum(v) {
  return String(v || "").replace(/[^0-9]/g, "");
}

function authHeader(apiKey, apiSecret) {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(date + salt)
    .digest("hex");

  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
}

async function sendOneSMS({ to, from, text, apiKey, apiSecret }) {
  const res = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(apiKey, apiSecret)
    },
    body: JSON.stringify({
      message: {
        to,
        from,
        text
      }
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.errorMessage || "솔라피 발송 실패");
  }
  return data;
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: false, message: "POST만 가능합니다." })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const apiKey = process.env.SOLAPI_API_KEY;
    const apiSecret = process.env.SOLAPI_API_SECRET;
    const from = onlyNum(process.env.SOLAPI_FROM);
    const staffPhone = onlyNum(process.env.STAFF_PHONE);
    const customerPhone = onlyNum(body.phone);

    if (!apiKey || !apiSecret || !from) {
      return {
        statusCode: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ ok: false, message: "솔라피 설정이 없습니다." })
      };
    }

    const text =
      `[강아지여행 예약]\n` +
      `예약자: ${body.customerName || "고객님"}\n` +
      `강아지: ${body.dogName || "강아지"}\n` +
      `날짜: ${body.date || "-"}\n` +
      `시간: ${body.time || "-"}\n` +
      `메뉴: ${body.menu || "미용"}\n` +
      `금액: ${body.price || "0원"}`;

    const results = [];

    if (customerPhone.length >= 10) {
      results.push(
        await sendOneSMS({
          to: customerPhone,
          from,
          text: "[고객알림]\n" + text,
          apiKey,
          apiSecret
        })
      );
    }

    if (staffPhone.length >= 10) {
      results.push(
        await sendOneSMS({
          to: staffPhone,
          from,
          text: "[매장알림]\n" + text,
          apiKey,
          apiSecret
        })
      );
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: true, results })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        ok: false,
        message: error.message || "문자 발송 실패"
      })
    };
  }
};
