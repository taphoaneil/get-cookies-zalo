const STATUS_HINT_HTML =
  'Mở <a class="status-link" href="https://chat.zalo.me" target="_blank" rel="noopener noreferrer">chat.zalo.me</a> để thu thập tự động';

const STATUS_NO_DATA_HTML =
  'Chưa có dữ liệu. Mở <a class="status-link" href="https://chat.zalo.me" target="_blank" rel="noopener noreferrer">chat.zalo.me</a> để thu thập tự động.';

function isZaloChatPage(url) {
  return typeof url === "string" && url.includes("chat.zalo.me");
}

function queryActiveTabUrl(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    void chrome.runtime.lastError;
    const url = tabs && tabs[0] && tabs[0].url ? tabs[0].url : "";
    callback(url);
  });
}

function getStatusSectionEl() {
  return document.getElementById("status-section-wrap");
}

function applyIdleStatusUi(url, mode) {
  const section = getStatusSectionEl();
  const statusDiv = document.getElementById("status-message");
  const body = document.getElementById("status-message-body");
  const icon = statusDiv.querySelector("i");

  statusDiv.classList.remove("status-message--success", "status-message--error");

  if (isZaloChatPage(url)) {
    section.style.display = "none";
    body.innerHTML = "";
    icon.className = "fa-solid fa-circle-info";
    return;
  }

  section.style.display = "";
  icon.className = "fa-solid fa-circle-info";
  body.innerHTML = mode === "noData" ? STATUS_NO_DATA_HTML : STATUS_HINT_HTML;
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    return true;
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
}

function showNotification(message, type = "success") {
  const section = getStatusSectionEl();
  const statusDiv = document.getElementById("status-message");
  const icon = statusDiv.querySelector("i");
  const body = document.getElementById("status-message-body");

  section.style.display = "";

  statusDiv.classList.remove("status-message--success", "status-message--error");
  statusDiv.classList.add(type === "success" ? "status-message--success" : "status-message--error");

  body.textContent = message;
  icon.className =
    type === "success" ? "fa-solid fa-circle-check" : "fa-solid fa-circle-exclamation";

  setTimeout(() => {
    statusDiv.classList.remove("status-message--success", "status-message--error");
    queryActiveTabUrl((url) => applyIdleStatusUi(url, "hint"));
  }, 3000);
}

function fillFields(partial) {
  if (partial.imei) {
    document.getElementById("imei-div").classList.remove("is-disabled");
    document.getElementById("imei-input").value = partial.imei;
  }
  if (partial.cookies) {
    document.getElementById("cookies-div").classList.remove("is-disabled");
    document.getElementById("cookies-input").value = partial.cookies;
  }
}

async function handleCopy(inputId, buttonId, dataType) {
  const textInput = document.getElementById(inputId);
  const btnCopy = document.getElementById(buttonId);

  if (!textInput.value) {
    showNotification(`Chưa có ${dataType} để copy!`, "error");
    return;
  }

  const success = await copyTextToClipboard(textInput.value);

  if (success) {
    btnCopy.classList.add("copied", "copy-success");
    btnCopy.innerHTML = `<i class="fa-solid fa-check" aria-hidden="true"></i><span class="btn-text">Đã copy</span>`;

    showNotification(`${dataType} đã được copy!`, "success");

    setTimeout(() => {
      btnCopy.classList.remove("copied", "copy-success");
      btnCopy.innerHTML = `<i class="fa-solid fa-copy" aria-hidden="true"></i><span class="btn-text">Copy</span>`;
    }, 2000);
  } else {
    showNotification(`Không thể copy ${dataType}!`, "error");
  }
}

document.getElementById("btn-copy-1").addEventListener("click", () => {
  handleCopy("imei-input", "btn-copy-1", "IMEI");
});

document.getElementById("btn-copy-2").addEventListener("click", () => {
  handleCopy("cookies-input", "btn-copy-2", "Cookies");
});

chrome.runtime.onMessage.addListener(function (request) {
  if (request.action === "IMEIValue") {
    fillFields({ imei: request.imei });
    document.getElementById("loading_data").classList.remove("show");
    if (request.showToast) showNotification("IMEI đã được lấy thành công!", "success");
  } else if (request.action === "CookiesValue") {
    fillFields({ cookies: request.cookies });
    document.getElementById("loading_data").classList.remove("show");
    if (request.showToast) showNotification("Cookies đã được lấy thành công!", "success");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  queryActiveTabUrl((url) => {
    if (isZaloChatPage(url)) getStatusSectionEl().style.display = "none";
  });

  document.getElementById("refresh-button").addEventListener("click", function () {
    const btn = this;
    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>Đang làm mới...';
    btn.disabled = true;

    document.getElementById("loading_data").classList.add("show");

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      void chrome.runtime.lastError;
      const tab = tabs && tabs[0];
      if (!tab || !tab.id) {
        document.getElementById("loading_data").classList.remove("show");
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        showNotification("Không tìm thấy tab.", "error");
        return;
      }

      const scheduleFetchAfterLoad = () => {
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: "forceGetCookies" }, () => void chrome.runtime.lastError);
        }, 2500);
        setTimeout(() => {
          chrome.runtime.sendMessage({ action: "getStoredData" }, function (response) {
            void chrome.runtime.lastError;
            if (response) fillFields(response);
            document.getElementById("loading_data").classList.remove("show");
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            showNotification("Đã làm mới dữ liệu!", "success");
          });
        }, 4000);
      };

      if (tab.url && isZaloChatPage(tab.url)) {
        chrome.tabs.reload(tab.id, () => {
          void chrome.runtime.lastError;
          scheduleFetchAfterLoad();
        });
      } else {
        chrome.tabs.update(tab.id, { url: "https://chat.zalo.me" }, () => {
          if (chrome.runtime.lastError) {
            document.getElementById("loading_data").classList.remove("show");
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            showNotification("Không thể mở Zalo trên tab này.", "error");
            return;
          }
          scheduleFetchAfterLoad();
        });
      }
    });
  });

  document.getElementById("loading_data").classList.add("show");

  chrome.runtime.sendMessage({ action: "getStoredData" }, function (response) {
    void chrome.runtime.lastError;
    const hadCached = response && (response.imei || response.cookies);
    if (response) fillFields(response);
    document.getElementById("loading_data").classList.remove("show");
    queryActiveTabUrl((url) => {
      if (hadCached) {
        showNotification("Đã tải dữ liệu có sẵn!", "success");
      } else {
        applyIdleStatusUi(url, "noData");
      }
    });
  });
});
