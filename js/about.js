// about.js – FireSage About Page – Surgical & Respectful
const PROJECT_ID = "c42v017z";
const DATASET = "production";
const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}`;

function getImageUrl(imageRef, width = null, height = null) {
  if (!imageRef || !imageRef.asset) return '';
  const ref = imageRef.asset._ref;
  const [_, id, dimensions, format] = ref.split('-');
  let url = `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`;
  if (width && height) url += `?w=${width}&h=${height}&fit=crop`;
  else if (width) url += `?w=${width}&fit=min`;
  else if (height) url += `?h=${height}&fit=min`;
  return url;
}

async function fetchFromSanity(query) {
  const url = `${SANITY_URL}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.result;
}

// Replace helpers (your beloved ones)
const replaceText = (id, text) => { const el = document.getElementById(id); if (el && text) el.textContent = text; };
const replaceHtml = (id, html) => { const el = document.getElementById(id); if (el && html) el.innerHTML = html; };
const replaceImage = (id, url) => { const el = document.getElementById(id); if (el && url) el.src = url; };
const replaceHref = (id, href) => { const el = document.getElementById(id); if (el && href) el.href = href; };

async function initAboutPage() {
  try {
    console.log('FireSage About Page loading from Sanity...');

    const [settings, clients, featured] = await Promise.all([
      fetchFromSanity(`*[_type == "siteSettings"][0]{ title, description, logo, logoMobile, socialLinks, footer }`),
      fetchFromSanity(`*[_type == "client"] | order(_createdAt asc){ name, logo, url }`),
      fetchFromSanity(`*[_type == "featuredProject"] | order(year desc){ year, projects }`)
    ]);

    // Page title & meta
    if (settings?.title) document.title = settings.title + ' — About';
    if (settings?.description) document.querySelector('meta[name="description"]').setAttribute('content', settings.description);

    // Header logos
    if (settings?.logo) replaceImage('main-logo', getImageUrl(settings.logo, 70, 76));
    if (settings?.logoMobile) replaceImage('mobile-logo', getImageUrl(settings.logoMobile, 70, 76));

    // Clients carousel – surgical replace (exactly like index)
    if (clients && clients.length > 0) {
      const wrapper = document.querySelector('.client-active .swiper-wrapper');
      const existingSlides = wrapper.querySelectorAll('.swiper-slide');

      clients.forEach((client, i) => {
        const slide = existingSlides[i] || document.createElement('div');
        if (!existingSlides[i]) {
          slide.className = 'swiper-slide';
          wrapper.appendChild(slide);
        }
        slide.innerHTML = `
          <div class="image-box">
            <a href="${client.url || '#'}">
              <img src="${getImageUrl(client.logo, 200, 85)}" alt="${client.name}">
            </a>
          </div>
        `;
      });

      // Remove excess slides
      for (let i = clients.length; i < existingSlides.length; i++) {
        existingSlides[i].remove();
      }

      // Re-init Swiper only if it exists
      if (window.clientSwiperAbout) {
        window.clientSwiperAbout.destroy(true, true);
      }
      window.clientSwiperAbout = new Swiper('.client-active', {
        slidesPerView: 2,
        spaceBetween: 20,
        breakpoints: {
          576: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          992: { slidesPerView: 5 }
        },
        loop: true,
        autoplay: { delay: 3000 }
      });
    }

    // Awards / Achieved timeline – surgical replace (same logic as index)
    if (featured && featured.length > 0) {
      const container = document.getElementById('achieved-container') || document.querySelector('.achieved-year').parentElement;

      featured.forEach(yearBlock => {
        const yearId = `year-${yearBlock.year}`;
        let yearElement = document.getElementById(yearId);

        if (!yearElement) {
          yearElement = document.createElement('div');
          yearElement.className = 'achieved-year wow fadeInUp';
          yearElement.id = yearId;
          yearElement.dataset.wowDelay = '0.3s';
          yearElement.dataset.wowDuration = '1.5s';
          yearElement.innerHTML = `
            <div class="row">
              <div class="col-lg-3"><div class="year-text"><p>${yearBlock.year}</p></div></div>
              <div class="col-lg-9" id="achievements-${yearBlock.year}"></div>
            </div>`;
          container.appendChild(yearElement);
        } else {
          document.querySelector(`#year-text-${yearBlock.year} p`)?.replaceWith(document.createElement('p').appendChild(document.createTextNode(yearBlock.year)));
        }

        const achievementsContainer = document.getElementById(`achievements-${yearBlock.year}`) || yearElement.querySelector('.col-lg-9');
        const existingItems = achievementsContainer.querySelectorAll('.achieved-item');

        yearBlock.projects.forEach((proj, idx) => {
          const item = existingItems[idx] || document.createElement('div');
          if (!existingItems[idx]) {
            item.className = 'achieved-item';
            achievementsContainer.appendChild(item);
          }
          item.innerHTML = `
            <span class="sub-title ${proj.tagColor || 'text-primary'}">${proj.tag}</span>
            <h2 class="title"><a href="${proj.link || '#'}">${proj.title}</a></h2>
          `;
        });

        // Remove extras
        for (let i = yearBlock.projects.length; i < existingItems.length; i++) {
          existingItems[i].remove();
        }
      });

      // Remove years that no longer exist in Sanity
      document.querySelectorAll('.achieved-year').forEach(el => {
        const year = el.id.replace('year-', '');
        if (!featured.some(y => y.year.toString() === year)) el.remove();
      });
    }

    // Footer – same as index
    if (settings?.footer) {
      replaceHtml('footer-heading', settings.footer.heading || "Let’s work together");
      replaceText('footer-email', settings.footer.email);
      replaceHref('footer-email-link', `mailto:${settings.footer.email}`);
      replaceHtml('footer-copyright-name', settings.footer.copyrightName);
    }

    // Footer social links
    if (settings?.socialLinks) {
      const socialList = document.querySelector('.footer-social .social');
      if (socialList) {
        socialList.innerHTML = '';
        if (settings.socialLinks.twitter) socialList.innerHTML += `<li><a target="_blank" class="twitter" href="${settings.socialLinks.twitter}">Twitter</a></li>`;
        if (settings.socialLinks.behance) socialList.innerHTML += `<li><a target="_blank" class="behance" href="${settings.socialLinks.behance}">Behance</a></li>`;
        if (settings.socialLinks.dribbble) socialList.innerHTML += `<li><a target="_blank" class="dribbble" href="${settings.socialLinks.dribbble}">Dribbble</a></li>`;
        if (settings.socialLinks.github) socialList.innerHTML += `<li><a target="_blank" class="github" href="${settings.socialLinks.github}">Github</a></li>`;
      }
    }

    console.log('About page 100 % live — FireSage style.');

  } catch (error) {
    console.error('About page load failed:', error);
  }
}

// Run when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutPage);
} else {
  initAboutPage();
}