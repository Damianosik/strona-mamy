const enterLink = document.querySelector(".enter-link");
const API_URL = "http://127.0.0.1:5000";
const ADMIN_EMAIL = "sylwia.szyja14@gmail.com";
const privacyChoiceKey = "sylwia-privacy-choice";
const themePreferenceKey = "sylwia-theme-preference";
const notificationReadKey = "sylwia-welcome-notification-read-v2";

function getThemePreference() {
  try {
    return window.localStorage.getItem(themePreferenceKey);
  } catch {
    return null;
  }
}

function saveThemePreference(theme) {
  try {
    window.localStorage.setItem(themePreferenceKey, theme);
  } catch {
    // The selected appearance still works for the current visit.
  }
}

function createThemeToggle() {
  const savedTheme = getThemePreference();
  const useDarkTheme = savedTheme === "dark";
  const themeToggleHost = document.querySelector("header");

  document.body.classList.toggle("dark-theme", useDarkTheme);

  // The landing page has no header, so the selected theme still applies there
  // without adding a floating switch outside the header.
  if (!themeToggleHost) {
    return;
  }

  const toggle = document.createElement("label");
  const input = document.createElement("input");
  const track = document.createElement("span");
  const sun = document.createElement("span");
  const moon = document.createElement("span");

  toggle.className = "theme-toggle";
  toggle.setAttribute("data-theme-toggle", "");
  toggle.title = "Zmie\u0144 tryb kolorystyczny";

  input.type = "checkbox";
  input.className = "theme-toggle__input";
  input.setAttribute("aria-label", "W\u0142\u0105cz tryb ciemny");

  track.className = "theme-toggle__track";
  track.setAttribute("aria-hidden", "true");
  sun.className = "theme-toggle__sun";
  sun.textContent = "\u2600";
  moon.className = "theme-toggle__moon";
  moon.textContent = "\u263e";

  track.append(sun, moon);
  toggle.append(input, track);
  themeToggleHost.prepend(toggle);

  input.checked = useDarkTheme;
  input.setAttribute(
    "aria-label",
    useDarkTheme ? "W\u0142\u0105cz tryb jasny" : "W\u0142\u0105cz tryb ciemny",
  );

  input.addEventListener("change", () => {
    const theme = input.checked ? "dark" : "light";
    document.body.classList.toggle("dark-theme", input.checked);
    input.setAttribute(
      "aria-label",
      input.checked
        ? "W\u0142\u0105cz tryb jasny"
        : "W\u0142\u0105cz tryb ciemny",
    );
    saveThemePreference(theme);
  });
}

function createBubbleStream() {
  if (document.body.classList.contains("landing-page")) {
    return;
  }

  const bubbles = [
    [3, 12, 18, -4, 18, 0.42, ""],
    [8, 22, 24, -12, -14, 0.34, "Mg"],
    [13, 10, 20, -7, 24, 0.48, ""],
    [18, 28, 29, -19, -20, 0.3, "Ca"],
    [22, 20, 23, -2, 12, 0.4, "Zn"],
    [27, 34, 32, -25, -28, 0.27, "Si"],
    [31, 9, 19, -14, 17, 0.45, ""],
    [36, 24, 27, -9, -16, 0.35, "Fe"],
    [40, 14, 22, -21, 26, 0.42, ""],
    [44, 38, 34, -6, -30, 0.25, "B"],
    [48, 18, 25, -17, 14, 0.37, "Se"],
    [52, 11, 21, -11, -22, 0.45, ""],
    [57, 30, 31, -23, 19, 0.3, "Na"],
    [61, 15, 24, -5, -16, 0.4, ""],
    [65, 42, 35, -15, 28, 0.24, "P"],
    [69, 12, 20, -27, -18, 0.46, ""],
    [73, 26, 28, -8, 21, 0.34, "Cu"],
    [77, 20, 23, -20, -24, 0.4, "Mo"],
    [81, 36, 33, -13, 15, 0.28, "Mn"],
    [85, 10, 19, -24, -20, 0.48, ""],
    [89, 28, 30, -3, 25, 0.3, "Co"],
    [93, 18, 22, -18, -15, 0.42, "K"],
    [96, 34, 32, -10, 18, 0.26, "Cl"],
    [6, 7, 17, -22, -12, 0.4, ""],
    [55, 8, 18, -29, 12, 0.44, ""],
    [70, 7, 16, -16, -10, 0.43, ""],
  ];
  const stream = document.createElement("div");

  stream.className = "bubble-stream";
  stream.setAttribute("aria-hidden", "true");

  bubbles.forEach(([left, size, duration, delay, drift, opacity, symbol]) => {
    const bubble = document.createElement("span");
    const renderedSize = Math.round(size * 1.6);

    bubble.className = "bubble-stream__bubble";
    bubble.style.setProperty("--bubble-left", `${left}%`);
    bubble.style.setProperty("--bubble-size", `${renderedSize}px`);
    bubble.style.setProperty("--bubble-duration", `${duration}s`);
    bubble.style.setProperty("--bubble-delay", `${delay}s`);
    bubble.style.setProperty("--bubble-drift", `${drift}px`);
    bubble.style.setProperty("--bubble-opacity", opacity);
    bubble.style.setProperty(
      "--bubble-label-size",
      `${Math.min(Math.max(renderedSize * 0.46, 8), 16)}px`,
    );

    if (symbol) {
      const label = document.createElement("span");

      label.className = "bubble-stream__symbol";
      label.textContent = symbol;
      label.setAttribute("aria-hidden", "true");
      bubble.append(label);
    }

    stream.append(bubble);
  });

  document.body.insertBefore(stream, document.body.firstChild);
}

async function loadPublishedPosts() {
  const section = document.querySelector("[data-posts-section]");
  const list = document.querySelector("[data-posts-list]");
  if (!section || !list) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/posts`);
    const data = await response.json();
    if (!response.ok || !data.success || !Array.isArray(data.posts)) {
      return;
    }

    if (!data.posts.length) {
      return;
    }

    list.replaceChildren();
    data.posts.forEach(({ title, content, imageUrl }) => {
      const article = document.createElement("article");
      const heading = document.createElement("h3");
      const author = document.createElement("p");
      const text = document.createElement("p");

      article.className = "post-card";
      heading.textContent = title;
      author.className = "post-card__author";
      author.textContent = "## sz_sylwia14";
      text.textContent = content;
      article.append(heading, author);
      if (imageUrl) {
        const image = document.createElement("img");
        image.src = imageUrl;
        image.alt = title;
        image.loading = "lazy";
        article.append(image);
      }
      article.append(text);
      list.append(article);
    });
    section.dataset.hasPosts = "true";
    section.hidden = false;
  } catch (error) {
    console.warn("Nie udało się pobrać postów:", error);
  }
}

function createReadingProgress() {
  if (document.body.classList.contains("landing-page")) {
    return;
  }

  const progress = document.createElement("div");
  const bar = document.createElement("span");

  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  bar.className = "reading-progress__bar";
  progress.append(bar);
  document.body.append(progress);

  function updateProgress() {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const progressValue =
      maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;

    bar.style.transform = `scaleX(${progressValue})`;
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

function createScrollReveal() {
  const elements = document.querySelectorAll(
    ".hero-content, .hero-image, .section-text, .info-card, .letter-card, .stat-card, .books-header, .privacy-content, .books-list li, .footer",
  );
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  elements.forEach((element, index) => {
    element.classList.add("reveal-on-scroll");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 85}ms`);
    observer.observe(element);
  });
}

createBubbleStream();
createReadingProgress();
createScrollReveal();
document.body.classList.toggle("dark-theme", getThemePreference() === "dark");

function createLetterSurprise() {
  const surprise = document.querySelector("[data-letter-surprise]");

  if (!surprise) {
    return;
  }

  const revealButton = surprise.querySelector("[data-letter-reveal]");
  const message = surprise.querySelector("[data-letter-message]");
  const quote = surprise.querySelector("[data-letter-quote]");
  const nextButton = surprise.querySelector("[data-letter-next]");
  const sourceLink = surprise.querySelector("[data-letter-source]");
  const sourceLabel = surprise.querySelector("[data-letter-source-label]");
  const notes = [
    {
      text: "Krzem jest bardzo powszechny w przyrodzie, ale jego forma ma znaczenie. Krzemionka z piasku (SiO\u2082) nie jest tym samym co rozpuszczalne zwi\u0105zki krzemu obecne w wodzie i \u017cywno\u015bci; ich przyswajalno\u015b\u0107 jest r\u00f3\u017cna.",
      source: {
        label: "Przeczytaj artyku\u0142 o krzemie",
        href: "https://www.witaminaiziolo.pl/pl/n/KRZEM-PIERWIASTEK-ZDROWIA-I-ZYCIA-CZLOWIEKA/49",
      },
    },
    {
      text: "Bor jest pierwiastkiem \u015bladowym obecnym w \u017cywno\u015bci. Naukowcy badaj\u0105 jego zwi\u0105zek z metabolizmem wapnia i magnezu oraz zdrowiem ko\u015bci, ale nie ustalono dla niego normy dziennego spo\u017cycia.",
      source: {
        label: "Przeczytaj o borze",
        href: "https://ods.od.nih.gov/factsheets/Boron-HealthProfessional/",
      },
    },
    {
      text: "Magnez jest kofaktorem w ponad 300 uk\u0142adach enzymatycznych. Wspiera mi\u0119dzy innymi prac\u0119 mi\u0119\u015bni i nerw\u00f3w, produkcj\u0119 energii oraz prawid\u0142owy rytm serca.",
      source: {
        label: "Przeczytaj o magnezie",
        href: "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/",
      },
    },
    {
      text: "Cynk jest potrzebny organizmowi do tworzenia DNA i bia\u0142ek. Wspiera te\u017c odporno\u015b\u0107, gojenie ran oraz prawid\u0142owe odczuwanie smaku.",
      source: {
        label: "Przeczytaj o cynku",
        href: "https://ods.od.nih.gov/pdf/factsheets/Zinc-Consumer.pdf",
      },
    },
    {
      text: "Wap\u0144 pomaga budowa\u0107 i utrzymywa\u0107 mocne ko\u015bci, ale nie tylko. Jest potrzebny tak\u017ce do prawid\u0142owej pracy mi\u0119\u015bni, nerw\u00f3w i wielu innych proces\u00f3w w organizmie.",
      source: {
        label: "Przeczytaj o wapniu",
        href: "https://ods.od.nih.gov/factsheets/Calcium-Consumer/",
      },
    },
    {
      text: "Potas jest najwa\u017cniejszym dodatnio na\u0142adowanym minera\u0142em wewn\u0105trz kom\u00f3rek. Pomaga utrzyma\u0107 r\u00f3wnowag\u0119 p\u0142yn\u00f3w oraz prawid\u0142ow\u0105 prac\u0119 kom\u00f3rek.",
      source: {
        label: "Przeczytaj o potasie",
        href: "https://ods.od.nih.gov/pdf/factsheets/Potassium-Consumer.pdf",
      },
    },
    {
      text: "\u017belazo jest cz\u0119\u015bci\u0105 hemoglobiny \u2014 bia\u0142ka czerwonych krwinek, kt\u00f3re transportuje tlen z p\u0142uc do tkanek. Jest potrzebne r\u00f3wnie\u017c do wzrostu i prawid\u0142owej pracy kom\u00f3rek.",
      source: {
        label: "Przeczytaj o \u017celazie",
        href: "https://ods.od.nih.gov/factsheets/Iron-Consumer/",
      },
    },
    {
      text: "Jod jest potrzebny do produkcji hormon\u00f3w tarczycy. Hormony te reguluj\u0105 metabolizm i wiele innych funkcji organizmu, dlatego odpowiednia poda\u017c jodu ma znaczenie w ka\u017cdym wieku.",
      source: {
        label: "Przeczytaj o jodzie",
        href: "https://ods.od.nih.gov/factsheets/Iodine-Consumer/",
      },
    },
    {
      text: "Selen wspiera prawid\u0142ow\u0105 prac\u0119 tarczycy, tworzenie DNA i ochron\u0119 kom\u00f3rek przed uszkodzeniami oksydacyjnymi. Jest potrzebny w niewielkich ilo\u015bciach, dlatego z dawk\u0105 suplement\u00f3w warto uwa\u017ca\u0107.",
      source: {
        label: "Przeczytaj o selenie",
        href: "https://ods.od.nih.gov/factsheets/Selenium-Consumer/",
      },
    },
    {
      text: "Ciekawostka praktyczna: wi\u0119cej nie zawsze znaczy lepiej. Suplementy warto dobiera\u0107 z uwzgl\u0119dnieniem dawki, diety i przyjmowanych lek\u00f3w \u2014 najlepiej po konsultacji ze specjalist\u0105.",
    },
  ];
  let noteIndex = 0;

  function showNote(shouldAnimate = false) {
    const currentNote = notes[noteIndex];
    const source = currentNote.source;

    sourceLink.hidden = !source;

    if (source) {
      sourceLink.href = source.href;
      sourceLabel.textContent = source.label;
    }

    if (shouldAnimate) {
      quote.classList.add("is-changing");
      window.setTimeout(() => {
        quote.textContent = currentNote.text;
        quote.classList.remove("is-changing");
      }, 150);
      return;
    }

    quote.textContent = currentNote.text;
  }

  revealButton.addEventListener("click", () => {
    revealButton.hidden = true;
    revealButton.setAttribute("aria-expanded", "true");
    message.hidden = false;
    showNote();
    message.focus({ preventScroll: true });
  });

  nextButton.addEventListener("click", () => {
    noteIndex = (noteIndex + 1) % notes.length;
    showNote(true);
  });
}

createLetterSurprise();

function getPrivacyChoice() {
  try {
    return window.localStorage.getItem(privacyChoiceKey);
  } catch {
    return null;
  }
}

function savePrivacyChoice(choice) {
  try {
    window.localStorage.setItem(privacyChoiceKey, choice);
  } catch {
    // The notice can still be dismissed when local storage is unavailable.
  }
}

function createPrivacyConsent() {
  const notice = document.createElement("section");
  const panel = document.createElement("div");
  const eyebrow = document.createElement("p");
  const title = document.createElement("h2");
  const description = document.createElement("p");
  const policyLink = document.createElement("a");
  const actions = document.createElement("div");
  const rejectButton = document.createElement("button");
  const acceptButton = document.createElement("button");

  notice.className = "privacy-consent";
  notice.setAttribute("role", "dialog");
  notice.setAttribute("aria-modal", "true");
  notice.setAttribute("aria-labelledby", "privacy-consent-title");

  panel.className = "privacy-consent__panel";
  eyebrow.className = "privacy-consent__eyebrow";
  eyebrow.textContent = "Twoja prywatno\u015b\u0107";
  title.id = "privacy-consent-title";
  title.textContent = "Zanim przejdziesz dalej";
  description.textContent =
    "Strona nie u\u017cywa plik\u00f3w cookie do reklam ani analityki. Zapami\u0119tamy tylko wybran\u0105 przez Ciebie odpowied\u017a w pami\u0119ci przegl\u0105darki.";

  policyLink.className = "privacy-consent__link";
  policyLink.href = "polityka-prywatnosci.html";
  policyLink.textContent = "Przeczytaj polityk\u0119 prywatno\u015bci";

  actions.className = "privacy-consent__actions";
  rejectButton.className =
    "privacy-consent__button privacy-consent__button--secondary";
  rejectButton.type = "button";
  rejectButton.textContent = "Odrzucam";
  acceptButton.className =
    "privacy-consent__button privacy-consent__button--primary";
  acceptButton.type = "button";
  acceptButton.textContent = "Akceptuj\u0119";

  function close(choice) {
    savePrivacyChoice(choice);
    document.body.classList.remove("privacy-consent-open");
    notice.remove();
  }

  rejectButton.addEventListener("click", () => close("rejected"));
  acceptButton.addEventListener("click", () => close("accepted"));

  actions.append(rejectButton, acceptButton);
  panel.append(eyebrow, title, description, policyLink, actions);
  notice.append(panel);
  document.body.append(notice);
  document.body.classList.add("privacy-consent-open");
  acceptButton.focus();
}

function showPrivacyConsentOnFirstClick() {
  if (getPrivacyChoice()) {
    return;
  }

  function handleFirstClick(event) {
    if (event.target.closest("[data-theme-toggle]")) {
      return;
    }

    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener("click", handleFirstClick, true);
    createPrivacyConsent();
  }

  document.addEventListener("click", handleFirstClick, true);
}

if (enterLink) {
  enterLink.addEventListener("click", (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    document.body.classList.add("is-entering");

    window.setTimeout(() => {
      window.location.assign(enterLink.href);
    }, 560);
  });
} else {
  document.body.classList.add("page-ready");
}

showPrivacyConsentOnFirstClick();

function createAccountSystem() {
  const widget = document.createElement("div");
  const trigger = document.createElement("button");
  const dialog = document.createElement("dialog");
  const postDialog = document.createElement("dialog");
  const dashboard = document.querySelector(".dashboard-nav");

  widget.className = "account-widget";
  trigger.className = "account-trigger";
  trigger.type = "button";
  trigger.innerHTML = `
    <span class="account-trigger__avatar" aria-hidden="true">S</span>
    <span class="account-trigger__copy">
      <strong data-account-trigger-name>Konto</strong>
      <small data-account-trigger-status>Zaloguj się</small>
    </span>
    <span class="account-trigger__chevron" aria-hidden="true">⌄</span>
  `;
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("data-account-trigger", "");

  const settings = document.createElement("button");
  settings.className = "account-settings";
  settings.type = "button";
  settings.setAttribute("aria-label", "Otwórz ustawienia konta");
  settings.setAttribute("title", "Ustawienia konta");
  settings.setAttribute("data-account-settings", "");
  settings.innerHTML = '<span aria-hidden="true">⚙</span>';

  const notifications = document.createElement("button");
  notifications.className = "account-notifications";
  notifications.type = "button";
  notifications.setAttribute("aria-label", "Otwórz powiadomienia");
  notifications.setAttribute("title", "Powiadomienia");
  notifications.innerHTML =
    '<span aria-hidden="true">&#128276;</span><b data-notification-count aria-label="Nieprzeczytane powiadomienia"></b>';
  let notificationWasRead = false;
  try {
    notificationWasRead =
      window.localStorage.getItem(notificationReadKey) === "true";
  } catch {
    notificationWasRead = false;
  }
  notifications.classList.toggle("has-unread", !notificationWasRead);

  const notificationsDialog = document.createElement("dialog");
  notificationsDialog.className = "account-dialog notifications-dialog";
  notificationsDialog.setAttribute("aria-labelledby", "notifications-title");
  notificationsDialog.innerHTML = `
    <div class="account-dialog__panel">
      <button class="account-dialog__close" type="button" data-notifications-close aria-label="Zamknij">&times;</button>
      <p class="eyebrow">Centrum informacji</p>
      <h2 id="notifications-title">Powiadomienia</h2>
      <div data-notifications-list>
        <article class="notification-item">
          <span class="notification-item__icon" aria-hidden="true">✦</span>
          <div><strong>Witaj na stronie</strong><p>Miło Cię widzieć. Sprawdź swoje konto i ustawienia.</p></div>
        </article>
      </div>
    </div>
  `;

  const settingsDialog = document.createElement("dialog");
  settingsDialog.className = "account-dialog account-settings-dialog";
  settingsDialog.setAttribute("aria-labelledby", "settings-dialog-title");
  settingsDialog.innerHTML = `
    <div class="account-dialog__panel">
      <button class="account-dialog__close" type="button" data-settings-close aria-label="Zamknij">&times;</button>
      <p class="eyebrow">Dopasuj stronę</p>
      <h2 id="settings-dialog-title">Ustawienia</h2>
      <div class="settings-tabs" role="tablist" aria-label="Zakładki ustawień">
        <button class="settings-tab is-active" type="button" role="tab" aria-selected="true" data-settings-tab="appearance">Wygląd</button>
        <button class="settings-tab" type="button" role="tab" aria-selected="false" data-settings-tab="admin" data-admin-panel-tab hidden>Panel</button>
        <button class="settings-tab" type="button" role="tab" aria-selected="false" data-settings-tab="analytics" data-admin-analytics-tab hidden>Statystyki</button>
      </div>
      <section class="settings-section" data-settings-section="appearance">
        <h3>Kolor strony</h3>
        <p class="account-dialog__intro">Wybierz wygląd, który jest dla Ciebie wygodniejszy.</p>
        <div class="settings-options">
          <button class="settings-option" type="button" data-theme-option="light"><span aria-hidden="true">☀</span> Jasny</button>
          <button class="settings-option" type="button" data-theme-option="dark"><span aria-hidden="true">☾</span> Ciemny</button>
        </div>
      </section>
      <section class="settings-section" data-settings-section="admin" hidden>
        <h3>Panel administratora</h3>
        <p class="account-dialog__intro">Zarządzaj publikacjami z jednego miejsca.</p>
        <div class="settings-options">
          <button class="settings-option" type="button" data-admin-action="post">Dodaj post</button>
          <button class="settings-option" type="button" data-admin-action="planner">Plan publikacji</button>
        </div>
        <div class="admin-planner" data-admin-planner>
          <h3>Kalendarz publikacji</h3>
          <form class="planner-form" data-planner-form>
            <input type="date" name="date" required aria-label="Data publikacji" />
            <input type="text" name="title" maxlength="120" required placeholder="Tytuł powiadomienia" aria-label="Tytuł powiadomienia" />
            <textarea name="description" rows="3" maxlength="500" required placeholder="Opis planu publikacji" aria-label="Opis planu publikacji"></textarea>
            <button class="button primary" type="submit">Dodaj plan</button>
          </form>
          <p class="account-form__message" data-planner-status role="status"></p>
          <div class="planner-list" data-planner-list></div>
        </div>
        <div class="admin-moderation">
          <h3>Moderacja kont</h3>
          <form class="admin-user-form" data-admin-user-form>
            <label class="account-field">E-mail konta<input type="email" name="email" autocomplete="email" required /></label>
            <div class="admin-user-actions">
              <button class="settings-option admin-user-action--block" type="button" data-admin-user-action="block">Zablokuj konto</button>
              <button class="settings-option" type="button" data-admin-user-action="unblock">Odblokuj konto</button>
            </div>
            <p class="account-form__message" data-admin-user-message role="status"></p>
          </form>
          <h3>Opublikowane posty</h3>
          <div class="admin-post-list" data-admin-post-list></div>
        </div>
      </section>
      <section class="settings-section analytics-section" data-settings-section="analytics" hidden>
        <div class="analytics-summary"><div><span>Wyświetlenia</span><strong data-analytics-views>0</strong></div><div><span>Odwiedzający</span><strong data-analytics-visitor-count>0</strong></div></div>
        <h3>Historia po Gmailu</h3>
        <div class="analytics-list" data-analytics-accounts></div>
        <h3>Goście anonimowi</h3>
        <p class="account-dialog__intro">Goście są rozpoznawani tylko po anonimowym identyfikatorze tej przeglądarki.</p>
        <div class="analytics-list" data-analytics-guests></div>
      </section>
    </div>
  `;

  postDialog.className = "account-dialog post-creator-dialog";
  postDialog.setAttribute("aria-labelledby", "post-creator-title");
  postDialog.innerHTML = `
    <div class="account-dialog__panel">
      <button class="account-dialog__close" type="button" data-post-close aria-label="Zamknij">&times;</button>
      <p class="eyebrow">Nowa publikacja</p>
      <h2 id="post-creator-title">Dodaj post</h2>
      <form class="account-form" data-post-form>
        <label class="account-field">
          Tytuł posta
          <input type="text" name="title" maxlength="140" required />
        </label>
        <label class="account-field">
          Treść
          <textarea name="content" rows="7" maxlength="5000" required></textarea>
        </label>
        <label class="account-field">
          Zdjęcie
          <input type="file" name="image" accept="image/*" />
        </label>
        <p class="account-form__message" data-post-message role="status"></p>
        <button class="button primary account-form__submit" type="submit">Opublikuj post</button>
      </form>
    </div>
  `;

  const resetDialog = document.createElement("dialog");
  resetDialog.className = "account-dialog account-reset-dialog";
  resetDialog.setAttribute("aria-labelledby", "account-reset-title");
  resetDialog.innerHTML = `
    <div class="account-dialog__panel">
      <button class="account-dialog__close" type="button" data-reset-close aria-label="Zamknij">&times;</button>
      <p class="eyebrow">Odzyskiwanie dostępu</p>
      <h2 id="account-reset-title">Zresetuj hasło</h2>
      <p class="account-dialog__intro">Podaj e-mail konta. Wyślemy na niego bezpieczny link do ustawienia nowego hasła.</p>
      <form class="account-form" data-reset-form novalidate>
        <label class="account-field">
          E-mail
          <input type="email" name="email" autocomplete="email" required />
        </label>
        <p class="account-form__message" data-reset-message role="status"></p>
        <button class="button primary account-form__submit" type="submit">Wyślij link</button>
      </form>
    </div>
  `;

  dialog.className = "account-dialog";
  dialog.setAttribute("aria-labelledby", "account-dialog-title");
  dialog.innerHTML = `
    <div class="account-dialog__panel">
      <button class="account-dialog__close" type="button" data-account-close aria-label="Zamknij">&times;</button>
      <p class="eyebrow">Twoja przestrzeń</p>
      <h2 id="account-dialog-title" data-account-title>Witaj ponownie</h2>
      <p class="account-dialog__intro" data-account-intro>Zaloguj się, aby korzystać ze swojego konta na tej stronie.</p>
      <form id="auth-form" class="account-form" data-account-form novalidate>
        <label class="account-field" data-account-name-field hidden>
          Imię
          <input id="input-name" type="text" name="name" autocomplete="name" minlength="2" />
        </label>
        <label class="account-field">
          E-mail
          <input id="input-email" type="email" name="email" autocomplete="email" required />
        </label>
        <label class="account-field">
          Hasło
          <input id="input-password" type="password" name="password" autocomplete="current-password" required />
        </label>
        <p class="account-form__message error-message" data-account-message role="status"></p>
        <button id="js-submit" class="button primary account-form__submit" type="submit" data-account-submit>Zaloguj się</button>
      </form>
      <button class="account-reset" type="button" data-account-reset>Nie pamiętam hasła</button>
      <button class="account-switch" type="button" data-account-switch>Nie masz konta? Zarejestruj się</button>
      <div class="account-logged-in" data-account-logged-in hidden>
        <p data-account-welcome></p>
        <button class="button secondary" type="button" data-account-logout>Wyloguj się</button>
      </div>
    </div>
  `;

  widget.append(
    trigger,
    notifications,
    settings,
    dialog,
    resetDialog,
    settingsDialog,
    notificationsDialog,
    postDialog,
  );
  if (dashboard) {
    const dashboardBar = document.createElement("div");

    dashboardBar.className = "dashboard-bar";
    dashboard.insertAdjacentElement("beforebegin", dashboardBar);
    dashboardBar.append(dashboard, widget);
  } else {
    document.body.append(widget);
  }

  const form = dialog.querySelector("[data-account-form]");
  const title = dialog.querySelector("[data-account-title]");
  const intro = dialog.querySelector("[data-account-intro]");
  const message = dialog.querySelector("[data-account-message]");
  const nameField = dialog.querySelector("[data-account-name-field]");
  const submit = dialog.querySelector("[data-account-submit]");
  const switchButton = dialog.querySelector("[data-account-switch]");
  const loggedIn = dialog.querySelector("[data-account-logged-in]");
  const welcome = dialog.querySelector("[data-account-welcome]");
  const resetButton = dialog.querySelector("[data-account-reset]");
  const resetForm = resetDialog.querySelector("[data-reset-form]");
  const resetMessage = resetDialog.querySelector("[data-reset-message]");
  const triggerName = trigger.querySelector("[data-account-trigger-name]");
  const triggerStatus = trigger.querySelector("[data-account-trigger-status]");
  const triggerAvatar = trigger.querySelector(".account-trigger__avatar");
  const notificationList = notificationsDialog.querySelector(
    "[data-notifications-list]",
  );
  const notificationCount = notifications.querySelector(
    "[data-notification-count]",
  );
  const addPostButton = document.querySelector("[data-add-post]");
  const postsSection = document.querySelector("[data-posts-section]");
  const adminPanelTab = settingsDialog.querySelector("[data-admin-panel-tab]");
  const adminPanelSection = settingsDialog.querySelector(
    '[data-settings-section="admin"]',
  );
  const analyticsTab = settingsDialog.querySelector(
    "[data-admin-analytics-tab]",
  );
  const analyticsViews = settingsDialog.querySelector("[data-analytics-views]");
  const analyticsVisitorCount = settingsDialog.querySelector(
    "[data-analytics-visitor-count]",
  );
  const analyticsAccounts = settingsDialog.querySelector(
    "[data-analytics-accounts]",
  );
  const analyticsGuests = settingsDialog.querySelector(
    "[data-analytics-guests]",
  );
  const postForm = postDialog.querySelector("[data-post-form]");
  const postMessage = postDialog.querySelector("[data-post-message]");
  const adminPlanner = settingsDialog.querySelector("[data-admin-planner]");
  const plannerForm = adminPlanner.querySelector("[data-planner-form]");
  const plannerList = adminPlanner.querySelector("[data-planner-list]");
  const plannerStatus = adminPlanner.querySelector("[data-planner-status]");
  const adminUserForm = settingsDialog.querySelector("[data-admin-user-form]");
  const adminUserMessage = settingsDialog.querySelector(
    "[data-admin-user-message]",
  );
  const adminPostList = settingsDialog.querySelector("[data-admin-post-list]");
  notificationCount.hidden = notificationWasRead;
  let authApi = window.firebaseAccount;
  let currentUser = null;
  let isRegistering = false;

  function isAdminSession() {
    return currentUser?.email?.toLowerCase() === ADMIN_EMAIL;
  }

  async function loadAnalytics() {
    if (!isAdminSession()) {
      return;
    }
    try {
      const token = await authApi?.getIdToken();
      const response = await fetch(`${API_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Nie udało się pobrać statystyk.");
      }
      analyticsViews.textContent = String(data.views || 0);
      analyticsVisitorCount.textContent = String(
        (data.accounts?.length || 0) + (data.guests?.length || 0),
      );
      analyticsAccounts.replaceChildren();
      analyticsGuests.replaceChildren();
      const renderVisitor = (visitor, target, label) => {
        const item = document.createElement("article");
        const name = document.createElement("strong");
        const details = document.createElement("span");
        item.className = "analytics-visitor";
        name.textContent = label || visitor.email || visitor.name || "Gość";
        details.textContent = `${visitor.visits || 0} wizyt${visitor.lastSeen ? ` · ${new Date(visitor.lastSeen).toLocaleString("pl-PL")}` : ""}`;
        item.append(name, details);
        target.append(item);
      };
      data.accounts.forEach((account) =>
        renderVisitor(account, analyticsAccounts),
      );
      data.guests.forEach((guest) =>
        renderVisitor(
          guest,
          analyticsGuests,
          `Gość #${guest.id.slice(0, 6).toUpperCase()}`,
        ),
      );
    } catch (error) {
      analyticsAccounts.replaceChildren();
      analyticsGuests.replaceChildren();
      const message = document.createElement("p");
      message.className = "account-form__message is-error";
      message.textContent = error.message;
      analyticsAccounts.append(message);
    }
  }

  function setAdminUserMessage(text, isError = true) {
    adminUserMessage.textContent = text;
    adminUserMessage.classList.toggle("is-error", isError);
  }

  function renderAdminPostMessage(text, isError = false) {
    const message = document.createElement("p");

    message.className = "account-form__message";
    message.classList.toggle("is-error", isError);
    message.textContent = text;
    adminPostList.replaceChildren(message);
  }

  async function deleteAdminPost(post) {
    if (!isAdminSession() || !window.confirm(`Usunąć post „${post.title}”?`)) {
      return;
    }

    try {
      const token = await authApi?.getIdToken();
      const response = await fetch(`${API_URL}/admin/posts/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Nie udało się usunąć posta.");
      }
      await Promise.all([loadAdminPosts(), loadPublishedPosts()]);
    } catch (error) {
      renderAdminPostMessage(error.message, true);
    }
  }

  async function loadAdminPosts() {
    if (!isAdminSession()) {
      return;
    }

    renderAdminPostMessage("Wczytywanie postów...");
    try {
      const token = await authApi?.getIdToken();
      const response = await fetch(`${API_URL}/admin/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok || !data.success || !Array.isArray(data.posts)) {
        throw new Error(data.error || "Nie udało się pobrać postów.");
      }

      adminPostList.replaceChildren();
      if (!data.posts.length) {
        renderAdminPostMessage("Brak opublikowanych postów.");
        return;
      }

      data.posts.forEach((post) => {
        const item = document.createElement("article");
        const copy = document.createElement("div");
        const title = document.createElement("strong");
        const author = document.createElement("span");
        const remove = document.createElement("button");

        item.className = "admin-post-item";
        copy.className = "admin-post-item__copy";
        title.textContent = post.title || "Post bez tytułu";
        author.textContent = post.authorEmail || "Brak informacji o autorze";
        remove.className = "admin-post-remove";
        remove.type = "button";
        remove.setAttribute("aria-label", `Usuń post: ${title.textContent}`);
        remove.title = "Usuń post";
        remove.textContent = "×";
        remove.addEventListener("click", () => deleteAdminPost(post));
        copy.append(title, author);
        item.append(copy, remove);
        adminPostList.append(item);
      });
    } catch (error) {
      renderAdminPostMessage(error.message, true);
    }
  }

  async function changeAccountBlockStatus(blocked) {
    if (!isAdminSession()) {
      return;
    }

    const email = String(new FormData(adminUserForm).get("email"))
      .trim()
      .toLowerCase();
    if (!email) {
      setAdminUserMessage("Podaj e-mail konta.");
      return;
    }

    const buttons = adminUserForm.querySelectorAll("button");
    buttons.forEach((button) => {
      button.disabled = true;
    });
    setAdminUserMessage("");
    try {
      const token = await authApi?.getIdToken();
      const response = await fetch(`${API_URL}/admin/users/block`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, blocked }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(
          result?.error || "Nie udało się zmienić dostępu konta.",
        );
      }
      setAdminUserMessage(
        blocked ? "Konto zostało zablokowane." : "Konto zostało odblokowane.",
        false,
      );
    } catch (error) {
      setAdminUserMessage(error.message);
    } finally {
      buttons.forEach((button) => {
        button.disabled = false;
      });
    }
  }

  async function trackVisit(user) {
    try {
      if (window.sessionStorage.getItem("sylwia-visit-sent-v1")) {
        return;
      }
      let visitorId = window.localStorage.getItem("sylwia-visitor-id-v1");
      if (!visitorId) {
        visitorId =
          window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
        window.localStorage.setItem("sylwia-visitor-id-v1", visitorId);
      }
      const token = user ? await authApi?.getIdToken() : null;
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      await fetch(`${API_URL}/analytics/visit`, {
        method: "POST",
        headers,
        body: JSON.stringify({ visitorId }),
      });
      window.sessionStorage.setItem("sylwia-visit-sent-v1", "true");
    } catch (error) {
      console.warn("Nie udało się zarejestrować wizyty:", error);
    }
  }

  function setPostMessage(text, isError = true) {
    postMessage.textContent = text;
    postMessage.classList.toggle("is-error", isError);
  }

  function formatNotificationMessage(message) {
    return String(message).replace(/^Invalid Date:\s*/, "Plan publikacji: ");
  }

  async function deleteNotification(notification) {
    if (!isAdminSession()) {
      return;
    }

    try {
      const token = await authApi?.getIdToken();
      const response = await fetch(
        `${API_URL}/admin/notifications/${notification.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Nie udało się usunąć wiadomości.");
      }
      await loadNotifications();
    } catch (error) {
      console.warn("Nie udało się usunąć wiadomości:", error);
    }
  }

  async function loadNotifications() {
    try {
      const response = await fetch(`${API_URL}/notifications`);
      const data = await response.json();
      if (!response.ok || !data.success || !Array.isArray(data.notifications)) {
        return;
      }
      if (!data.notifications.length) {
        return;
      }

      notificationList.replaceChildren();
      data.notifications.forEach((notification) => {
        const { title, message } = notification;
        const item = document.createElement("article");
        const icon = document.createElement("span");
        const content = document.createElement("div");
        const heading = document.createElement("strong");
        const text = document.createElement("p");

        item.className = "notification-item";
        icon.className = "notification-item__icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = "✦";
        heading.textContent = title;
        text.textContent = formatNotificationMessage(message);
        content.append(heading, text);
        item.append(icon, content);
        if (isAdminSession()) {
          const remove = document.createElement("button");

          remove.className = "notification-item__remove";
          remove.type = "button";
          remove.setAttribute("aria-label", `Usuń wiadomość: ${title}`);
          remove.title = "Usuń wiadomość";
          remove.textContent = "×";
          remove.addEventListener("click", () =>
            deleteNotification(notification),
          );
          item.append(remove);
        }
        notificationList.append(item);
      });
      notificationCount.textContent = String(data.notifications.length);
      notificationCount.hidden = notificationWasRead;
      notifications.classList.toggle("has-unread", !notificationWasRead);
    } catch (error) {
      console.warn("Nie udało się pobrać powiadomień:", error);
    }
  }

  function setMessage(text, isError = true) {
    message.textContent = text;
    message.classList.toggle("is-error", isError);
  }

  function updateDialog() {
    const session = currentUser;
    const isAdmin = isAdminSession();
    settings.hidden = !isAdmin;
    addPostButton.hidden = !isAdmin;
    adminPanelTab.hidden = !isAdmin;
    analyticsTab.hidden = !isAdmin;
    if (!isAdmin) {
      adminPanelSection.hidden = true;
    }
    postsSection.hidden = !isAdmin && postsSection.dataset.hasPosts !== "true";
    form.hidden = Boolean(session);
    switchButton.hidden = Boolean(session);
    resetButton.hidden = Boolean(session) || isRegistering;
    loggedIn.hidden = !session;

    if (session) {
      const displayName =
        session.displayName || session.email?.split("@")[0] || "użytkowniku";
      title.textContent = `Cześć, ${displayName}`;
      intro.textContent = "Twoje konto jest aktywne na tym urządzeniu.";
      welcome.textContent = session.email;
      triggerName.textContent = displayName;
      triggerStatus.textContent = "Aktywne konto";
      triggerAvatar.textContent = displayName.charAt(0).toUpperCase();
      return;
    }

    title.textContent = isRegistering ? "Załóż konto" : "Witaj ponownie";
    intro.textContent = isRegistering
      ? "Utwórz konto, aby zapisać swoją sesję w tej przeglądarce."
      : "Zaloguj się, aby korzystać ze swojego konta na tej stronie.";
    nameField.hidden = !isRegistering;
    nameField.querySelector("input").required = isRegistering;
    submit.textContent = isRegistering ? "Utwórz konto" : "Zaloguj się";
    switchButton.textContent = isRegistering
      ? "Masz już konto? Zaloguj się"
      : "Nie masz konta? Zarejestruj się";
    triggerName.textContent = "Konto";
    triggerStatus.textContent = "Zaloguj się";
    triggerAvatar.textContent = "S";
    resetButton.hidden = isRegistering;
  }

  function openDialog() {
    updateDialog();
    setMessage("");
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  trigger.addEventListener("click", openDialog);
  settings.addEventListener("click", () => {
    settingsDialog.showModal();
    loadAnalytics();
  });
  notifications.addEventListener("click", async () => {
    await loadNotifications();
    notificationsDialog.showModal();
    notificationCount.hidden = true;
    notifications.classList.remove("has-unread");
    try {
      window.localStorage.setItem(notificationReadKey, "true");
    } catch {
      // Powiadomienie pozostaje odczytane w bieżącej sesji.
    }
  });
  settingsDialog
    .querySelector("[data-settings-close]")
    .addEventListener("click", () => settingsDialog.close());
  notificationsDialog
    .querySelector("[data-notifications-close]")
    .addEventListener("click", () => notificationsDialog.close());

  postDialog
    .querySelector("[data-post-close]")
    .addEventListener("click", () => postDialog.close());

  function openPostCreator() {
    postForm.reset();
    setPostMessage("");
    postDialog.showModal();
  }

  addPostButton.addEventListener("click", openPostCreator);

  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = postForm.querySelector("[type=submit]");
    submitButton.disabled = true;
    setPostMessage("");

    try {
      const token = await authApi?.getIdToken();
      const response = await fetch(`${API_URL}/admin/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: new FormData(postForm),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Nie udało się opublikować posta.");
      }
      postForm.reset();
      setPostMessage("Post został opublikowany.", false);
      await Promise.all([loadPublishedPosts(), loadAdminPosts()]);
    } catch (error) {
      setPostMessage(error.message);
    } finally {
      submitButton.disabled = false;
    }
  });

  settingsDialog.querySelectorAll("[data-settings-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const selectedTab = tab.dataset.settingsTab;
      const isAdminOnlyTab =
        selectedTab === "admin" || selectedTab === "analytics";
      if (isAdminOnlyTab && !isAdminSession()) {
        return;
      }
      settingsDialog.querySelectorAll("[data-settings-tab]").forEach((item) => {
        const active = item === tab;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      settingsDialog
        .querySelectorAll("[data-settings-section]")
        .forEach((section) => {
          section.hidden = section.dataset.settingsSection !== selectedTab;
        });
      if (selectedTab === "admin") {
        loadAdminPosts();
      }
    });
  });

  settingsDialog.querySelectorAll("[data-admin-action]").forEach((action) => {
    action.addEventListener("click", () => {
      if (!isAdminSession()) {
        return;
      }

      if (action.dataset.adminAction === "post") {
        settingsDialog.close();
        openPostCreator();
        return;
      }

      adminPlanner.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  adminUserForm
    .querySelectorAll("[data-admin-user-action]")
    .forEach((action) => {
      action.addEventListener("click", () => {
        changeAccountBlockStatus(action.dataset.adminUserAction === "block");
      });
    });

  const plannerKey = "sylwia-publication-plans-v1";
  const getPlans = () => {
    try {
      return JSON.parse(window.localStorage.getItem(plannerKey)) || [];
    } catch {
      return [];
    }
  };
  const savePlans = (plans) => {
    window.localStorage.setItem(plannerKey, JSON.stringify(plans));
  };
  const formatPlanDate = (rawDate) => {
    const date = new Date(`${rawDate}T12:00:00`);

    return Number.isNaN(date.getTime())
      ? rawDate || "Bez daty"
      : date.toLocaleDateString("pl-PL");
  };
  const renderPlans = () => {
    plannerList.replaceChildren();
    getPlans()
      .sort((first, second) => first.date.localeCompare(second.date))
      .forEach((plan) => {
        const item = document.createElement("article");
        const date = document.createElement("time");
        const copy = document.createElement("div");
        const title = document.createElement("strong");
        const description = document.createElement("span");
        const actions = document.createElement("div");
        const remove = document.createElement("button");

        item.className = "planner-item";
        date.dateTime = plan.date;
        date.textContent = formatPlanDate(plan.date);
        copy.className = "planner-item__copy";
        title.textContent = plan.title || "Plan publikacji";
        description.textContent = plan.description || plan.idea || "Brak opisu";
        copy.append(title, description);
        actions.className = "planner-item__actions";
        if (!plan.notified) {
          const notify = document.createElement("button");

          notify.type = "button";
          notify.className = "planner-item__notify";
          notify.textContent = "Wyślij";
          notify.addEventListener("click", async () => {
            notify.disabled = true;
            plannerStatus.textContent = "Wysyłanie powiadomienia...";
            plannerStatus.classList.remove("is-error");
            try {
              await notifyParticipantsAboutPlan(plan);
              savePlans(
                getPlans().map((entry) =>
                  entry.id === plan.id ? { ...entry, notified: true } : entry,
                ),
              );
              renderPlans();
              plannerStatus.textContent = "Uczestnicy otrzymali powiadomienie.";
            } catch (error) {
              plannerStatus.textContent = error.message;
              plannerStatus.classList.add("is-error");
              notify.disabled = false;
            }
          });
          actions.append(notify);
        }
        remove.type = "button";
        remove.className = "planner-item__remove";
        remove.setAttribute("aria-label", "Usuń plan");
        remove.title = "Usuń plan";
        remove.textContent = "×";
        remove.addEventListener("click", () => {
          savePlans(getPlans().filter((entry) => entry.id !== plan.id));
          renderPlans();
        });
        actions.append(remove);
        item.append(date, copy, actions);
        plannerList.append(item);
      });
  };

  async function notifyParticipantsAboutPlan(plan) {
    const token = await authApi?.getIdToken();
    const description = plan.description || plan.idea || "Brak opisu";
    const response = await fetch(`${API_URL}/admin/notifications`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: new URLSearchParams({
        title: plan.title || "Nowy plan publikacji",
        message: `${formatPlanDate(plan.date)}: ${description}`,
      }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || !result?.success) {
      throw new Error(result?.error || "Nie udało się wysłać powiadomienia.");
    }
    await loadNotifications();
  }

  plannerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!isAdminSession()) {
      return;
    }

    const data = new FormData(plannerForm);
    const plan = {
      id: Date.now(),
      date: String(data.get("date")),
      title: String(data.get("title")).trim(),
      description: String(data.get("description")).trim(),
      notified: false,
    };
    const plans = getPlans();

    plans.push(plan);
    savePlans(plans);
    plannerForm.reset();
    renderPlans();
    plannerStatus.textContent = "Plan zapisany. Wysyłanie powiadomienia...";
    plannerStatus.classList.remove("is-error");
    try {
      await notifyParticipantsAboutPlan(plan);
      savePlans(
        getPlans().map((entry) =>
          entry.id === plan.id ? { ...entry, notified: true } : entry,
        ),
      );
      renderPlans();
      plannerStatus.textContent =
        "Plan zapisany, a uczestnicy otrzymali powiadomienie.";
    } catch (error) {
      plannerStatus.textContent = `Plan zapisany, ale ${error.message}`;
      plannerStatus.classList.add("is-error");
    }
  });
  renderPlans();

  settingsDialog.querySelectorAll("[data-theme-option]").forEach((option) => {
    option.addEventListener("click", () => {
      const theme = option.dataset.themeOption;
      document.body.classList.toggle("dark-theme", theme === "dark");
      saveThemePreference(theme);
    });
  });
  dialog
    .querySelector("[data-account-close]")
    .addEventListener("click", () => dialog.close());

  switchButton.addEventListener("click", () => {
    isRegistering = !isRegistering;
    form.reset();
    setMessage("");
    updateDialog();
  });

  resetButton.addEventListener("click", async () => {
    resetForm.reset();
    resetMessage.textContent = "";
    resetMessage.classList.remove("is-error");
    dialog.close();
    resetDialog.showModal();
  });

  resetDialog
    .querySelector("[data-reset-close]")
    .addEventListener("click", () => resetDialog.close());

  resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = String(new FormData(resetForm).get("email"))
      .trim()
      .toLowerCase();
    const resetSubmit = resetForm.querySelector("button[type=submit]");
    resetSubmit.disabled = true;
    resetMessage.textContent = "";
    resetMessage.classList.remove("is-error");

    try {
      if (!authApi) {
        throw new Error(
          "Firebase jest jeszcze uruchamiany. Spróbuj ponownie za chwilę.",
        );
      }
      await authApi.resetPassword(email);
      resetMessage.textContent =
        "Link do ustawienia nowego hasła został wysłany na e-mail.";
    } catch (error) {
      resetMessage.textContent = getFirebaseErrorMessage(error);
      resetMessage.classList.add("is-error");
    } finally {
      resetSubmit.disabled = false;
    }
  });

  dialog
    .querySelector("[data-account-logout]")
    .addEventListener("click", async () => {
      await authApi?.signOut();
      currentUser = null;
      isRegistering = false;
      updateDialog();
      setMessage("Wylogowano.", false);
    });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = String(formData.get("email")).trim().toLowerCase();
    const password = String(formData.get("password"));
    submit.disabled = true;
    setMessage("");

    if (!authApi) {
      setMessage(
        "Logowanie jest jeszcze uruchamiane. Spróbuj ponownie za chwilę.",
      );
      submit.disabled = false;
      return;
    }

    try {
      const name = String(formData.get("name")).trim();
      if (isRegistering && name.length < 2) {
        setMessage("Podaj imię mające co najmniej 2 znaki.");
        submit.disabled = false;
        return;
      }

      if (isRegistering) {
        const result = await authApi.createOrSignInWithEmail(
          name,
          email,
          password,
        );
        setMessage(
          result.created ? "Konto zostało utworzone." : "Zalogowano.",
          false,
        );
        form.reset();
        return;
      }

      const result = await authApi.createOrSignInWithEmail(
        name || email.split("@")[0],
        email,
        password,
      );
      setMessage(
        result.created ? "Konto zostało utworzone." : "Zalogowano.",
        false,
      );
      form.reset();
    } catch (error) {
      setMessage(getFirebaseErrorMessage(error));
    }

    submit.disabled = false;
  });

  updateDialog();
  loadNotifications();
  window.setInterval(loadNotifications, 60_000);

  function connectFirebase(firebaseApi) {
    authApi = firebaseApi;
    authApi.subscribe((user) => {
      currentUser = user;
      trackVisit(user);
      updateDialog();
    });
    updateDialog();
  }

  if (authApi) {
    connectFirebase(authApi);
  } else {
    document.addEventListener(
      "firebase-account-ready",
      () => {
        connectFirebase(window.firebaseAccount);
      },
      { once: true },
    );
  }
}

function createMobileNavigation() {
  const dashboard = document.querySelector(".dashboard-nav");
  const toggle = document.querySelector(".mobile-nav-toggle");
  const links = document.querySelector(".dashboard-nav__links");

  if (!dashboard || !toggle || !links) {
    return;
  }

  function closeMenu() {
    dashboard.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Otwórz menu");
  }

  toggle.addEventListener("click", () => {
    const isOpen = dashboard.classList.toggle("is-open");

    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Zamknij menu" : "Otwórz menu");
  });

  links.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!dashboard.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

function getFirebaseErrorMessage(error) {
  console.error("Błąd Firebase Authentication:", error);

  if (!error?.code && error?.message) {
    return error.message;
  }

  if (error?.code === "auth/api-key-not-valid") {
    return "Nieprawidłowy klucz Firebase Web API. Skopiuj aktualny apiKey z Firebase Console → Ustawienia projektu → Ogólny → Twoje aplikacje i podmień go w firebase-auth.js.";
  }

  const code = error?.code || "auth/unknown-error";
  const message = error?.message || "Nieznany błąd Firebase Authentication.";
  return `Błąd Firebase (${code}): ${message}`;
}

function createFeatureInteractions() {
  document.querySelectorAll("[data-gallery-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.galleryFilter;
      document.querySelectorAll("[data-gallery-filter]").forEach((item) => {
        item.classList.toggle("is-active", item === button);
      });
      document.querySelectorAll("[data-gallery-item]").forEach((item) => {
        item.hidden = filter !== "all" && item.dataset.galleryItem !== filter;
      });
    });
  });

  const contactForm = document.querySelector("[data-contact-form]");
  const contactStatus = document.querySelector("[data-contact-status]");
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get("name")).trim();
    const email = String(data.get("email")).trim();
    const message = String(data.get("message")).trim();
    const subject = encodeURIComponent(`Współpraca od ${name}`);
    const body = encodeURIComponent(
      `Imię lub marka: ${name}\nE-mail: ${email}\n\n${message}`,
    );
    contactStatus.textContent = "Otwieram aplikację pocztową...";
    window.location.href = `mailto:sylwia.szyja14@gmail.com?subject=${subject}&body=${body}`;
  });

  const inspiration = document.querySelector("[data-daily-inspiration]");
  const inspirationSource = document.querySelector(
    "[data-daily-inspiration-source]",
  );
  const inspirations = [
    "Zatrzymaj się na chwilę. Najlepsze kadry powstają wtedy, gdy naprawdę patrzysz.",
    "Mały detal potrafi nadać całej stylizacji własny charakter.",
    "Dobra przestrzeń nie musi być idealna. Powinna być Twoja.",
    "Inspiracja zaczyna się od ciekawości i jednego odważnego pomysłu.",
  ];
  if (inspiration && inspirationSource) {
    const dayIndex = Math.floor(Date.now() / 86400000) % inspirations.length;
    inspiration.textContent = inspirations[dayIndex];
    inspirationSource.textContent = "Codzienna myśl dla dobrego początku.";
  }

  const pollKey = "sylwia-poll-choice-v1";
  const pollOptions = document.querySelector("[data-poll-options]");
  const pollStatus = document.querySelector("[data-poll-status]");
  const pollResults = document.querySelector("[data-poll-results]");
  const pollChoices = ["Stylizacja dnia", "Pomysł na wnętrze", "Kulisy pracy"];
  const getPollVotes = () => {
    try {
      return (
        JSON.parse(window.localStorage.getItem("sylwia-poll-votes-v1")) || {}
      );
    } catch {
      return {};
    }
  };
  const renderPollResults = () => {
    const votes = getPollVotes();
    const total = pollChoices.reduce(
      (sum, choice) => sum + (votes[choice] || 0),
      0,
    );
    pollResults.replaceChildren();
    pollChoices.forEach((choice) => {
      const row = document.createElement("div");
      const label = document.createElement("span");
      const value = document.createElement("strong");
      const bar = document.createElement("i");
      const percentage = total
        ? Math.round(((votes[choice] || 0) / total) * 100)
        : 0;
      row.className = "poll-result";
      label.textContent = choice;
      value.textContent = `${percentage}%`;
      bar.style.setProperty("--poll-width", `${percentage}%`);
      row.append(label, value, bar);
      pollResults.append(row);
    });
    pollResults.hidden = false;
  };
  pollOptions?.querySelectorAll("[data-poll-option]").forEach((button) => {
    button.addEventListener("click", () => {
      try {
        if (window.localStorage.getItem(pollKey)) {
          pollStatus.textContent =
            "Twój głos został już zapisany na tym urządzeniu.";
          renderPollResults();
          return;
        }
        const choice = button.dataset.pollOption;
        const votes = getPollVotes();
        votes[choice] = (votes[choice] || 0) + 1;
        window.localStorage.setItem(
          "sylwia-poll-votes-v1",
          JSON.stringify(votes),
        );
        window.localStorage.setItem(pollKey, choice);
        pollStatus.textContent = "Dziękuję za głos!";
        renderPollResults();
      } catch {
        pollStatus.textContent =
          "Nie udało się zapisać głosu w tej przeglądarce.";
      }
    });
  });
}

createFeatureInteractions();
createAccountSystem();
createMobileNavigation();
loadPublishedPosts();
