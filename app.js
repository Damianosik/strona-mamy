const enterLink = document.querySelector('.enter-link');
const privacyChoiceKey = 'sylwia-privacy-choice';
const themePreferenceKey = 'sylwia-theme-preference';

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
  const useDarkTheme = savedTheme === 'dark';
  const themeToggleHost = document.querySelector('header');

  document.body.classList.toggle('dark-theme', useDarkTheme);

  // The landing page has no header, so the selected theme still applies there
  // without adding a floating switch outside the header.
  if (!themeToggleHost) {
    return;
  }

  const toggle = document.createElement('label');
  const input = document.createElement('input');
  const track = document.createElement('span');
  const sun = document.createElement('span');
  const moon = document.createElement('span');

  toggle.className = 'theme-toggle';
  toggle.setAttribute('data-theme-toggle', '');
  toggle.title = 'Zmie\u0144 tryb kolorystyczny';

  input.type = 'checkbox';
  input.className = 'theme-toggle__input';
  input.setAttribute('aria-label', 'W\u0142\u0105cz tryb ciemny');

  track.className = 'theme-toggle__track';
  track.setAttribute('aria-hidden', 'true');
  sun.className = 'theme-toggle__sun';
  sun.textContent = '\u2600';
  moon.className = 'theme-toggle__moon';
  moon.textContent = '\u263e';

  track.append(sun, moon);
  toggle.append(input, track);
  themeToggleHost.prepend(toggle);

  input.checked = useDarkTheme;
  input.setAttribute('aria-label', useDarkTheme ? 'W\u0142\u0105cz tryb jasny' : 'W\u0142\u0105cz tryb ciemny');

  input.addEventListener('change', () => {
    const theme = input.checked ? 'dark' : 'light';
    document.body.classList.toggle('dark-theme', input.checked);
    input.setAttribute('aria-label', input.checked ? 'W\u0142\u0105cz tryb jasny' : 'W\u0142\u0105cz tryb ciemny');
    saveThemePreference(theme);
  });
}

function createBubbleStream() {
  if (document.body.classList.contains('landing-page')) {
    return;
  }

  const bubbles = [
    [3, 12, 18, -4, 18, 0.42, ''], [8, 22, 24, -12, -14, 0.34, 'Mg'],
    [13, 10, 20, -7, 24, 0.48, ''], [18, 28, 29, -19, -20, 0.3, 'Ca'],
    [22, 20, 23, -2, 12, 0.4, 'Zn'], [27, 34, 32, -25, -28, 0.27, 'Si'],
    [31, 9, 19, -14, 17, 0.45, ''], [36, 24, 27, -9, -16, 0.35, 'Fe'],
    [40, 14, 22, -21, 26, 0.42, ''], [44, 38, 34, -6, -30, 0.25, 'B'],
    [48, 18, 25, -17, 14, 0.37, 'Se'], [52, 11, 21, -11, -22, 0.45, ''],
    [57, 30, 31, -23, 19, 0.3, 'Na'], [61, 15, 24, -5, -16, 0.4, ''],
    [65, 42, 35, -15, 28, 0.24, 'P'], [69, 12, 20, -27, -18, 0.46, ''],
    [73, 26, 28, -8, 21, 0.34, 'Cu'], [77, 20, 23, -20, -24, 0.4, 'Mo'],
    [81, 36, 33, -13, 15, 0.28, 'Mn'], [85, 10, 19, -24, -20, 0.48, ''],
    [89, 28, 30, -3, 25, 0.3, 'Co'], [93, 18, 22, -18, -15, 0.42, 'K'],
    [96, 34, 32, -10, 18, 0.26, 'Cl'], [6, 7, 17, -22, -12, 0.4, ''],
    [55, 8, 18, -29, 12, 0.44, ''], [70, 7, 16, -16, -10, 0.43, '']
  ];
  const stream = document.createElement('div');

  stream.className = 'bubble-stream';
  stream.setAttribute('aria-hidden', 'true');

  bubbles.forEach(([left, size, duration, delay, drift, opacity, symbol]) => {
    const bubble = document.createElement('span');
    const renderedSize = Math.round(size * 1.6);

    bubble.className = 'bubble-stream__bubble';
    bubble.style.setProperty('--bubble-left', `${left}%`);
    bubble.style.setProperty('--bubble-size', `${renderedSize}px`);
    bubble.style.setProperty('--bubble-duration', `${duration}s`);
    bubble.style.setProperty('--bubble-delay', `${delay}s`);
    bubble.style.setProperty('--bubble-drift', `${drift}px`);
    bubble.style.setProperty('--bubble-opacity', opacity);
    bubble.style.setProperty('--bubble-label-size', `${Math.min(Math.max(renderedSize * 0.46, 8), 16)}px`);

    if (symbol) {
      const label = document.createElement('span');

      label.className = 'bubble-stream__symbol';
      label.textContent = symbol;
      label.setAttribute('aria-hidden', 'true');
      bubble.append(label);
    }

    stream.append(bubble);
  });

  document.body.insertBefore(stream, document.body.firstChild);
}

function createReadingProgress() {
  if (document.body.classList.contains('landing-page')) {
    return;
  }

  const progress = document.createElement('div');
  const bar = document.createElement('span');

  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  bar.className = 'reading-progress__bar';
  progress.append(bar);
  document.body.append(progress);

  function updateProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progressValue = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;

    bar.style.transform = `scaleX(${progressValue})`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
}

function createScrollReveal() {
  const elements = document.querySelectorAll(
    '.hero-content, .hero-image, .section-text, .info-card, .letter-card, .stat-card, .books-header, .privacy-content, .books-list li, .footer'
  );
  const prefersReducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  elements.forEach((element, index) => {
    element.classList.add('reveal-on-scroll');
    element.style.setProperty('--reveal-delay', `${(index % 4) * 85}ms`);
    observer.observe(element);
  });
}

createBubbleStream();
createReadingProgress();
createScrollReveal();
createThemeToggle();

function createLetterSurprise() {
  const surprise = document.querySelector('[data-letter-surprise]');

  if (!surprise) {
    return;
  }

  const revealButton = surprise.querySelector('[data-letter-reveal]');
  const message = surprise.querySelector('[data-letter-message]');
  const quote = surprise.querySelector('[data-letter-quote]');
  const nextButton = surprise.querySelector('[data-letter-next]');
  const sourceLink = surprise.querySelector('[data-letter-source]');
  const sourceLabel = surprise.querySelector('[data-letter-source-label]');
  const notes = [
    {
      text: 'Krzem jest bardzo powszechny w przyrodzie, ale jego forma ma znaczenie. Krzemionka z piasku (SiO\u2082) nie jest tym samym co rozpuszczalne zwi\u0105zki krzemu obecne w wodzie i \u017cywno\u015bci; ich przyswajalno\u015b\u0107 jest r\u00f3\u017cna.',
      source: {
        label: 'Przeczytaj artyku\u0142 o krzemie',
        href: 'https://www.witaminaiziolo.pl/pl/n/KRZEM-PIERWIASTEK-ZDROWIA-I-ZYCIA-CZLOWIEKA/49'
      }
    },
    {
      text: 'Bor jest pierwiastkiem \u015bladowym obecnym w \u017cywno\u015bci. Naukowcy badaj\u0105 jego zwi\u0105zek z metabolizmem wapnia i magnezu oraz zdrowiem ko\u015bci, ale nie ustalono dla niego normy dziennego spo\u017cycia.',
      source: {
        label: 'Przeczytaj o borze',
        href: 'https://ods.od.nih.gov/factsheets/Boron-HealthProfessional/'
      }
    },
    {
      text: 'Magnez jest kofaktorem w ponad 300 uk\u0142adach enzymatycznych. Wspiera mi\u0119dzy innymi prac\u0119 mi\u0119\u015bni i nerw\u00f3w, produkcj\u0119 energii oraz prawid\u0142owy rytm serca.',
      source: {
        label: 'Przeczytaj o magnezie',
        href: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/'
      }
    },
    {
      text: 'Cynk jest potrzebny organizmowi do tworzenia DNA i bia\u0142ek. Wspiera te\u017c odporno\u015b\u0107, gojenie ran oraz prawid\u0142owe odczuwanie smaku.',
      source: {
        label: 'Przeczytaj o cynku',
        href: 'https://ods.od.nih.gov/pdf/factsheets/Zinc-Consumer.pdf'
      }
    },
    {
      text: 'Wap\u0144 pomaga budowa\u0107 i utrzymywa\u0107 mocne ko\u015bci, ale nie tylko. Jest potrzebny tak\u017ce do prawid\u0142owej pracy mi\u0119\u015bni, nerw\u00f3w i wielu innych proces\u00f3w w organizmie.',
      source: {
        label: 'Przeczytaj o wapniu',
        href: 'https://ods.od.nih.gov/factsheets/Calcium-Consumer/'
      }
    },
    {
      text: 'Potas jest najwa\u017cniejszym dodatnio na\u0142adowanym minera\u0142em wewn\u0105trz kom\u00f3rek. Pomaga utrzyma\u0107 r\u00f3wnowag\u0119 p\u0142yn\u00f3w oraz prawid\u0142ow\u0105 prac\u0119 kom\u00f3rek.',
      source: {
        label: 'Przeczytaj o potasie',
        href: 'https://ods.od.nih.gov/pdf/factsheets/Potassium-Consumer.pdf'
      }
    },
    {
      text: '\u017belazo jest cz\u0119\u015bci\u0105 hemoglobiny \u2014 bia\u0142ka czerwonych krwinek, kt\u00f3re transportuje tlen z p\u0142uc do tkanek. Jest potrzebne r\u00f3wnie\u017c do wzrostu i prawid\u0142owej pracy kom\u00f3rek.',
      source: {
        label: 'Przeczytaj o \u017celazie',
        href: 'https://ods.od.nih.gov/factsheets/Iron-Consumer/'
      }
    },
    {
      text: 'Jod jest potrzebny do produkcji hormon\u00f3w tarczycy. Hormony te reguluj\u0105 metabolizm i wiele innych funkcji organizmu, dlatego odpowiednia poda\u017c jodu ma znaczenie w ka\u017cdym wieku.',
      source: {
        label: 'Przeczytaj o jodzie',
        href: 'https://ods.od.nih.gov/factsheets/Iodine-Consumer/'
      }
    },
    {
      text: 'Selen wspiera prawid\u0142ow\u0105 prac\u0119 tarczycy, tworzenie DNA i ochron\u0119 kom\u00f3rek przed uszkodzeniami oksydacyjnymi. Jest potrzebny w niewielkich ilo\u015bciach, dlatego z dawk\u0105 suplement\u00f3w warto uwa\u017ca\u0107.',
      source: {
        label: 'Przeczytaj o selenie',
        href: 'https://ods.od.nih.gov/factsheets/Selenium-Consumer/'
      }
    },
    {
      text: 'Ciekawostka praktyczna: wi\u0119cej nie zawsze znaczy lepiej. Suplementy warto dobiera\u0107 z uwzgl\u0119dnieniem dawki, diety i przyjmowanych lek\u00f3w \u2014 najlepiej po konsultacji ze specjalist\u0105.'
    }
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
      quote.classList.add('is-changing');
      window.setTimeout(() => {
        quote.textContent = currentNote.text;
        quote.classList.remove('is-changing');
      }, 150);
      return;
    }

    quote.textContent = currentNote.text;
  }

  revealButton.addEventListener('click', () => {
    revealButton.hidden = true;
    revealButton.setAttribute('aria-expanded', 'true');
    message.hidden = false;
    showNote();
    message.focus({ preventScroll: true });
  });

  nextButton.addEventListener('click', () => {
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
  const notice = document.createElement('section');
  const panel = document.createElement('div');
  const eyebrow = document.createElement('p');
  const title = document.createElement('h2');
  const description = document.createElement('p');
  const policyLink = document.createElement('a');
  const actions = document.createElement('div');
  const rejectButton = document.createElement('button');
  const acceptButton = document.createElement('button');

  notice.className = 'privacy-consent';
  notice.setAttribute('role', 'dialog');
  notice.setAttribute('aria-modal', 'true');
  notice.setAttribute('aria-labelledby', 'privacy-consent-title');

  panel.className = 'privacy-consent__panel';
  eyebrow.className = 'privacy-consent__eyebrow';
  eyebrow.textContent = 'Twoja prywatno\u015b\u0107';
  title.id = 'privacy-consent-title';
  title.textContent = 'Zanim przejdziesz dalej';
  description.textContent =
    'Strona nie u\u017cywa plik\u00f3w cookie do reklam ani analityki. Zapami\u0119tamy tylko wybran\u0105 przez Ciebie odpowied\u017a w pami\u0119ci przegl\u0105darki.';

  policyLink.className = 'privacy-consent__link';
  policyLink.href = 'polityka-prywatnosci.html';
  policyLink.textContent = 'Przeczytaj polityk\u0119 prywatno\u015bci';

  actions.className = 'privacy-consent__actions';
  rejectButton.className = 'privacy-consent__button privacy-consent__button--secondary';
  rejectButton.type = 'button';
  rejectButton.textContent = 'Odrzucam';
  acceptButton.className = 'privacy-consent__button privacy-consent__button--primary';
  acceptButton.type = 'button';
  acceptButton.textContent = 'Akceptuj\u0119';

  function close(choice) {
    savePrivacyChoice(choice);
    document.body.classList.remove('privacy-consent-open');
    notice.remove();
  }

  rejectButton.addEventListener('click', () => close('rejected'));
  acceptButton.addEventListener('click', () => close('accepted'));

  actions.append(rejectButton, acceptButton);
  panel.append(eyebrow, title, description, policyLink, actions);
  notice.append(panel);
  document.body.append(notice);
  document.body.classList.add('privacy-consent-open');
  acceptButton.focus();
}

function showPrivacyConsentOnFirstClick() {
  if (getPrivacyChoice()) {
    return;
  }

  function handleFirstClick(event) {
    if (event.target.closest('[data-theme-toggle]')) {
      return;
    }

    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('click', handleFirstClick, true);
    createPrivacyConsent();
  }

  document.addEventListener('click', handleFirstClick, true);
}

if (enterLink) {
  enterLink.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    event.preventDefault();
    document.body.classList.add('is-entering');

    window.setTimeout(() => {
      window.location.assign(enterLink.href);
    }, 560);
  });
} else {
  document.body.classList.add('page-ready');
}

showPrivacyConsentOnFirstClick();
