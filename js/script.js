$(function () {

  // DRAGGABLE
  const $items = $(".draggable-item");
  const sectionSelector = "#section6";
  const savedPositions = JSON.parse(localStorage.getItem("draggablePositions") || "{}");

  $items.each(function (index) {
    const id = "item-" + index;
    $(this).attr("id", id);

    if (savedPositions[id]) {
      $(this).css(savedPositions[id]);
    } else {
      const x = Math.random() * ($(window).width() - 200);
      const y = Math.random() * ($(window).height() - 300);
      $(this).css({ top: y + "px", left: x + "px" });
    }

    $(this).draggable({
      containment: sectionSelector,
      stop: function (event, ui) {
        savedPositions[id] = ui.position;
        localStorage.setItem("draggablePositions", JSON.stringify(savedPositions));
      }
    });
  });

 // LOGO OVERLAY RESPONSIVE
(function () {

    const $overlay = $("#logo-overlay");
    const overlay = $overlay[0];
    const imgs = $overlay.find(".logo-part").toArray();
    const $footer = $("footer");
    const footer = $footer[0];

    if (!overlay || imgs.length !== 2 || !footer) return;

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;

    const HEIGHT_COLLAPSED = 20;
    const TOP_OFFSET = 12; // 👈 fijo a 12px del top en móvil

    function computeExpandedHeight() {
        const vw = window.innerWidth;

        const sumRatios = imgs.reduce((acc, img) => {
            const r = (img.naturalWidth && img.naturalHeight)
                ? img.naturalWidth / img.naturalHeight
                : 1;
            return acc + r;
        }, 0) || 2;

        const base = vw / sumRatios;

        if (vw >= 1150) return Math.round(Math.max(base, 56));
        if (vw < 600) return Math.min(base, 90);
        return Math.min(base, 200);
    }

    function update() {

        const scrollY = window.scrollY;
        const vh = document.documentElement.clientHeight;
        const viewportBottom = scrollY + vh;
        const isMobile = window.innerWidth < 768;

        const footerRect = footer.getBoundingClientRect();
        const footerTopAbs = footerRect.top + scrollY;
        const footerBottomAbs = footerRect.bottom + scrollY;

        const Hc = HEIGHT_COLLAPSED;
        const He = computeExpandedHeight();

        overlay.style.setProperty("--logo-h", Hc + "px");

        // ---------------- MOBILE ----------------
        if (isMobile) {

            // Mientras no llega al footer → fijo arriba
            if (viewportBottom < footerTopAbs) {

                overlay.style.top = TOP_OFFSET + "px";
                overlay.style.bottom = "auto";
                overlay.style.setProperty("--logo-h", Hc + "px");

            } else {

                const span = Math.max(1, footerBottomAbs - footerTopAbs);
                const k = clamp((viewportBottom - footerTopAbs) / span, 0, 1);

                // Interpolamos desde top fijo hasta bottom 0
                const move = lerp(TOP_OFFSET, 0, k);

                overlay.style.top = "auto";
                overlay.style.bottom = move + "px";

                const growStart = 0.6;
                const growT = (k <= growStart) ? 0 : (k - growStart) / (1 - growStart);
                const Ht = Math.round(lerp(Hc, He, clamp(growT, 0, 1)));

                overlay.style.setProperty("--logo-h", Ht + "px");
            }

        }
        // ---------------- DESKTOP ----------------
        else {

            const centerSmall = Math.round((vh - Hc) / 2);

            if (viewportBottom < footerTopAbs) {

                overlay.style.bottom = centerSmall + "px";
                overlay.style.top = "auto";
                overlay.style.setProperty("--logo-h", Hc + "px");

            } else {

                const span = Math.max(1, footerBottomAbs - footerTopAbs);
                const k = clamp((viewportBottom - footerTopAbs) / span, 0, 1);

                const bottomPx = Math.round(lerp(centerSmall, 0, k));

                overlay.style.bottom = bottomPx + "px";
                overlay.style.top = "auto";

                const growStart = 0.6;
                const growT = (k <= growStart) ? 0 : (k - growStart) / (1 - growStart);
                const Ht = Math.round(lerp(Hc, He, clamp(growT, 0, 1)));

                overlay.style.setProperty("--logo-h", Ht + "px");
            }
        }
    }

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            update();
        });
    }

    $(window).on("scroll", onScroll);
    $(window).on("resize", update);

    update();

})();


  // SILLA ENTORNO
  (function () {
    const $section = $(".section-entorno");
    const $chair = $(".falling-chair");

    if (!$section.length || !$chair.length) return;

    function onScroll() {
      const rect = $section[0].getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.bottom < 0 || rect.top > windowHeight) {
        return;
      }

      const total = windowHeight + rect.height;
      const progress = Math.min(
        Math.max((windowHeight - rect.top) / total, 0),
        1
      );

      const sectionHeight = rect.height;
      const maxFall = sectionHeight * 1.5;
      const translateY = progress * maxFall;

      const maxRotation = 30;
      const rotation = -maxRotation + progress * maxRotation * 2;

      $chair.css("transform", "translateY(" + translateY + "px) rotate(" + rotation + "deg)");
    }

    onScroll();
    $(window).on("scroll", onScroll);
    $(window).on("resize", onScroll);
  })();

  // TIPOS CAMBIANDO
  (function () {
    const $w1 = $("#word1");
    const $w2 = $("#word2");

    if (!$w1.length || !$w2.length) return;

    const setUpper = $el => {
      $el.addClass("is-upper").removeClass("is-lower");
    };

    const setLower = $el => {
      $el.addClass("is-lower").removeClass("is-upper");
    };

    const ITALIC_PROB = 0.28;

    const maybeToggleItalic = $el => {
      if (Math.random() < ITALIC_PROB) {
        $el.toggleClass("italic");
      }
    };

    setUpper($w1);
    setLower($w2);

    let step = 0;

    function applyStep() {
      switch (step) {
        case 0:
          setLower($w1);
          break;
        case 1:
          setUpper($w2);
          break;
        case 2:
          setUpper($w1);
          break;
        case 3:
          setLower($w2);
          break;
      }

      maybeToggleItalic($w1);
      maybeToggleItalic($w2);

      step = (step + 1) % 4;
    }

    setInterval(applyStep, 300);
  })();

  // UN (TU) LUGAR
  (function () {
    const $title = $(".anim-title").first();
    if (!$title.length) return;

    const section = $title.closest("section")[0];
    if (!section) return;

    let hasActivated = false;

    function lockScroll() {
      $("body").css("overflow", "hidden");
    }

    function unlockScroll() {
      $("body").css("overflow", "");
    }

    function checkPosition() {
      if (hasActivated) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;

      const distance = Math.abs(sectionCenter - viewportCenter);
      const threshold = viewportHeight * 0.015;

      if (distance <= threshold) {
        hasActivated = true;

        lockScroll();
        $title.addClass("active");

        setTimeout(unlockScroll, 1800);

        $(window).off("scroll", onScroll);
        $(window).off("resize", onScroll);
      }
    }

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        checkPosition();
      });
    }

    checkPosition();
    $(window).on("scroll", onScroll);
    $(window).on("resize", onScroll);
  })();

  // ACORDEÓN ESPACIOS
  (function () {
    const $images = $(".lugar-img");
    const $accordion = $("#espaciosAccordion");

    if (!$accordion.length || !$images.length) return;

    $accordion.on("show.bs.collapse", function (e) {
      const $button = $(e.target).prev().find(".accordion-button");
      const imgId = $button.attr("data-image-target");

      $images.removeClass("active");

      const $img = $("#" + imgId);
      if ($img.length) {
        $img.addClass("active");
      }
    });
  })();

  // MENU BLEND
  (function () {
    const $navbar = $(".navbar-blur");
    const header = $("header")[0];

    if (!$navbar.length || !header) return;

    function updateNavbarBlend() {
      const headerRect = header.getBoundingClientRect();
      const navbarRect = $navbar[0].getBoundingClientRect();

      const overlappingHeader =
        navbarRect.bottom > headerRect.top &&
        navbarRect.top < headerRect.bottom;

      if (overlappingHeader) {
        $navbar.addClass("navbar-on-header");
      } else {
        $navbar.removeClass("navbar-on-header");
      }
    }

    let ticking = false;
    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        updateNavbarBlend();
      });
    }

    updateNavbarBlend();
    $(window).on("scroll", onScrollOrResize);
    $(window).on("resize", onScrollOrResize);
  })();

  // OFFCANVAS → DESACTIVAR DIFFERENCE
  (function () {
    const $offcanvas = $("#offcanvasNavbar");
    if (!$offcanvas.length) return;

    $offcanvas.on("show.bs.offcanvas", function () {
      $("body").addClass("offcanvas-open");
      $(window).trigger("scroll");
    });

    $offcanvas.on("hidden.bs.offcanvas", function () {
      $("body").removeClass("offcanvas-open");
      $(window).trigger("scroll");
    });
  })();

});


// SILLA QUE ROTA
document.addEventListener("DOMContentLoaded", () => {
  const chair = document.querySelector(".hero-chair");
  if (!chair || typeof gsap === "undefined") return; // ← IMPORTANTE

  const maxRotation = 15;
  const easeSpeed = 0.4;

  document.addEventListener("mousemove", (e) => {
    const xPercent = (e.clientX / window.innerWidth - 0.5) * 2;
    const yPercent = (e.clientY / window.innerHeight - 0.5) * 2;

    gsap.to(chair, {
      rotationY: xPercent * maxRotation,
      rotationX: -yPercent * maxRotation,
      transformPerspective: 800,
      transformOrigin: "center",
      duration: easeSpeed,
      ease: "power2.out"
    });
  });

  document.addEventListener("mouseleave", () => {
    gsap.to(chair, {
      rotationX: 0,
      rotationY: 0,
      duration: 1.2,
      ease: "power3.out"
    });
  });
});
// EFECTO PINTAR
document.addEventListener("DOMContentLoaded", () => {

  const section = document.getElementById("halo-section");
  const canvas = document.getElementById("trail-canvas");
  if (!section || !canvas) return; // ← si no existen en esta página, salimos

  const ctx = canvas.getContext("2d");
  if (!ctx) return; // por seguridad extra

  function resizeCanvas() {
    canvas.width = section.clientWidth;
    canvas.height = section.clientHeight;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const points = [];
  const maxPoints = 40;

  let inside = false;

  section.addEventListener("mouseenter", () => inside = true);
  section.addEventListener("mouseleave", () => {
    inside = false;
    points.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  section.addEventListener("mousemove", (e) => {
    if (!inside) return;

    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    points.push({ x, y });
    if (points.length > maxPoints) points.shift();
  });

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (points.length > 1) {
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#BC543B";

      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }

      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }

  draw();
});


document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
  enlace.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    e.preventDefault();
    const target = document.querySelector(targetId);
    if (!target) return;

    const navbarHeight = 80;
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  });
});
