// projects.js - Projects Grid & Details Content Replacement

// Projects Grid Initialization
async function initializeProjectsGrid() {
  try {
    console.log('📁 Loading projects grid from Sanity...');
    
    // Use the existing fetchFromSanity function from app.js
    const projects = await fetchFromSanity(`*[_type == "project_main"] | order(_createdAt desc){
      title,
      slug,
      category,
      filterClasses,
      gridImage
    }`);

    // ===== PROJECTS GRID =====
    if (projects && projects.length > 0) {
      console.log('📁 PROJECTS DATA FETCHED FROM SANITY:', projects);
      console.log(`📊 Found ${projects.length} projects in Sanity`);

      const projectsGrid = document.getElementById('projects-grid');
      if (!projectsGrid) {
        console.log('❌ Projects grid container not found');
        return;
      }

      const existingProjects = projectsGrid.querySelectorAll('.single-project');
      console.log(`🔄 Found ${existingProjects.length} existing project cards`);

      // Clear pagination state
      window.currentProjectsPage = 1;
      window.allProjects = projects;
      window.projectsPerPage = 9;

      // Load first page
      loadProjectsPage(1);

    } else {
      console.log('❌ No projects found in Sanity');
      // Hide all projects if no data
      const existingProjects = document.querySelectorAll('.single-project');
      existingProjects.forEach(project => project.style.display = 'none');
    }

  } catch (error) {
    console.error('Error loading projects from Sanity:', error);
  }
}

// Load specific page of projects
// Load specific page of projects
function loadProjectsPage(page) {
  const projectsGrid = document.getElementById('projects-grid');
  const existingProjects = projectsGrid.querySelectorAll('.single-project');
  const startIndex = (page - 1) * window.projectsPerPage;
  const endIndex = startIndex + window.projectsPerPage;
  const pageProjects = window.allProjects.slice(startIndex, endIndex);

  console.log(`📄 Loading page ${page}: projects ${startIndex + 1}-${endIndex}`);

  // Replace existing projects with current page data
  pageProjects.forEach((project, index) => {
    const existingProject = existingProjects[index];
    
    if (existingProject) {
      console.log(`✅ REPLACING project ${index + 1} with: "${project.title}"`);
      
      // Update project card
      const imageElement = existingProject.querySelector('.project-images img');
      const imageLink = existingProject.querySelector('.project-images a');
      const titleElement = existingProject.querySelector('.title a');
      const categoryElement = existingProject.querySelector('.category');
      
      if (imageElement && project.gridImage) {
        imageElement.src = getImageUrl(project.gridImage);
        imageElement.alt = project.title;
      }
      
      if (imageLink && project.slug) {
        imageLink.href = `project-details.html?project=${project.slug.current}`;
      }
      
      if (titleElement) {
        titleElement.textContent = project.title;
        if (project.slug) {
          titleElement.href = `project-details.html?project=${project.slug.current}`;
        }
      }
      
      if (categoryElement && project.category) {
        categoryElement.textContent = project.category;
      }
      
      // Update filter classes
      if (project.filterClasses && project.filterClasses.length > 0) {
        const parentCol = existingProject.closest('.col-xl-4');
        if (parentCol) {
          // Remove existing filter classes
          parentCol.className = 'col-xl-4 col-md-6';
          // Add new filter classes
          project.filterClasses.forEach(filterClass => {
            parentCol.classList.add(filterClass);
          });
        }
      }
      
      // Show the project
      existingProject.style.display = 'block';
    }
  });

  // Hide extra projects on this page
  for (let i = pageProjects.length; i < window.projectsPerPage; i++) {
    if (existingProjects[i]) {
      existingProjects[i].style.display = 'none';
    }
  }

  // Update pagination
  updatePaginationControls();

  // FIX: Trigger Isotope filter to reorganize grid and remove empty spaces
  setTimeout(() => {
    const allFilter = document.querySelector('.filter-menu li[data-filter="*"]');
    if (allFilter) {
      allFilter.click();
      console.log('🔄 Triggered Isotope filter to remove empty spaces');
    }
  }, 100);
}

// Update pagination controls
function updatePaginationControls() {
  const totalPages = Math.ceil(window.allProjects.length / window.projectsPerPage);
  const loadMoreBtn = document.querySelector('.load-more .more');
  
  if (loadMoreBtn) {
    if (window.currentProjectsPage < totalPages) {
      loadMoreBtn.style.display = 'block';
      loadMoreBtn.textContent = 'load more';
      loadMoreBtn.onclick = (e) => {
        e.preventDefault();
        window.currentProjectsPage++;
        loadProjectsPage(window.currentProjectsPage);
      };
    } else {
      loadMoreBtn.style.display = 'none';
    }
  }
}

// Project Details Initialization
async function initializeProjectDetails() {
  try {
    console.log('📄 Loading project details from Sanity...');
    
    // Get project slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectSlug = urlParams.get('project');
    
    if (!projectSlug) {
      console.log('❌ No project specified in URL');
      return;
    }

    // Use the existing fetchFromSanity function from app.js
    const project = await fetchFromSanity(`*[_type == "project_main" && slug.current == "${projectSlug}"][0]{
      title,
      pageTitle,
      pageSubtitle,
      challengeLabel,
      challengeTitle,
      client,
      date,
      team,
      services,
      conceptTitle,
      conceptDescription,
      mainDetailImage,
      leftColumnImage,
      rightColumnImage,
      bottomDetailImage,
      testimonial,
      clientName,
      clientPosition,
      socialLinks,
      nextProjectLink
    }`);

    // ===== PROJECT DETAILS =====
    if (project) {
      console.log('📄 PROJECT DETAILS FETCHED FROM SANITY:', project);
      
      // Page Banner
      if (project.pageTitle) replaceTextContent('project-page-title', project.pageTitle);
      if (project.pageSubtitle) replaceTextContent('project-page-subtitle', project.pageSubtitle);
      
      // Challenge Section
      if (project.challengeLabel) replaceTextContent('project-challenge-label', project.challengeLabel);
      if (project.challengeTitle) replaceTextContent('project-challenge-title', project.challengeTitle);
      
      // Info Section
      if (project.client) replaceTextContent('project-client', project.client);
      if (project.date) {
        const formattedDate = new Date(project.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        replaceTextContent('project-date', formattedDate);
      }
      if (project.team) replaceTextContent('project-team', project.team);
      if (project.services) replaceTextContent('project-services', project.services);
      
      // Concept Section
      if (project.conceptTitle) replaceTextContent('project-concept-title', project.conceptTitle);
      if (project.conceptDescription) replaceTextContent('project-concept-description', project.conceptDescription);
      
      // Images
      if (project.mainDetailImage) replaceImageSrc('project-main-image', getImageUrl(project.mainDetailImage));
      if (project.leftColumnImage) replaceImageSrc('project-left-image', getImageUrl(project.leftColumnImage));
      if (project.rightColumnImage) replaceImageSrc('project-right-image', getImageUrl(project.rightColumnImage));
      if (project.bottomDetailImage) replaceImageSrc('project-bottom-image', getImageUrl(project.bottomDetailImage));
      
      // Testimonial
      if (project.testimonial) replaceTextContent('project-testimonial', project.testimonial);
      if (project.clientName) replaceTextContent('project-client-name', project.clientName);
      if (project.clientPosition) replaceTextContent('project-client-position', project.clientPosition);
      
      // Social Links
      if (project.socialLinks) {
        if (project.socialLinks.twitter) replaceHref('project-twitter-link', project.socialLinks.twitter);
        if (project.socialLinks.facebook) replaceHref('project-facebook-link', project.socialLinks.facebook);
        if (project.socialLinks.googleplus) replaceHref('project-googleplus-link', project.socialLinks.googleplus);
      }
      
      // Next Project
      if (project.nextProjectLink) replaceHref('project-next-link', project.nextProjectLink);
      
      console.log('✅ PROJECT DETAILS PROCESSING COMPLETE');
    } else {
      console.log('❌ Project not found in Sanity');
    }

  } catch (error) {
    console.error('Error loading project details from Sanity:', error);
  }
}

// Wait for DOM to be ready AND app.js to be loaded
function waitForAppJS() {
  if (typeof fetchFromSanity === 'undefined') {
    setTimeout(waitForAppJS, 100);
  } else {
    // Determine which page we're on and initialize accordingly
    if (document.getElementById('projects-grid')) {
      // Projects grid page
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProjectsGrid);
      } else {
        initializeProjectsGrid();
      }
    } else if (window.location.pathname.includes('project-details')) {
      // Project details page
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProjectDetails);
      } else {
        initializeProjectDetails();
      }
    }
  }
}

waitForAppJS();