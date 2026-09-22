const crypto = require("crypto");

function onlyNum(v) {
  return String(v || "").replace(/[^0-9]/g, "");
}

function authHeader(apiKey, apiSecret) {
  const date = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const salt = crypto.randomBytes(16).toString("hex");
  const signature = crypto
    .createHmac("sha256", apiSecret)
    .update(date + salt)
    .digest("hex");
  return "HMAC-SHA256 apiKey=" + apiKey + ", date=" + date + ", salt=" + salt + ", signature=" + signature;
}

function json(statusCode, data) {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
}

exports.handler = async function (event) {
  try {
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
          from: from
        }
      });
    }

    if (!apiKey || !apiSecret || !from) {
      return json(500, { ok: false, message: "솔라피 설정이 없습니다." });
    }

    const body = JSON.parse(event.body || "{}");
    const customerPhone = onlyNum(body.phone);
    const text =
      "[강아지여행 예약] " +
      (body.customerName || "고객") + " / " +
      (body.dogName || "강아지") + " / " +
      (body.date || "-") + " " +
      (body.time || "-") + " / " +
      (body.menu || "미용") + " / " +
      (body.price || "0원");

    const targets = [];
    if (customerPhone.length >= 10) targets.push(customerPhone);
    if (staffPhone.length >= 10) targets.push(staffPhone);

    const results = [];
    for (var i = 0; i < targets.length; i++) {
      const res = await fetch("https://api.solapi.com/messages/v4/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader(apiKey, apiSecret)
        },
        body: JSON.stringify({
          message: {
            to: targets[i],
            from: from,
            text: text
          }
        })
      });
      const raw = await res.text();
      results.push({ to: targets[i], status: res.status, raw: raw.slice(0, 300) });
    }

    return json(200, { ok: true, results: results });
  } catch (e) {
    return json(500, { ok: false, message: String(e) });
  }
};
