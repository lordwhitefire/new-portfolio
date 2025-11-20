// app.js - Complete Content Replacement for Static HTML
const PROJECT_ID = "c42v017z";
const DATASET = "production";

// Direct Sanity API URL
const SANITY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}`;

// Helper to build image URLs from Sanity
// Helper to build image URLs from Sanity WITH SIZE
// Helper to build image URLs from Sanity WITH SIZE & CROP
function getImageUrl(imageRef, width = null, height = null) {
  if (!imageRef || !imageRef.asset) return '';
  const ref = imageRef.asset._ref;
  const [_, id, dimensions, format] = ref.split('-');
  
  let url = `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}-${dimensions}.${format}`;
  
  // Add size parameters if specified
  if (width && height) {
    url += `?w=${width}&h=${height}&fit=crop`;
  } else if (width) {
    url += `?w=${width}&fit=min`;
  } else if (height) {
    url += `?h=${height}&fit=min`;
  }
  
  return url;
}
// Content replacement functions
function replaceTextContent(elementId, newText) {
  const element = document.getElementById(elementId);
  if (element && newText) {
    element.textContent = newText;
  }
}

function replaceHtmlContent(elementId, newHtml) {
  const element = document.getElementById(elementId);
  if (element && newHtml) {
    element.innerHTML = newHtml;
  }
}

function replaceImageSrc(elementId, newSrc) {
  const element = document.getElementById(elementId);
  if (element && newSrc) {
    element.src = newSrc;
  }
}

function replaceBackgroundImage(elementId, imageUrl) {
  const element = document.getElementById(elementId);
  if (element && imageUrl) {
    element.style.backgroundImage = `url(${imageUrl})`;
  }
}

function replaceHref(elementId, newHref) {
  const element = document.getElementById(elementId);
  if (element && newHref) {
    element.href = newHref;
  }
}

// Fetch data directly from Sanity API
async function fetchFromSanity(query) {
  const url = `${SANITY_URL}?query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.result;
}

// Main initialization
async function initializeContent() {
  try {
    console.log('Loading all content from Sanity...');
    
    // Fetch ALL data using direct API calls
    const [settings, clients, projects, testimonials, featured] = await Promise.all([
      // Site Settings
      fetchFromSanity(`*[_type == "siteSettings"][0]{
        title,
        description,
        favicon,
        logo,
        logoMobile,
        navigation,
        heroSlides,
        socialLinks,
        about,
        whyChoose,
        counters,
        footer
      }`),
      
      // Clients
      fetchFromSanity(`*[_type == "client"] | order(_createdAt asc){
        name,
        logo,
        url
      }`),
      
      // Projects
      fetchFromSanity(`*[_type == "project"] | order(_createdAt asc){
        title,
        category,
        image,
        link
      }`),
      
      // Testimonials
      fetchFromSanity(`*[_type == "testimonial"] | order(_createdAt asc){
        name,
        position,
        content,
        avatar
      }`),
      
      // Featured Projects
      fetchFromSanity(`*[_type == "featuredProject"] | order(year desc){
        year,
        projects
      }`)
    ]);

    // ===== SITE SETTINGS =====
    if (settings) {
      // Meta
      if (settings.title) document.title = settings.title;
      if (settings.description) document.querySelector('meta[name="description"]').setAttribute('content', settings.description);
      if (settings.favicon) document.querySelector('link[rel="shortcut icon"]').href = getImageUrl(settings.favicon);

      // Logos
      if (settings.logo) replaceImageSrc('main-logo', getImageUrl(settings.logo, 70, 76));
      if (settings.logoMobile) replaceImageSrc('mobile-logo', getImageUrl(settings.logoMobile, 70, 76));

      // Hero Slides
      if (settings.heroSlides && settings.heroSlides.length > 0) {
        settings.heroSlides.forEach((slide, index) => {
            console.log(`Replacing subtitle-${index + 1} with:`, slide.subtitle);
          if (slide.subtitle) replaceTextContent(`slide-subtitle-${index + 1}`, slide.subtitle);
          if (slide.title) replaceHtmlContent(`slide-title-${index + 1}`, slide.title.replace(/\n/g, '<br>'));
          if (slide.description) replaceTextContent(`slide-desc-${index + 1}`, slide.description);
          if (slide.buttonText) replaceTextContent(`slide-btn-${index + 1}`, slide.buttonText);
          if (slide.buttonLink) replaceHref(`slide-link-${index + 1}`, slide.buttonLink);
          if (slide.background) replaceBackgroundImage(`slide-bg-${index + 1}`, getImageUrl(slide.background));
        });
      }

      // About Section
      if (settings.about) {
        if (settings.about.teamName) replaceTextContent('about-name', settings.about.teamName);
        if (settings.about.backgroundImage) replaceBackgroundImage('about-bg', getImageUrl(settings.about.backgroundImage, 973, 983));
        if (settings.about.signatureImage) replaceImageSrc('signature-img', getImageUrl(settings.about.signatureImage, 163, 31));
        if (settings.about.signatureName) replaceTextContent('signature-name', settings.about.signatureName);
        
        // Bio content
        if (settings.about.bio && settings.about.bio.length > 0) {
          const bioContainer = document.getElementById('about-bio');
          if (bioContainer) {
            bioContainer.innerHTML = ''; // Clear existing content
            settings.about.bio.forEach(block => {
              const p = document.createElement('p');
              p.className = 'about-text';
              p.textContent = block.children.map(child => child.text).join('');
              bioContainer.appendChild(p);
            });
          }
        }
      }

      // Why Choose Cards
      if (settings.whyChoose && settings.whyChoose.length > 0) {
        settings.whyChoose.forEach((card, index) => {
          replaceTextContent(`service-title-${index + 1}`, card.title);
          replaceTextContent(`service-desc-${index + 1}`, card.text);
          // Update icon if needed
          const iconElement = document.getElementById(`service-icon-${index + 1}`);
          if (iconElement && card.icon) {
            iconElement.className = card.icon;
          }
        });
      }

      // Counters
      if (settings.counters && settings.counters.length > 0) {
        settings.counters.forEach((counter, index) => {
          const counterElement = document.getElementById(`counter-${index + 1}`);
          if (counterElement) {
            counterElement.setAttribute('data-count-to', counter.number);
            counterElement.textContent = counter.number;
          }
          replaceTextContent(`counter-label-${index + 1}`, counter.label);
        });
      }

    // Footer
      if (settings.footer) {
        // Replace heading
        if (settings.footer.heading) {
          const headingElement = document.getElementById('footer-heading');
          if (headingElement) headingElement.textContent = settings.footer.heading;
        }
        
        // Replace email
        if (settings.footer.email) {
          const emailElement = document.getElementById('footer-email');
          const emailLinkElement = document.getElementById('footer-email-link');
          
          if (emailElement) emailElement.textContent = settings.footer.email;
          if (emailLinkElement) emailLinkElement.href = `mailto:${settings.footer.email}`;
        }
        
        // Replace copyright name
        if (settings.footer.copyrightName) {
          const copyrightElement = document.getElementById('footer-copyright-name');
          if (copyrightElement) copyrightElement.textContent = settings.footer.copyrightName;
        }
      }
      // Social Links
      if (settings.socialLinks) {
        const heroSocial = document.getElementById('hero-social');
        const footerSocial = document.getElementById('footer-social');
        
        if (heroSocial) {
          heroSocial.innerHTML = ''; // Clear existing
          if (settings.socialLinks.twitter) heroSocial.innerHTML += `<li><a target="_blank" href="${settings.socialLinks.twitter}"><i class="fab fa-twitter"></i></a></li>`;
          if (settings.socialLinks.facebook) heroSocial.innerHTML += `<li><a target="_blank" href="${settings.socialLinks.facebook}"><i class="fab fa-facebook-f"></i></a></li>`;
          if (settings.socialLinks.behance) heroSocial.innerHTML += `<li><a target="_blank" href="${settings.socialLinks.behance}"><i class="fab fa-behance"></i></a></li>`;
        }
        
        if (footerSocial) {
          footerSocial.innerHTML = ''; // Clear existing
          if (settings.socialLinks.twitter) footerSocial.innerHTML += `<li><a target="_blank" class="twitter" href="${settings.socialLinks.twitter}">Twitter</a></li>`;
          if (settings.socialLinks.behance) footerSocial.innerHTML += `<li><a target="_blank" class="behance" href="${settings.socialLinks.behance}">Behance</a></li>`;
          if (settings.socialLinks.dribbble) footerSocial.innerHTML += `<li><a target="_blank" class="dribbble" href="${settings.socialLinks.dribbble}">Dribbble</a></li>`;
          if (settings.socialLinks.github) footerSocial.innerHTML += `<li><a target="_blank" class="github" href="${settings.socialLinks.github}">Github</a></li>`;
        }
      }
    }

// ===== CLIENTS =====
if (clients && clients.length > 0) {
  const clientsWrapper = document.getElementById('clients-wrapper');
  if (clientsWrapper) {
    clientsWrapper.innerHTML = ''; // Clear existing clients
    
    clients.forEach(client => {
      const clientSlide = document.createElement('div');
      clientSlide.className = 'swiper-slide';
      clientSlide.innerHTML = `
        <div class="image-box">
          <a href="${client.url || '#'}">
            <img src="${getImageUrl(client.logo, 200, 85)}" alt="${client.name}">
          </a>
        </div>
      `;
      clientsWrapper.appendChild(clientSlide);
    });

    // Reinitialize Swiper after content replacement
    if (window.clientsSwiper) {
      window.clientsSwiper.destroy(true, true);
    }
    window.clientsSwiper = new Swiper('.client-active', {
      slidesPerView: 1,
      breakpoints: {
        0: { slidesPerView: 2, spaceBetween: 20 },
        576: { slidesPerView: 3, spaceBetween: 30 },
        768: { slidesPerView: 4, spaceBetween: 40 },
        992: { slidesPerView: 5, spaceBetween: 40 },
      }
    });
  }
}

// ===== PROJECTS =====
if (projects && projects.length > 0) {
  console.log('📁 PROJECTS DATA FETCHED FROM SANITY:', projects);
  console.log(`📊 Found ${projects.length} projects in Sanity`);
  
  // Define which projects go in each tab
  const tabProjects = {
    'projects-all': projects, // All projects
    'projects-webapps': projects.filter(p => p.category === 'Web Applications'),
    'projects-ecommerce': projects.filter(p => p.category === 'E-commerce'), 
    'projects-dashboards': projects.filter(p => p.category === 'Dashboards')
  };

  // For each tab container
  ['projects-all', 'projects-webapps', 'projects-ecommerce', 'projects-dashboards'].forEach(containerId => {
    const container = document.getElementById(containerId);
    if (!container) {
      console.log(`❌ Container ${containerId} not found`);
      return;
    }

    const tabSpecificProjects = tabProjects[containerId];
    console.log(`🔄 Processing ${containerId}: ${tabSpecificProjects.length} projects for this tab`);

    const existingSlides = container.querySelectorAll('.swiper-slide');
    console.log(`📦 Found ${existingSlides.length} existing slides in ${containerId}`);
    
    // Step 1: Replace existing slides with filtered Sanity content
    tabSpecificProjects.forEach((project, index) => {
      const existingSlide = existingSlides[index];
      
      if (existingSlide) {
        console.log(`✅ REPLACING slide ${index + 1} with: "${project.title}" (${project.category})`);
        
        // REPLACE existing slide content
        const titleElement = existingSlide.querySelector('.title a');
        const categoryElement = existingSlide.querySelector('.subtitle');
        const imageElement = existingSlide.querySelector('.image img');
        const linkElement = existingSlide.querySelector('.thumb a');
        
        if (titleElement) titleElement.textContent = project.title;
        if (categoryElement) categoryElement.textContent = project.category || 'Project';
        if (imageElement && project.image) imageElement.src = getImageUrl(project.image);
        if (linkElement) linkElement.href = project.link || '#';
      } else {
        console.log(`➕ ADDING new slide for: "${project.title}" (${project.category})`);
        // ADD new slide if we have more projects than existing slides
        const newSlide = document.createElement('div');
        newSlide.className = 'swiper-slide';
        newSlide.innerHTML = `
          <div class="single-project-slide">
            <div class="thumb">
              <a href="${project.link || '#'}" class="image">
                <img class="fit-image" src="${getImageUrl(project.image)}" alt="${project.title}" />
              </a>
            </div>
            <div class="content">
              <h4 class="subtitle">${project.category || 'Project'}</h4>
              <h3 class="title"><a href="${project.link || '#'}">${project.title}</a></h3>
            </div>
          </div>
        `;
        container.appendChild(newSlide);
      }
    });

    // Step 2: Remove extra slides if we have fewer filtered projects
    if (tabSpecificProjects.length < existingSlides.length) {
      const slidesToRemove = existingSlides.length - tabSpecificProjects.length;
      console.log(`🗑️ REMOVING ${slidesToRemove} extra slides from ${containerId}`);
      
      for (let i = tabSpecificProjects.length; i < existingSlides.length; i++) {
        existingSlides[i].remove();
      }
    }
    
    console.log(`🎉 ${containerId} update completed: ${tabSpecificProjects.length} projects shown`);
  });
  
  console.log('✅ ALL PROJECTS PROCESSING COMPLETE');
} else {
  console.log('❌ No projects found in Sanity or projects array is empty');
}

  // ===== TESTIMONIALS =====
if (testimonials && testimonials.length > 0) {
  console.log('🗣️ TESTIMONIALS DATA FETCHED FROM SANITY:', testimonials);
  console.log(`📊 Found ${testimonials.length} testimonials in Sanity`);

  // Get available testimonials (random selection if more than 2)
  let availableTestimonials = [];
  if (testimonials.length <= 2) {
    availableTestimonials = testimonials;
  } else {
    // Randomly select 2 testimonials from available pool
    const shuffled = [...testimonials].sort(() => 0.5 - Math.random());
    availableTestimonials = shuffled.slice(0, 2);
  }

  console.log(`🎯 Using ${availableTestimonials.length} testimonials for display`);

  // Process slide 1
  const slide1 = document.getElementById('testimonial-slide-1');
  const name1 = document.getElementById('testimonial-name-1');
  const position1 = document.getElementById('testimonial-position-1');
  const content1 = document.getElementById('testimonial-content-1');

  if (availableTestimonials[0]) {
    console.log(`✅ REPLACING slide 1 with: ${availableTestimonials[0].name}`);
    
    if (name1) name1.textContent = availableTestimonials[0].name;
    if (position1) position1.textContent = availableTestimonials[0].position || '';
    if (content1) content1.textContent = availableTestimonials[0].content;
    
    // Ensure slide 1 is visible
    if (slide1) slide1.style.display = 'block';
  } else {
    console.log('❌ No data for slide 1 - hiding it');
    if (slide1) slide1.style.display = 'none';
  }

  // Process slide 2
  const slide2 = document.getElementById('testimonial-slide-2');
  const name2 = document.getElementById('testimonial-name-2');
  const position2 = document.getElementById('testimonial-position-2');
  const content2 = document.getElementById('testimonial-content-2');

  if (availableTestimonials[1]) {
    console.log(`✅ REPLACING slide 2 with: ${availableTestimonials[1].name}`);
    
    if (name2) name2.textContent = availableTestimonials[1].name;
    if (position2) position2.textContent = availableTestimonials[1].position || '';
    if (content2) content2.textContent = availableTestimonials[1].content;
    
    // Ensure slide 2 is visible
    if (slide2) slide2.style.display = 'block';
  } else {
    console.log('❌ No data for slide 2 - hiding it');
    if (slide2) slide2.style.display = 'none';
  }

  console.log('✅ TESTIMONIALS PROCESSING COMPLETE');
} else {
  console.log('❌ No testimonials data found in Sanity');
  
  // Hide both slides if no data
  const slide1 = document.getElementById('testimonial-slide-1');
  const slide2 = document.getElementById('testimonial-slide-2');
  if (slide1) slide1.style.display = 'none';
  if (slide2) slide2.style.display = 'none';
}

// ===== FEATURED PROJECTS TIMELINE =====
if (featured && featured.length > 0) {
  console.log('📅 FEATURED DATA FETCHED FROM SANITY:', featured);
  console.log(`📊 Found ${featured.length} featured years in Sanity`);

  // Target the main container by ID
  const featuredContainer = document.getElementById('featured-container');
  if (!featuredContainer) {
    console.log('❌ Featured container not found');
    return;
  }

  // Process each year from Sanity data
  featured.forEach((yearBlock, yearIndex) => {
    const yearId = `year-${yearBlock.year}`;
    const existingYearBlock = document.getElementById(yearId);
    
    if (existingYearBlock) {
      console.log(`✅ FOUND existing year block: ${yearBlock.year}`);
      
      // Update year text by ID
      const yearTextElement = document.getElementById(`year-text-${yearBlock.year}`);
      if (yearTextElement) {
        yearTextElement.querySelector('p').textContent = yearBlock.year;
      }
      
      // Process projects for this year
      yearBlock.projects.forEach((project, projectIndex) => {
        const achievementId = `achievement-${yearBlock.year}-${projectIndex + 1}`;
        const existingAchievement = document.getElementById(achievementId);
        
        if (existingAchievement) {
          console.log(`   ✅ REPLACING achievement ${achievementId} with: "${project.title}"`);
          
          // Update existing achievement
          const tagElement = existingAchievement.querySelector('.sub-title');
          const titleElement = existingAchievement.querySelector('.title a');
          
          if (tagElement) {
            tagElement.textContent = project.tag;
            tagElement.className = `sub-title ${project.tagColor || 'text-primary'}`;
          }
          if (titleElement) {
            titleElement.textContent = project.title;
            titleElement.href = project.link || '#';
          }
        } else {
          console.log(`   ➕ ADDING new achievement: "${project.title}"`);
          // Create new achievement item
          const newAchievement = document.createElement('div');
          newAchievement.className = 'achieved-item';
          newAchievement.id = `achievement-${yearBlock.year}-${projectIndex + 1}`;
          newAchievement.innerHTML = `
            <span class="sub-title ${project.tagColor || 'text-primary'}">${project.tag}</span>
            <h2 class="title"><a href="${project.link || '#'}">${project.title}</a></h2>
          `;
          existingYearBlock.querySelector('.col-lg-9').appendChild(newAchievement);
        }
      });

      // Remove extra achievements if Sanity has fewer projects
      const allAchievements = existingYearBlock.querySelectorAll('.achieved-item');
      if (yearBlock.projects.length < allAchievements.length) {
        const achievementsToRemove = allAchievements.length - yearBlock.projects.length;
        console.log(`   🗑️ REMOVING ${achievementsToRemove} extra achievements from year ${yearBlock.year}`);
        
        for (let i = yearBlock.projects.length; i < allAchievements.length; i++) {
          allAchievements[i].remove();
        }
      }
    } else {
      console.log(`➕ CREATING new year block for: ${yearBlock.year}`);
      // Create new year block if it doesn't exist
      const newYearBlock = document.createElement('div');
      newYearBlock.className = 'achieved-year wow fadeInUp';
      newYearBlock.id = `year-${yearBlock.year}`;
      newYearBlock.innerHTML = `
        <div class="row">
          <div class="col-lg-3">
            <div class="year-text" id="year-text-${yearBlock.year}"><p>${yearBlock.year}</p></div>
          </div>
          <div class="col-lg-9">
            ${yearBlock.projects.map((project, projectIndex) => `
              <div class="achieved-item" id="achievement-${yearBlock.year}-${projectIndex + 1}">
                <span class="sub-title ${project.tagColor || 'text-primary'}">${project.tag}</span>
                <h2 class="title"><a href="${project.link || '#'}">${project.title}</a></h2>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      featuredContainer.appendChild(newYearBlock);
    }
  });

  // Remove years that exist in HTML but not in Sanity data
  const allYearBlocks = featuredContainer.querySelectorAll('.achieved-year');
  allYearBlocks.forEach(existingYearBlock => {
    const yearId = existingYearBlock.id;
    const yearFromId = yearId.replace('year-', '');
    const existsInSanity = featured.some(sanityYear => sanityYear.year.toString() === yearFromId);
    
    if (!existsInSanity) {
      console.log(`🗑️ REMOVING year block not in Sanity: ${yearFromId}`);
      existingYearBlock.remove();
    }
  });

  console.log('✅ FEATURED SECTION PROCESSING COMPLETE');
} else {
  console.log('❌ No featured data found in Sanity');
}

    console.log('All content replacement completed!');
    console.log('Hero slides:', settings.heroSlides);
    console.log('Slide 3:', settings.heroSlides[2]);

  } catch (error) {
    console.error('Error loading content from Sanity:', error);
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContent);
} else {
  initializeContent();
}