/* Nav, Figma, diagram */
(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* Nav and scroll behavior */
  const toTop = $('.to-top');
  const sections = $$('main section[id]');
  const snLinks = $$('.sn a.sn-link');
  const topnavLinks = $$('.topnav a[href^="#"]');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setActiveLink = (id) => {
    const mark = (links) => links.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
    });
    mark(snLinks);
    mark(topnavLinks);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        setActiveLink(id);
        history.replaceState(null, '', `#${id}`);
      }
    });
  }, { rootMargin: '-10% 0px -70% 0px', threshold: 0.01 });

  sections.forEach(sec => observer.observe(sec));

  const onScroll = () => {
    if (window.scrollY > 400) toTop?.classList.add('show');
    else toTop?.classList.remove('show');
  };
  onScroll();
  document.addEventListener('scroll', onScroll, { passive: true });

  function getOffsetTop(el) {
    const headerOffset = 70;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return rect.top + scrollTop - headerOffset;
  }
  function focusHeading(section) {
    const target = $('h2,h1', section) || section;
    if (!target) return;
    const prev = target.getAttribute('tabindex');
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.addEventListener('blur', () => {
      if (prev === null) target.removeAttribute('tabindex');
      else target.setAttribute('tabindex', prev);
    }, { once: true });
  }
  function scrollToId(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = getOffsetTop(el);
    if (prefersReduced) window.scrollTo(0, top);
    else window.scrollTo({ top, behavior: 'smooth' });
    focusHeading(el);
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const hash = a.getAttribute('href');
    const id = hash.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    scrollToId(id);
    history.pushState(null, '', hash);
  });
  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (id) scrollToId(id);
  });
  window.addEventListener('DOMContentLoaded', () => {
    const id = location.hash.replace('#', '');
    if (id) setTimeout(() => scrollToId(id), 0);
  });

  /* Lightbox for figma design gallery */
  const lb = $('#lightbox');
  if (lb) {
    const lbImg = $('#lbImg', lb);
    const lbCap = $('#lbCaption', lb);
    const btnClose = $('.lb-close', lb);
    const btnPrev = $('.lb-prev', lb);
    const btnNext = $('.lb-next', lb);
    const backdrop = $('.lightbox-backdrop', lb);
    const triggers = $$('.gallery.designs .zoom');
    let current = -1;
    let lastFocused = null;

    const open = (index) => {
      if (index < 0 || index >= triggers.length) return;
      current = index;
      const t = triggers[current];
      const img = $('img', t);
      const full = t.dataset.full || img.src;
      const caption = t.closest('figure')?.querySelector('figcaption')?.textContent || '';
      lbImg.src = full;
      lbImg.alt = img.alt || '';
      lbCap.textContent = caption;
      lb.hidden = false;
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lastFocused = document.activeElement;
      btnClose.focus();
    };
    const close = () => {
      lb.hidden = true;
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.src = '';
      if (lastFocused) lastFocused.focus();
    };
    const next = () => open((current + 1) % triggers.length);
    const prev = () => open((current - 1 + triggers.length) % triggers.length);

    // Activates on click and keyboard strokes
    triggers.forEach((btn, i) => {
      btn.addEventListener('click', () => open(i));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });

    btnClose.addEventListener('click', close);
    btnNext.addEventListener('click', next);
    btnPrev.addEventListener('click', prev);
    backdrop.addEventListener('click', close);

    // Keyboard support and focus trap for images
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();

      if (e.key === 'Tab') {
        const focusables = $$('.lb-close, .lb-prev, .lb-next', lb);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
})();

/* This is a single image modal for the OrnaFlow flowchart diagram */
(() => {
  const db = document.querySelector('#diagrambox');
  const btn = document.querySelector('.diagram .zoom');
  if (!db || !btn) return;

  const dbImg = db.querySelector('#dbImg');
  const dbCap = db.querySelector('#dbCaption');
  const btnClose = db.querySelector('.lb-close');
  const backdrop = db.querySelector('.lightbox-backdrop');
  let lastFocused = null;

  function openDiagram() {
    const img = btn.querySelector('img');
    const full = btn.dataset.full || img.src;
    const caption = document.querySelector('#diagram-caption')?.textContent || '';
    dbImg.src = full;
    dbImg.alt = img.alt || '';
    dbCap.textContent = caption;
    db.hidden = false;
    db.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lastFocused = document.activeElement;
    btnClose.focus();
  }

  function closeDiagram() {
    db.hidden = true;
    db.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    dbImg.src = '';
    lastFocused?.focus();
  }

  btn.addEventListener('click', openDiagram);
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDiagram(); }
  });
  btnClose.addEventListener('click', closeDiagram);
  backdrop.addEventListener('click', closeDiagram);
  document.addEventListener('keydown', (e) => {
    if (!db.hidden && e.key === 'Escape') closeDiagram();
  });
})();

/* App Galleries. They all have separate lightboxes per section */
(() => {
  // Utilities 
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // This builds gallery items from a container
  function getGalleryItems(container) {
    const figs = qa('figure', container);
    return figs.map((fig) => {
      const btn = q('.zoom', fig);
      const img = btn ? q('img', btn) : q('img', fig);
      if (!img) return null;

      const full = (btn && btn.dataset.full) || img.dataset.full || img.getAttribute('src');
      const caption = (q('figcaption', fig)?.textContent || img.getAttribute('alt') || '').trim();
      const triggerEl = btn || img;

      // This makes non-button images keyboard-accessible
      if (!btn && triggerEl) {
        triggerEl.setAttribute('tabindex', '0');
        triggerEl.style.cursor = 'zoom-in';
        triggerEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerEl.click(); }
        });
      }

      return { full, caption, triggerEl };
    }).filter(Boolean);
  }

  // This creates a dedicated lightbox node for a gallery
  function createLightbox(id) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.id = id;
    box.hidden = true;
    box.setAttribute('aria-hidden', 'true');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = `
      <div class="lightbox-backdrop" data-close></div>
      <figure class="lightbox-content" role="document">
        <img alt="" />
        <figcaption></figcaption>
        <button class="lb-close" aria-label="Close preview">✕</button>
        <button class="lb-prev" aria-label="Previous image">‹</button>
        <button class="lb-next" aria-label="Next image">›</button>
      </figure>
    `;
    document.body.appendChild(box);
    return box;
  }

  // This wires a gallery container to its lightbox that can be controled via arrows and ESC key.
  function wireGallery(container, lightbox) {
    const items = getGalleryItems(container);
    if (!items.length) return;

    const imgEl = q('img', lightbox);
    const capEl = q('figcaption', lightbox);
    const btnPrev = q('.lb-prev', lightbox);
    const btnNext = q('.lb-next', lightbox);
    const btnClose = q('.lb-close', lightbox);
    const backdrop = q('[data-close]', lightbox);

    let index = 0;
    let open = false;
    let lastFocused = null;

    function render() {
      const { full, caption } = items[index];
      imgEl.src = full;
      imgEl.alt = caption || '';
      capEl.textContent = caption || '';
    }

    function show(i) {
      index = i;
      render();
      lightbox.hidden = false;
      lightbox.setAttribute('aria-hidden', 'false');
      open = true;
      lastFocused = document.activeElement;
      document.body.style.overflow = 'hidden';
      btnClose.focus();
    }

    function hide() {
      open = false;
      lightbox.hidden = true;
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      imgEl.src = '';
      if (lastFocused) lastFocused.focus();
    }

    function prev() { index = (index - 1 + items.length) % items.length; render(); }
    function next() { index = (index + 1) % items.length; render(); }

    // Triggers
    items.forEach((it, i) => {
      it.triggerEl.addEventListener('click', (e) => { e.preventDefault(); show(i); });
    });

    // Controls
    btnPrev.addEventListener('click', prev);
    btnNext.addEventListener('click', next);
    btnClose.addEventListener('click', hide);
    backdrop.addEventListener('click', hide);

    // This allows the keyboard to function only when this lightbox is open
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') hide();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();

      // This is a focus trap within this lightbox
      if (e.key === 'Tab') {
        const focusables = [btnClose, btnPrev, btnNext].filter(Boolean);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', onKey);
  }

  // This wires each section’s app gallery to its own lightbox
  [
    ['enh1', 'lb-enh1'],
    ['enh2', 'lb-enh2'],
    ['enh3', 'lb-enh3'],
  ].forEach(([sectionId, lbId]) => {
    const container = q(`#${sectionId} .app-gallery`);
    if (!container) return;
    const lb = createLightbox(lbId);
    wireGallery(container, lb);
  });
})();
