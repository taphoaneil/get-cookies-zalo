function notifyIconUrl() {
  return chrome.runtime.getURL("icons/icon-128.png");
}

const APP_NAME = "Get Cookies & IMEI Zalo";

function showNotify(title, message) {
  chrome.notifications.create({
    type: "basic",
    title: `${APP_NAME}: ${title}`,
    message,
    iconUrl: notifyIconUrl(),
  });
}

function broadcastOrIgnore(msg) {
  chrome.runtime.sendMessage(msg, () => void chrome.runtime.lastError);
}

function captureRequests() {
  chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
      const url = details.url;
      if (!url.includes("/api/login/getServerInfo") || url.indexOf("imei=") < 0) return;
      const imei = new URL(url).searchParams.get("imei");
      if (!imei) return;
      chrome.storage.local.get(["imei"], (prev) => {
        const changed = prev.imei !== imei;
        chrome.storage.local.set({ imei }, () => {
          broadcastOrIgnore({ action: "IMEIValue", imei, showToast: changed });
          if (changed) showNotify("IMEI", "Đã lấy IMEI: " + imei);
        });
      });
    },
    { urls: ["<all_urls>"] },
    []
  );
}

function getCookiesFromZalo(options) {
  const silent = options && options.silentNotify;
  chrome.cookies.getAll({ url: "https://chat.zalo.me" }, function (cookies) {
    if (!cookies || cookies.length === 0) return;
    const cookiesDict = {};
    for (let i = 0; i < cookies.length; i++) {
      cookiesDict[cookies[i].name] = cookies[i].value;
    }
    const next = JSON.stringify(cookiesDict);
    chrome.storage.local.get(["cookies"], (prev) => {
      const changed = prev.cookies !== next;
      chrome.storage.local.set({ cookies: next }, () => {
        broadcastOrIgnore({ action: "CookiesValue", cookies: next, showToast: changed });
        if (!silent && changed) showNotify("Cookies", "Đã lấy Cookies từ Zalo.");
      });
    });
  });
}

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.url && tab.url.includes("chat.zalo.me")) {
    setTimeout(() => getCookiesFromZalo({ silentNotify: false }), 2000);
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getStoredData") {
    chrome.storage.local.get(["imei", "cookies"], (data) => {
      sendResponse({
        imei: data.imei != null ? data.imei : null,
        cookies: data.cookies != null ? data.cookies : null,
      });
    });
    return true;
  }
  if (request.action === "forceGetCookies") {
    getCookiesFromZalo({ silentNotify: true });
  }
});

captureRequests();
