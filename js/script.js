// ─── Sidebar active link tracking + TOC ──────────────────────
(function () {
  const sections = document.querySelectorAll('.doc-section');
  const navLinks = document.querySelectorAll('#sidebar .sidebar-nav a, #sidebar .sidebar-sub-nav a');
  const toc = document.getElementById('toc');

  // Generate slug from text (Turkish-safe)
  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Assign IDs to all h3.sub-title elements
  const allH3s = document.querySelectorAll('h3.sub-title');
  const usedIds = new Set();
  document.querySelectorAll('[id]').forEach(el => usedIds.add(el.id));

  allH3s.forEach(h3 => {
    if (!h3.id) {
      let slug = 'toc-' + slugify(h3.textContent.trim());
      let base = slug;
      let counter = 2;
      while (usedIds.has(slug)) {
        slug = base + '-' + counter++;
      }
      h3.id = slug;
      usedIds.add(slug);
    }
  });

  let currentSectionId = '';

  // Build TOC content for a given section
  function buildTOC(sectionEl) {
    if (!toc) return;
    const h3s = sectionEl.querySelectorAll('h3.sub-title');
    if (h3s.length === 0) {
      toc.innerHTML = '';
      return;
    }
    let html = '<div class="toc-title">Bu Bölümde</div>';
    h3s.forEach(h3 => {
      html += '<a class="toc-link" href="#' + h3.id + '">' + h3.textContent.trim() + '</a>';
    });
    toc.innerHTML = html;

    // Bind smooth scroll on TOC links
    toc.querySelectorAll('.toc-link').forEach(link => {
      link.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Highlight active h3 in TOC
  function updateTOCActive() {
    if (!toc) return;
    const tocLinks = toc.querySelectorAll('.toc-link');
    if (tocLinks.length === 0) return;
    let activeId = '';
    const currentSection = document.getElementById(currentSectionId);
    if (!currentSection) return;
    const h3s = currentSection.querySelectorAll('h3.sub-title');
    h3s.forEach(h3 => {
      if (h3.getBoundingClientRect().top <= 120) {
        activeId = h3.id;
      }
    });
    tocLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + activeId);
    });
  }

  function onScroll() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop <= 90) {
        current = section.id;
      }
    });

    // Sidebar active state
    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === '#' + current) {
        link.classList.add('active');
      }
    });

    // Rebuild TOC when section changes
    if (current !== currentSectionId) {
      currentSectionId = current;
      const sectionEl = document.getElementById(current);
      if (sectionEl) buildTOC(sectionEl);
    }

    // Update active h3 in TOC
    updateTOCActive();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ─── Copy to clipboard ───────────────────────────────────────
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const wrapper = this.closest('.code-block-wrapper');
    const code = wrapper.querySelector('code');
    if (!code) return;

    navigator.clipboard.writeText(code.innerText).then(() => {
      this.classList.add('copied');
      this.innerHTML = '<span>✓</span> Kopyalandı';
      setTimeout(() => {
        this.classList.remove('copied');
        this.innerHTML = '<span>⎘</span> Kopyala';
      }, 2000);
    });
  });
});

// ─── Tabs ────────────────────────────────────────────────────
document.querySelectorAll('.tabs').forEach(tabs => {
  const buttons = tabs.querySelectorAll('.tab-btn');
  const panels = tabs.querySelectorAll('.tab-panel');

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      panels[i].classList.add('active');
    });
  });
});

// ─── Mobile sidebar toggle ───────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  });
}

if (overlay) {
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });
}

// Close sidebar when a nav link is clicked on mobile
document.querySelectorAll('#sidebar a').forEach(link => {
  link.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });
});

// ─── Scroll to top ───────────────────────────────────────────
const scrollTopBtn = document.getElementById('scrollTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
}, { passive: true });

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── Smooth anchor scrolling ─────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ─── Search (Ctrl+K) ────────────────────────────────────────
(function () {
  const searchOverlay = document.getElementById('search-overlay');
  const searchModal = document.getElementById('search-modal');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchBtn = document.getElementById('search-btn');

  if (!searchOverlay || !searchModal || !searchInput || !searchResults) return;

  // Build search index
  const searchIndex = [];

  // Index section titles (h1, h2)
  document.querySelectorAll('section.doc-section').forEach(section => {
    const titleEl = section.querySelector('h2.section-title, h1.section-title');
    if (titleEl) {
      const tag = section.querySelector('.section-tag');
      searchIndex.push({
        type: 'section',
        title: titleEl.textContent.trim(),
        section: tag ? tag.textContent.trim() : '',
        targetId: section.id,
        text: titleEl.textContent.trim()
      });
    }

    // Index h3 sub-titles
    section.querySelectorAll('h3.sub-title').forEach(h3 => {
      const parentTitle = section.querySelector('h2.section-title, h1.section-title');
      searchIndex.push({
        type: 'heading',
        title: h3.textContent.trim(),
        section: parentTitle ? parentTitle.textContent.trim() : '',
        targetId: h3.id,
        text: h3.textContent.trim()
      });
    });

    // Index endpoint paths
    section.querySelectorAll('.endpoint-path').forEach(ep => {
      const parentTitle = section.querySelector('h2.section-title, h1.section-title');
      searchIndex.push({
        type: 'endpoint',
        title: ep.textContent.trim(),
        section: parentTitle ? parentTitle.textContent.trim() : '',
        targetId: section.id,
        text: ep.textContent.trim()
      });
    });
  });

  function openSearch() {
    searchOverlay.classList.add('active');
    searchModal.classList.add('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchInput.focus();
  }

  function closeSearch() {
    searchOverlay.classList.remove('active');
    searchModal.classList.remove('active');
  }

  // Ctrl+K / Cmd+K
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') {
      closeSearch();
    }
  });

  // Header search button
  if (searchBtn) {
    searchBtn.addEventListener('click', openSearch);
  }

  // Overlay click
  searchOverlay.addEventListener('click', closeSearch);

  // Search on input
  searchInput.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    if (!query) {
      searchResults.innerHTML = '';
      return;
    }

    const matches = searchIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.section.toLowerCase().includes(query) ||
      item.text.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-empty">Sonuç bulunamadı</div>';
      return;
    }

    searchResults.innerHTML = matches.map(item => {
      const typeLabel = item.type === 'endpoint' ? 'API' : item.section;
      return '<a class="search-result-item" href="#' + item.targetId + '">'
        + '<div class="search-result-section">' + typeLabel + '</div>'
        + '<div class="search-result-title">' + item.title + '</div>'
        + '</a>';
    }).join('');

    // Bind click on results
    searchResults.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        closeSearch();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  });

  // Keyboard nav in results
  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const first = searchResults.querySelector('.search-result-item');
      if (first) first.click();
    }
  });
})();
