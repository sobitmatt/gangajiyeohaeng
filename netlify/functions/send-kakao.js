const { SolapiMessageService } = require("solapi");

function onlyNum(v) {
  return String(v || "").replace(/[^0-9]/g, "");
}

function json(statusCode, data) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };
}

exports.handler = async function (event) {
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

  try {
    const body = JSON.parse(event.body || "{}");
    const customerPhone = onlyNum(body.phone);

    if (!apiKey || !apiSecret || !from) {
      return json(500, { ok: false, message: "솔라피 설정이 없습니다." });
    }

    const text =
      "[강아지여행 예약]\n" +
      "예약자: " + (body.customerName || "고객님") + "\n" +
      "강아지: " + (body.dogName || "강아지") + "\n" +
      "날짜: " + (body.date || "-") + "\n" +
      "시간: " + (body.time || "-") + "\n" +
      "메뉴: " + (body.menu || "미용") + "\n" +
      "금액: " + (body.price || "0원");

    const messageService = new SolapiMessageService(apiKey, apiSecret);
    const messages = [];

    if (customerPhone.length >= 10) {
      messages.push({ to: customerPhone, from: from, text: "[고객알림]\n" + text });
    }
    if (staffPhone.length >= 10) {
      messages.push({ to: staffPhone, from: from, text: "[매장알림]\n" + text });
    }

    const result = await messageService.send(messages);
    return json(200, { ok: true, result: result });
  } catch (error) {
    return json(500, {
      ok: false,
      message: error.message || "문자 발송 실패",
      detail: error
    });
  }
};
