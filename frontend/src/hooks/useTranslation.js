const DEFAULT_LANG = "en";
let currentLang = localStorage.getItem("userLanguage") || DEFAULT_LANG;
let dictionary = {};

async function loadLanguage(lang) {
  try {
    const response = await fetch(`lang/${lang}.json`);
    if (!response.ok) throw new Error();
    return await response.json();
  } catch {
    if (lang !== DEFAULT_LANG) return loadLanguage(DEFAULT_LANG);
    return {};
  }
}

function applyTranslation(translations) {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (translations[key]) {
      if (element.tagName === "A" && element.children.length > 0) {
        const firstText = Array.from(element.childNodes).find(
          (node) => node.nodeType === 3
        );
        if (firstText) firstText.textContent = translations[key];
      } else {
        element.textContent = translations[key];
      }
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    if (translations[key]) element.placeholder = translations[key];
  });

  document.documentElement.lang = currentLang;

  const langBtn = document.querySelector(".language-btn");
  if (langBtn && translations["English"]) {
    langBtn.textContent = translations["English"];
  }
}

async function switchLanguage(lang) {
  if (lang === currentLang) return;

  const translations = await loadLanguage(lang);
  dictionary = translations;
  currentLang = lang;

  applyTranslation(translations);
  localStorage.setItem("userLanguage", lang);

  // Отправляем сообщение об изменении языка в родительское окно (если мы в iframe)
  if (window.self !== window.top) {
    window.parent.postMessage(
      {
        type: "languageChange",
        language: lang,
      },
      "*"
    );
  }

  // Отправляем сообщение об изменении языка в iframe (если мы на главной странице)
  const iframe = document.querySelector("iframe");
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(
      {
        type: "languageChange",
        language: lang,
      },
      "*"
    );
  }
}

function toggleLanguage() {
  switchLanguage(currentLang === "ru" ? "en" : "ru");
}

// Слушаем сообщения об изменении языка
function setupLanguageSync() {
  window.addEventListener("message", (event) => {
    // Проверяем, что это сообщение о языке
    if (event.data && event.data.type === "languageChange") {
      const newLang = event.data.language;

      // Меняем язык только если он отличается от текущего
      if (newLang !== currentLang) {
        switchLanguage(newLang).then(() => {
          console.log(`Language synced from parent/child: ${newLang}`);
        });
      }
    }

    // Обработка запроса языка от iframe
    if (event.data && event.data.type === "currentLanguage") {
      const newLang = event.data.language;
      if (newLang !== currentLang) {
        switchLanguage(newLang);
      }
    }

    // Отправляем текущий язык при запросе
    if (
      event.data &&
      event.data.type === "getCurrentLanguage" &&
      window.self !== window.top
    ) {
      event.source.postMessage(
        {
          type: "currentLanguage",
          language: currentLang,
        },
        event.origin
      );
    }
  });
}

async function initTranslation() {
  // Настраиваем синхронизацию языка
  setupLanguageSync();

  const savedLang = localStorage.getItem("userLanguage");
  const browserLang = navigator.language.startsWith("ru") ? "ru" : "en";
  const initialLang = savedLang || browserLang || DEFAULT_LANG;

  await switchLanguage(initialLang);

  document
    .querySelector(".language-btn")
    ?.addEventListener("click", toggleLanguage);

  // Если мы в iframe, запрашиваем текущий язык у родителя
  if (window.self !== window.top) {
    window.parent.postMessage(
      {
        type: "getCurrentLanguage",
      },
      "*"
    );
  }
}

window.toggleLanguage = toggleLanguage;
window.switchLanguage = switchLanguage;
window.getTranslation = (key) => dictionary[key] || key;
window.currentLanguage = currentLang; // Делаем глобально доступным

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTranslation);
} else {
  initTranslation();
}
