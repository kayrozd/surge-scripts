/*
 * IPData Surge 面板
 * 出口 IP：api.ipify.org；信誉信息：ipdata.co 网站公开演示数据。
 * 演示凭据每次从网站读取，只用于当次请求，不保存、不记录。
 * Trust Score 缺失时尝试 ipdata.co/<IP> 公开查询页。
 */

const POLICY = "AI";
const IP_API = "https://api.ipify.org?format=json";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
  Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
  Referer: "https://ipdata.co/",
};

let finished = false;
const deadline = setTimeout(() => finish("请求超时，请刷新重试", "#FF9500"), 14000);

function finish(content, color = "#5AC8FA") {
  if (finished) return;
  finished = true;
  if (typeof clearTimeout === "function") clearTimeout(deadline);
  $done({ title: "IPData · " + POLICY, content, icon: "shield.lefthalf.filled", "icon-color": color });
}

function get(url) {
  return new Promise((resolve, reject) => {
    $httpClient.get({ url, headers: HEADERS, timeout: 6, policy: POLICY }, (error, response, body) => {
      if (error) return reject(new Error("AI 策略组请求失败，请检查组名和节点"));
      const status = Number(response && (response.status || response.statusCode));
      if (status < 200 || status >= 300 || !body) {
        return reject(new Error("网站返回异常（HTTP " + (status || "未知") + "）"));
      }
      resolve(body);
    });
  });
}

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&ndash;|&#8211;/gi, "–")
    .replace(/&mdash;|&#8212;/gi, "—")
    .replace(/\s+/g, " ")
    .trim();
}

function parseIPData(html) {
  const text = htmlToText(html);
  const trust = text.match(/Trust\s*Score\s*(\d{1,3}(?:\.\d+)?)\s*(?:[–—-]\s*)?(Low|Moderate|High)\s*risk/i);
  const score = trust && Number(trust[1]) <= 100 ? Number(trust[1]) : null;
  const risk = score === null ? null : trust[2] + " risk";

  return { score, risk };
}

(async () => {
  let ip = null;
  try {
    const initial = await Promise.all([get(IP_API), get("https://ipdata.co/")]);
    ip = JSON.parse(initial[0]).ip;
    if (typeof ip !== "string" || ip.length > 45 || !/^[0-9a-f:.]+$/i.test(ip) || !/[.:]/.test(ip)) {
      throw new Error("出口 IP 数据无效");
    }
    const demoKey = initial[1].match(/api-key=([a-z0-9]{20,})/i);
    if (!demoKey) throw new Error("网站演示数据入口已变化");
    const lookup = "https://api.ipdata.co/" + encodeURIComponent(ip) + "?api-key=" + encodeURIComponent(demoKey[1]);
    const responses = await Promise.all([
      get(lookup),
      get("https://ipdata.co/" + encodeURIComponent(ip)).catch(() => null),
    ]);
    const data = JSON.parse(responses[0]);
    if (!data || data.ip !== ip) throw new Error("网站未返回对应 IP 的数据");
    const threat = data.threat;
    const rawScore = threat && threat.scores && threat.scores.trust_score;
    let info;
    if (typeof rawScore === "number" && Number.isFinite(rawScore) && rawScore >= 0 && rawScore <= 100) {
      info = { score: rawScore, risk: rawScore >= 60 ? "Low risk" : rawScore >= 40 ? "Moderate risk" : "High risk" };
    } else {
      info = responses[1] ? parseIPData(responses[1]) : { score: null, risk: null };
    }
    // 与网站 Summary 相同：统计 threat 对象中值严格为 true 的字段。
    info.threats = threat && typeof threat === "object" && !Array.isArray(threat)
      ? String(Object.keys(threat).filter(key => threat[key] === true).length)
      : "未提供";
    const trust = info.score === null ? "未提供（网页可能已变化）" : info.score + " · " + info.risk;
    const color = info.score === null ? "#FF9500" : (/High/i.test(info.risk) ? "#FF3B30" : /Moderate/i.test(info.risk) ? "#FF9500" : "#34C759");
    finish("IP: " + ip + "\nThreats: " + info.threats + "\nTrust Score: " + trust, color);
  } catch (error) {
    finish((ip ? "IP: " + ip + "\n" : "") + "获取失败：" + error.message, "#FF9500");
  }
})();
