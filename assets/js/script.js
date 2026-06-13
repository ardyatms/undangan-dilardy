(() => {
  "use strict";

  const EVENT_DATE = new Date("2026-10-24T08:00:00+07:00");
  const EVENT_END = new Date("2026-10-24T15:00:00+07:00");
  const DEFAULT_GUEST = "Tamu Undangan";

  const body = document.body;
  const cover = document.getElementById("cover");
  const invitation = document.getElementById("invitation");
  const openButton = document.getElementById("openInvitation");
  const musicButton = document.getElementById("musicToggle");
  const audio = document.getElementById("backgroundMusic");
  const bottomNav = document.getElementById("bottomNav");
  const toast = document.getElementById("toast");

  let hasOpened = false;
  let toastTimer;

  const params = new URLSearchParams(window.location.search);
  const guestName = (params.get("to") || DEFAULT_GUEST).trim().slice(0, 80);
  document.querySelectorAll("#guestNameCover, #guestNameClosing").forEach((node) => {
    node.textContent = guestName;
  });

  const calendarParams = new URLSearchParams({
    action: "TEMPLATE",
    text: "Pernikahan Ardy & Dila",
    dates: "20261024T080000/20261024T150000",
    ctz: "Asia/Jakarta",
    details: "Undangan pernikahan Ardy & Dila. Terima kasih atas doa dan kehadirannya.",
    location: "Gedung Serbaguna, Palembang, Sumatera Selatan",
  });
  document.getElementById("calendarButton").href = `https://calendar.google.com/calendar/render?${calendarParams.toString()}`;

  async function playMusic() {
    try {
      audio.volume = 0.45;
      await audio.play();
      musicButton.classList.add("is-playing");
      musicButton.setAttribute("aria-label", "Jeda musik");
    } catch (error) {
      musicButton.classList.remove("is-playing");
      musicButton.setAttribute("aria-label", "Putar musik");
    }
  }

  function pauseMusic() {
    audio.pause();
    musicButton.classList.remove("is-playing");
    musicButton.setAttribute("aria-label", "Putar musik");
  }

  function createPetal() {
    if (!hasOpened || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const container = document.getElementById("petals");
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.opacity = `${0.35 + Math.random() * 0.55}`;
    petal.style.transform = `scale(${0.55 + Math.random()})`;
    petal.style.animationDuration = `${7 + Math.random() * 7}s`;
    petal.style.setProperty("--drift", `${-90 + Math.random() * 180}px`);
    petal.style.setProperty("--rotate", `${180 + Math.random() * 540}deg`);
    container.appendChild(petal);
    petal.addEventListener("animationend", () => petal.remove());
  }

  openButton.addEventListener("click", async () => {
    if (hasOpened) return;
    hasOpened = true;
    invitation.setAttribute("aria-hidden", "false");
    cover.classList.add("is-open");
    body.classList.remove("is-locked");
    bottomNav.classList.add("is-visible");
    musicButton.classList.add("is-visible");
    await playMusic();
    revealVisibleElements();
    setInterval(createPetal, 900);
    for (let i = 0; i < 8; i += 1) setTimeout(createPetal, i * 180);
    setTimeout(() => document.getElementById("home").focus?.(), 1100);
  });

  musicButton.addEventListener("click", () => {
    if (audio.paused) playMusic();
    else pauseMusic();
  });

  function updateCountdown() {
    const distance = EVENT_DATE.getTime() - Date.now();
    const grid = document.getElementById("countdownGrid");
    if (distance <= 0) {
      grid.classList.add("is-finished");
      return;
    }

    const days = Math.floor(distance / 86400000);
    const hours = Math.floor((distance % 86400000) / 3600000);
    const minutes = Math.floor((distance % 3600000) / 60000);
    const seconds = Math.floor((distance % 60000) / 1000);
    document.getElementById("days").textContent = String(days).padStart(2, "0");
    document.getElementById("hours").textContent = String(hours).padStart(2, "0");
    document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
    document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px" });

  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  function revealVisibleElements() {
    document.querySelectorAll(".reveal").forEach((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95) element.classList.add("is-revealed");
    });
  }

  const sections = ["home", "couple", "event", "gallery", "gift"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const navObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    bottomNav.querySelectorAll("a").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.section === visible.target.id);
    });
  }, { threshold: [0.25, 0.5, 0.7], rootMargin: "-20% 0px -55%" });
  sections.forEach((section) => navObserver.observe(section));

  const galleryItems = [...document.querySelectorAll(".gallery__item")];
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  let currentImageIndex = 0;

  function showLightbox(index) {
    currentImageIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[currentImageIndex];
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = item.querySelector("img")?.alt || "Foto galeri";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("is-locked");
    document.getElementById("lightboxClose").focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("is-locked");
    galleryItems[currentImageIndex]?.focus();
  }

  galleryItems.forEach((item, index) => item.addEventListener("click", () => showLightbox(index)));
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  document.getElementById("lightboxPrev").addEventListener("click", () => showLightbox(currentImageIndex - 1));
  document.getElementById("lightboxNext").addEventListener("click", () => showLightbox(currentImageIndex + 1));
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showLightbox(currentImageIndex - 1);
    if (event.key === "ArrowRight") showLightbox(currentImageIndex + 1);
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2300);
  }

  document.querySelectorAll(".copy-button").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy || "";
      try {
        await navigator.clipboard.writeText(value);
        showToast("Nomor rekening berhasil disalin.");
      } catch (error) {
        const helper = document.createElement("textarea");
        helper.value = value;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
        showToast("Nomor rekening berhasil disalin.");
      }
    });
  });
})();
