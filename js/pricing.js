// pricing.js - Pricing Banner & Table Content Replacement

// Pricing Banner & Table Initialization
async function initializePricingContent() {
  try {
    console.log('💰 Loading pricing content from Sanity...');
    
    // Use the existing fetchFromSanity function from app.js
    const [pricing, pricingTable, faqs] = await Promise.all([
      fetchFromSanity(`*[_type == "pricing"][0]{
        title,
        highlightedText,
        subtitle,
        backgroundImage
      }`),
      fetchFromSanity(`*[_type == "pricingTable"][0]{
        plans
      }`),
     fetchFromSanity(`*[_type == "faq"][0]{
    categories
  }`)
]);

    // ===== PRICING BANNER =====
    if (pricing) {
      console.log('💰 PRICING BANNER DATA FETCHED FROM SANITY:', pricing);
      
      // Use existing helper functions from app.js
      // Replace background image
      if (pricing.backgroundImage) {
        replaceBackgroundImage('pricing-banner', getImageUrl(pricing.backgroundImage));
      }
      
      // Replace highlighted text
      if (pricing.highlightedText) {
        replaceTextContent('pricing-highlighted-text', pricing.highlightedText);
      }
      
      // Replace main title text
      if (pricing.title) {
        replaceTextContent('pricing-main-text', pricing.title);
      }
      
      // Replace subtitle
      if (pricing.subtitle) {
        replaceTextContent('pricing-subtitle', pricing.subtitle);
      }
      
      console.log('✅ PRICING BANNER PROCESSING COMPLETE');
    } else {
      console.log('❌ No pricing banner data found in Sanity');
    }

    // ===== PRICING TABLE =====
    if (pricingTable && pricingTable.plans && pricingTable.plans.length > 0) {
      console.log('💰 PRICING TABLE DATA FETCHED FROM SANITY:', pricingTable);
      
      pricingTable.plans.forEach((plan, index) => {
        const planNumber = index + 1;
        console.log(`🔄 Processing plan ${planNumber}: ${plan.title}`);
        
        // Update plan title
        if (plan.title) {
          replaceTextContent(`pricing-title-${planNumber}`, plan.title);
        }
        
        // Update subtitle (popular badge)
        const subtitleElement = document.getElementById(`pricing-subtitle-${planNumber}`);
        if (subtitleElement) {
          if (plan.subtitle) {
            subtitleElement.textContent = plan.subtitle;
            subtitleElement.style.display = 'block';
          } else {
            subtitleElement.style.display = 'none';
          }
        }
        
        // Update icon
        const iconElement = document.getElementById(`pricing-icon-${planNumber}`);
        if (iconElement && plan.icon) {
          iconElement.className = plan.icon;
        }
        
        // Update price
        if (plan.price) {
          replaceTextContent(`pricing-price-${planNumber}`, plan.price);
        }
        
        // Update period
        if (plan.period) {
          replaceTextContent(`pricing-period-${planNumber}`, plan.period);
        }
        
        // Update features list
        const featuresElement = document.getElementById(`pricing-features-${planNumber}`);
        if (featuresElement && plan.features && plan.features.length > 0) {
          featuresElement.innerHTML = '';
          plan.features.forEach(feature => {
            const li = document.createElement('li');
            li.innerHTML = feature.replace(/\n/g, '<br>');
            featuresElement.appendChild(li);
          });
        }
        
        // Update button
        const buttonElement = document.getElementById(`pricing-button-${planNumber}`);
        if (buttonElement) {
          if (plan.buttonText) {
            buttonElement.textContent = plan.buttonText;
          }
          if (plan.buttonLink) {
            buttonElement.href = plan.buttonLink;
          }
        }
        
        console.log(`✅ Plan ${planNumber} updated successfully`);
      });
      
      console.log('✅ PRICING TABLE PROCESSING COMPLETE');
    } else {
      console.log('❌ No pricing table data found in Sanity');
    }

    // ===== FAQ SECTION =====
    if (faqs && faqs.categories && faqs.categories.length > 0) {
      console.log('❓ FAQ DATA FETCHED FROM SANITY:', faqs);
      console.log(`📊 Found ${faqs.categories.length} FAQ categories in Sanity`);

      faqs.categories.forEach((category, categoryIndex) => {
        const tabNumber = categoryIndex + 1;
        console.log(`🔄 Processing FAQ category ${tabNumber}: ${category.tabName}`);
        
        // Update tab name in navigation
        const tabNavElement = document.querySelector(`.faq-menu a[href="#${category.tabId}"]`);
        if (tabNavElement && category.tabName) {
          tabNavElement.textContent = category.tabName;
        }
        
        // Update questions in tab content
        const tabContentElement = document.getElementById(category.tabId);
        if (tabContentElement && category.questions && category.questions.length > 0) {
          const existingFaqs = tabContentElement.querySelectorAll('.single-faq');
          
          // Replace existing FAQs
          category.questions.forEach((faq, faqIndex) => {
            const existingFaq = existingFaqs[faqIndex];
            
            if (existingFaq) {
              console.log(`   ✅ REPLACING FAQ ${faqIndex + 1} with: "${faq.question}"`);
              
              const questionElement = existingFaq.querySelector('.title');
              const answerElement = existingFaq.querySelector('p');
              
              if (questionElement) questionElement.textContent = faq.question;
              if (answerElement) answerElement.textContent = faq.answer;
            } else {
              console.log(`   ➕ ADDING new FAQ: "${faq.question}"`);
              // Add new FAQ if we have more questions than existing FAQs
              const newFaq = document.createElement('div');
              newFaq.className = 'single-faq';
              newFaq.innerHTML = `
                <h4 class="title">${faq.question}</h4>
                <p>${faq.answer}</p>
              `;
              tabContentElement.appendChild(newFaq);
            }
          });

          // Remove extra FAQs if we have fewer Sanity questions
          if (category.questions.length < existingFaqs.length) {
            const faqsToRemove = existingFaqs.length - category.questions.length;
            console.log(`   🗑️ REMOVING ${faqsToRemove} extra FAQs from category ${category.tabName}`);
            
            for (let i = category.questions.length; i < existingFaqs.length; i++) {
              existingFaqs[i].remove();
            }
          }
        }
        
        console.log(`✅ FAQ category ${tabNumber} updated successfully`);
      });
      
      console.log('✅ FAQ SECTION PROCESSING COMPLETE');
    } else {
      console.log('❌ No FAQ data found in Sanity');
    }

  } catch (error) {
    console.error('Error loading pricing content from Sanity:', error);
  }
}



// Wait for DOM to be ready AND app.js to be loaded
function waitForAppJS() {
  if (typeof fetchFromSanity === 'undefined') {
    setTimeout(waitForAppJS, 100);
  } else {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializePricingContent);
    } else {
      initializePricingContent();
    }
  }
}

waitForAppJS();