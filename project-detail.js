// Load project details when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProjectDetail();
});

function loadProjectDetail() {
    // Get project ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = parseInt(urlParams.get('id'));
    
    // Get projects data from script.js
    const projects = window.projectsData;
    
    // Find the project with matching ID
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
        document.getElementById('projectDetail').innerHTML = `
            <div style="text-align: center; padding: 100px 20px;">
                <h2>Project Not Found</h2>
                <p>The project you're looking for doesn't exist.</p>
                <a href="index.html" class="btn" style="margin-top: 20px;">Back to Portfolio</a>
            </div>
        `;
        return;
    }
    
    // Display project details
    const projectDetailContainer = document.getElementById('projectDetail');
    projectDetailContainer.innerHTML = `
        <div class="project-header">
            <h1 class="project-detail-title">${project.title}</h1>
            <div class="project-meta">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
        
        <img src="${project.image}" alt="${project.title}" class="project-detail-image" onerror="this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'">
        
        <div class="project-links">
            <a href="${project.github}" target="_blank" class="btn">View on GitHub</a>
            <a href="${project.demo}" target="_blank" class="btn-secondary">Live Demo</a>
        </div>
        
        <div class="project-content-detail">
            ${project.fullDescription}
        </div>
    `;
    
    // Update page title
    document.title = `${project.title} - My Portfolio`;
}
