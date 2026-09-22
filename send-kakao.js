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

function json(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
}

exports.handler = async function (event) {
  try {
    if (event.httpMethod === "OPTIONS") {
      return json(200, { ok: true });
    }

    const apiKey = process.env.SOLAPI_API_KEY || "";
    const apiSecret = process.env.SOLAPI_API_SECRET || "";
    const from = onlyNum(process.env.SOLAPI_FROM);
    const staffPhone = onlyNum(process.env.STAFF_PHONE);

    if (event.httpMethod !== "POST") {
      return json(200, {
        ok: false,
        message: "POST만 가능합니다.",
        check: {
          hasApiKey: !!apiKey,
          hasApiSecret: !!apiSecret,
          hasFrom: !!from,
          from: from,
          hasStaffPhone: !!staffPhone
        }
      });
    }

    if (!apiKey || !apiSecret || !from) {
      return json(500, {
        ok: false,
        message: "솔라피 설정이 없습니다.",
        check: {
          hasApiKey: !!apiKey,
          hasApiSecret: !!apiSecret,
          hasFrom: !!from,
          from: from
        }
      });
    }

    const body = JSON.parse(event.body || "{}");
    const customerPhone = onlyNum(body.phone);

    const text =
      "[강아지여행 예약]\n" +
      "예약자: " + (body.customerName || "고객님") + "\n" +
      "강아지: " + (body.dogName || "강아지") + "\n" +
      "날짜: " + (body.date || "-") + "\n" +
      "시간: " + (body.time || "-") + "\n" +
      "메뉴: " + (body.menu || "미용") + "\n" +
      "금액: " + (body.price || "0원");

    const targets = [];
    if (customerPhone.length >= 10) targets.push({ to: customerPhone, label: "고객" });
    if (staffPhone.length >= 10) targets.push({ to: staffPhone, label: "매장" });

    if (targets.length === 0) {
      return json(400, { ok: false, message: "수신번호가 없습니다." });
    }

    const results = [];

    for (const target of targets) {
      const res = await fetch("https://api.solapi.com/messages/v4/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader(apiKey, apiSecret)
        },
        body: JSON.stringify({
          message: {
            to: target.to,
            from: from,
            text: "[" + target.label + "알림]\n" + text
          }
        })
      });

      const raw = await res.text();
      let data = raw;
      try {
        data = JSON.parse(raw);
      } catch (e) {}

      results.push({
        label: target.label,
        to: target.to,
        status: res.status,
        data: data
      });
    }

    const failed = results.some((r) => r.status >= 400);
    return json(failed ? 500 : 200, {
      ok: !failed,
      results: results
    });
  } catch (error) {
    return json(500, {
      ok: false,
      message: error.message || "문자 발송 실패"
    });
  }
};
