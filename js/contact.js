// contact.js - Contact Section Content Replacement

// Contact Section Initialization
async function initializeContactContent() {
  try {
    console.log('📞 Loading contact content from Sanity...');
    
    // Use the existing fetchFromSanity function from app.js
    const contact = await fetchFromSanity(`*[_type == "contact"][0]{
      backgroundImage,
      email,
      phone,
      formAction,
      socialLinks
    }`);

    // ===== CONTACT SECTION =====
    if (contact) {
      console.log('📞 CONTACT DATA FETCHED FROM SANITY:', contact);
      
      // Background Image
      if (contact.backgroundImage) {
        replaceBackgroundImage('contact-bg', getImageUrl(contact.backgroundImage));
      }
      
      // Contact Info
      if (contact.email) {
        const emailElement = document.getElementById('contact-email');
        const emailLink = document.getElementById('contact-email-link');
        if (emailElement) emailElement.textContent = contact.email;
        if (emailLink) {
          emailLink.textContent = contact.email;
          emailLink.href = `mailto:${contact.email}`;
        }
      }
      
      if (contact.phone) {
        const phoneElement = document.getElementById('contact-phone');
        const phoneLink = document.getElementById('contact-phone-link');
        if (phoneElement) phoneElement.textContent = contact.phone;
        if (phoneLink) {
          phoneLink.textContent = contact.phone;
          phoneLink.href = `tel:${contact.phone}`;
        }
      }
      
      // Form Action
      if (contact.formAction) {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) contactForm.action = contact.formAction;
      }
      
      // Social Links
      if (contact.socialLinks) {
        if (contact.socialLinks.dribbble) replaceHref('contact-dribbble-link', contact.socialLinks.dribbble);
        if (contact.socialLinks.behance) replaceHref('contact-behance-link', contact.socialLinks.behance);
        if (contact.socialLinks.twitter) replaceHref('contact-twitter-link', contact.socialLinks.twitter);
      }
      
      console.log('✅ CONTACT SECTION PROCESSING COMPLETE');
    } else {
      console.log('❌ No contact data found in Sanity');
    }

  } catch (error) {
    console.error('Error loading contact content from Sanity:', error);
  }
}

// Wait for DOM to be ready AND app.js to be loaded
function waitForAppJS() {
  if (typeof fetchFromSanity === 'undefined') {
    setTimeout(waitForAppJS, 100);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeContactContent);
    } else {
      initializeContactContent();
    }
  }
}

waitForAppJS();