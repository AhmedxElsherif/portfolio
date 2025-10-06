// Sample project data
const projects = [
    {
        id: 1,
        title: "E-Commerce Platform",
        description: "A full-featured online shopping platform with payment integration, user authentication, and admin dashboard.",
        image: "project1.jpg",
        tags: ["React", "Node.js", "MongoDB"],
        fullDescription: `
            <h3>Project Overview</h3>
            <p>This e-commerce platform is a comprehensive solution for online retail businesses. Built with modern web technologies, it provides a seamless shopping experience for customers and powerful management tools for administrators.</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>User authentication and authorization system</li>
                <li>Product catalog with search and filtering</li>
                <li>Shopping cart and checkout process</li>
                <li>Payment gateway integration (Stripe)</li>
                <li>Order tracking and management</li>
                <li>Admin dashboard for inventory management</li>
                <li>Responsive design for all devices</li>
            </ul>
            
            <h3>Technologies Used</h3>
            <p>Frontend: React.js, Redux for state management, Material-UI for components</p>
            <p>Backend: Node.js with Express.js framework</p>
            <p>Database: MongoDB with Mongoose ODM</p>
            <p>Payment: Stripe API integration</p>
            
            <h3>Challenges & Solutions</h3>
            <p>One of the main challenges was implementing a secure payment system. I addressed this by using Stripe's secure payment processing and implementing proper error handling and validation throughout the checkout process.</p>
        `,
        github: "https://github.com",
        demo: "https://example.com"
    },
    {
        id: 2,
        title: "Task Management App",
        description: "A collaborative task management application with real-time updates, team collaboration features, and progress tracking.",
        image: "project2.jpg",
        tags: ["Vue.js", "Firebase", "Tailwind"],
        fullDescription: `
            <h3>Project Overview</h3>
            <p>A modern task management application designed to help teams collaborate effectively and track project progress in real-time.</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>Real-time task updates using Firebase</li>
                <li>Team collaboration and task assignment</li>
                <li>Project boards with drag-and-drop functionality</li>
                <li>Progress tracking and analytics</li>
                <li>File attachments and comments</li>
                <li>Notifications and reminders</li>
            </ul>
            
            <h3>Technologies Used</h3>
            <p>Frontend: Vue.js 3 with Composition API</p>
            <p>Backend: Firebase (Firestore, Authentication, Storage)</p>
            <p>Styling: Tailwind CSS</p>
            
            <h3>Challenges & Solutions</h3>
            <p>Implementing real-time synchronization across multiple users was challenging. I leveraged Firebase's real-time database capabilities and optimized the data structure to minimize reads and writes.</p>
        `,
        github: "https://github.com",
        demo: "https://example.com"
    },
    {
        id: 3,
        title: "Weather Dashboard",
        description: "An interactive weather dashboard that displays current conditions, forecasts, and weather maps with beautiful visualizations.",
        image: "project3.jpg",
        tags: ["JavaScript", "API", "Chart.js"],
        fullDescription: `
            <h3>Project Overview</h3>
            <p>A comprehensive weather dashboard that provides detailed weather information with beautiful data visualizations and an intuitive user interface.</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>Current weather conditions for any location</li>
                <li>7-day weather forecast</li>
                <li>Interactive weather maps</li>
                <li>Temperature, humidity, and wind speed charts</li>
                <li>Location search with autocomplete</li>
                <li>Favorite locations saving</li>
            </ul>
            
            <h3>Technologies Used</h3>
            <p>Frontend: Vanilla JavaScript, HTML5, CSS3</p>
            <p>API: OpenWeatherMap API</p>
            <p>Visualization: Chart.js for data charts</p>
            
            <h3>Challenges & Solutions</h3>
            <p>Handling API rate limits and caching data efficiently was a key challenge. I implemented a smart caching system using localStorage to reduce API calls while keeping data fresh.</p>
        `,
        github: "https://github.com",
        demo: "https://example.com"
    },
    {
        id: 4,
        title: "Portfolio Website Builder",
        description: "A drag-and-drop website builder that allows users to create professional portfolio websites without coding.",
        image: "project4.jpg",
        tags: ["React", "TypeScript", "CSS Grid"],
        fullDescription: `
            <h3>Project Overview</h3>
            <p>An intuitive website builder that empowers users to create stunning portfolio websites through a simple drag-and-drop interface.</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>Drag-and-drop interface for easy customization</li>
                <li>Pre-designed templates and components</li>
                <li>Real-time preview</li>
                <li>Export to HTML/CSS</li>
                <li>Responsive design tools</li>
                <li>Custom domain support</li>
            </ul>
            
            <h3>Technologies Used</h3>
            <p>Frontend: React with TypeScript</p>
            <p>State Management: Redux Toolkit</p>
            <p>Layout: CSS Grid and Flexbox</p>
            <p>Drag & Drop: React DnD library</p>
            
            <h3>Challenges & Solutions</h3>
            <p>Creating a flexible component system that could handle various layouts was complex. I designed a modular architecture with reusable components and a robust state management system.</p>
        `,
        github: "https://github.com",
        demo: "https://example.com"
    },
    {
        id: 5,
        title: "Social Media Analytics",
        description: "A comprehensive analytics dashboard for social media metrics with data visualization and reporting features.",
        image: "project5.jpg",
        tags: ["Python", "Django", "D3.js"],
        fullDescription: `
            <h3>Project Overview</h3>
            <p>A powerful analytics platform that helps businesses track and analyze their social media performance across multiple platforms.</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>Multi-platform integration (Twitter, Facebook, Instagram)</li>
                <li>Real-time metrics tracking</li>
                <li>Custom reports and exports</li>
                <li>Engagement analytics</li>
                <li>Competitor analysis</li>
                <li>Automated reporting</li>
            </ul>
            
            <h3>Technologies Used</h3>
            <p>Backend: Python with Django framework</p>
            <p>Frontend: JavaScript with D3.js for visualizations</p>
            <p>Database: PostgreSQL</p>
            <p>APIs: Social media platform APIs</p>
            
            <h3>Challenges & Solutions</h3>
            <p>Handling large volumes of data and creating efficient visualizations was challenging. I implemented data aggregation strategies and optimized database queries for better performance.</p>
        `,
        github: "https://github.com",
        demo: "https://example.com"
    },
    {
        id: 6,
        title: "Fitness Tracking App",
        description: "A mobile-first fitness application for tracking workouts, nutrition, and progress with personalized recommendations.",
        image: "project6.jpg",
        tags: ["React Native", "GraphQL", "AWS"],
        fullDescription: `
            <h3>Project Overview</h3>
            <p>A comprehensive fitness tracking application that helps users achieve their health and fitness goals through personalized tracking and recommendations.</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>Workout logging and tracking</li>
                <li>Nutrition and calorie tracking</li>
                <li>Progress photos and measurements</li>
                <li>Personalized workout plans</li>
                <li>Social features and challenges</li>
                <li>Integration with wearable devices</li>
            </ul>
            
            <h3>Technologies Used</h3>
            <p>Mobile: React Native for cross-platform development</p>
            <p>Backend: GraphQL API with Apollo Server</p>
            <p>Cloud: AWS (Lambda, S3, DynamoDB)</p>
            <p>Authentication: AWS Cognito</p>
            
            <h3>Challenges & Solutions</h3>
            <p>Ensuring smooth performance on various devices and handling offline functionality were key challenges. I implemented efficient data caching and optimized image handling for better performance.</p>
        `,
        github: "https://github.com",
        demo: "https://example.com"
    }
];

// Load projects on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
});

function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    projects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    card.innerHTML = `
        <img src="${project.image}" alt="${project.title}" class="project-image" onerror="this.style.background='linear-gradient(135deg, #667eea 0%, #764ba2 100%)'">
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tags">
                ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <a href="project.html?id=${project.id}" class="btn">View More</a>
        </div>
    `;
    
    return card;
}

// Export projects data for use in project detail page
if (typeof window !== 'undefined') {
    window.projectsData = projects;
}
