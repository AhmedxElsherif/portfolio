// Sample project data
const projects = [
    {
        id: 1,
        title: "Smart Bottle-Top Dispenser",
        description: "Precision lab liquid dispenser with stepper-controlled pump and touch interface.",
        image: "projects/bottle_top_dispenser/pic.png",
        tags: ["Embedded System", "PCB Design", "KiCAD"],
        fullDescription: `
            <h3>Project Overview</h3>
            <p>The Bottle-Top Dispenser is a precision laboratory device designed to automate the dispensing of controlled liquid volumes. It provides accuracy, repeatability, and safety for handling chemicals in lab environments.

Developed as a modular system, it integrates peristaltic pump control, safety sensors, and a user-friendly interface for researchers, ensuring precise measurements with minimal human error.</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>Automated liquid dispensing with programmable volume selection</li>
                <li>High-precision stepper motor control</li>
                <li>Safety protections (over-voltage, over-travel, surge)</li>
                <li>Automatic priming and refill</li>
                <li>Custom volume presets (1 mL – 100 mL)</li>
                <li>Compatible with multiple lab bottle sizes</li>

            </ul>
            
            <h3>Technical Specs</h3>
            <p>Main Controller: Timer555 IC</p>
            <p>Pump Mechanism: Stepper motor-driven peristaltic pump</p>
            <p>Power Supply: 12V DC regulated</p>
            <p>Sensors: Flow sensors, liquid level detection, pressure feedback</p>
            <p>Power Supply: 12V DC regulated</p>
            

            <h3>Applications</h3>
            <p>Chemistry and biology labs</p>
            <p>Pharmaceutical liquid handling</p>
            <p>Research requiring repeatable dosing</p>

        `,
        github: "https://github.com",
        demo: "https://example.com"
    },
    {
        id: 2,
        title: "Voltage Guard Pro",
        description: "Smart power protector for household appliances (ATtiny85, ZMPT101B, 7-segment).",
        image: "projects/voltage_guard_pro/pic.png",
        tags: ["Embedded System", "PCB Design", "KiCAD"],
        fullDescription: `
            <h3>Project Overview</h3>
            <p>Voltage Guard Pro is a smart, low-cost power protection device designed to safeguard household appliances from dangerous voltage fluctuations.
                Built around the ATtiny85 microcontroller, it continuously monitors the AC mains voltage and instantly disconnects connected devices when the voltage goes below 190V or exceeds 250V — protecting sensitive electronics from damage.

                The device uses a ZMPT101B voltage sensor for accurate measurements and a SANYOU SRD relay for fast switching. It features a dual 7-segment display showing real-time voltage readings and automatically restores power once voltage returns to a safe range.

                With its compact size and cost-effective design, Voltage Guard Pro is ideal for protecting TVs, refrigerators, air conditioners, and other sensitive electronics from Egypt’s frequent voltage instability..</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>Automatic power cut-off below 190V or above 250V</li>
                <li>Real-time voltage display on dual 7-segment modules</li>
                <li>Fast response time with ATtiny85 microcontroller</li>
                <li>Auto-restart when voltage returns to normal</li>
                <li>Relay protection + surge protection (MOV)</li>
                <li>Compact, affordable, and easy to install</li>
            </ul>
            
            <h3>Technical Specs</h3>
            <p>Input Voltage: 	220V AC</p>
            <p>BSafe Operating Range: 	190V – 250V</p>
            <p>MCU: 	ATtiny85-20PU</p>
            <p>Display: 	 7-Segment</p>
            <p>Relay: 	SANYOU SRD-05VDC-SL-C</p>
            <p>Sensor: 	ZMPT101B AC Voltage Sensor</p>
            <p>Protection: 	MOV + Fuse + Flyback Diode</p>

            
            <h3>Applications</h3>
            <p>Protecting refrigerators, AC compressors, and motors</p>
            <p>Safeguarding sensitive electronics (TVs, PCs, routers)</p>
            <p>Small households and office appliances</p>

        `,
        github: "https://github.com",
        demo: "https://example.com"
    },
    {
        id: 3,
        title: "SmartMed Guardian",
        description: "AI-based Smart Nursing System — continuous monitoring + automated medication delivery.",
        image: "projects/smartmed_guardian/pic.png",
        tags: ["Embedded System", "PCB Design", "KiCAD"],
        fullDescription: `
            <h3>Project Overview</h3>
            <p>SmartMed Guardian is an AI-enabled, IoT-capable nursing system that combines continuous patient monitoring with precision automated medication delivery. The system is composed of two cooperating units — a Sensor Unit for real-time physiological data acquisition, and a Control Unit for safe, 
            programmable multi-channel medication administration. Data is synced to the cloud for remote monitoring and control.</p>
            
            <h3>Key Features</h3>
            <ul>
                <li>Continuous multi-parameter health monitoring with configurable sampling rates</li>
                <li>Edge AI anomaly detection for early-warning alerts and trend analysis.</li>
                <li>Cloud dashboard for clinicians: real-time view, historical trends, and remote programming of medication schedules.</li>
                <li>Multi-layer safety: hardware and software checks, emergency stop, and delivery confirmation.</li>
                <li>Local UI (OLED) and audible/visual alerts for patient/caregiver.</li>
                
            </ul>
            
            <h3>Technical Specs</h3>
            <p>Primary MCUs: 	Dual ESP32-S3-WROOM-1 (240 MHz, dual core)</p>
            <p>Connectivity: 	Wi-Fi 802.11 b/g/n (cloud sync)</p>
            <p>Cloud Platform: 	Firebase Realtime Database (bidirectional sync)</p>
            <p>Power: 	12 V DC input, battery backup supported</p>
            <p>Monitoring Sensors: 	MAX30102, AD8232, MPX5050DP, DS18B20, BME280, MPU6050</p>
            <p>Medication Control: 	5 × peristaltic pumps, ACS712 current sensing, YF-S201 flow sensors</p>
            <p>Safety: 	Optical isolation, overcurrent protection, level sensing, watchdog & heartbeat</p>

            
            <h3>Clinical Applications</h3>
            <p>Chronic disease management (diabetes, hypertension, cardiac care)</p>
            <p>Post-operative monitoring & medication delivery</p>
            <p>Elderly care and assisted living</p>
            <p>Remote clinics and telehealth deployments</p>

        `,
        github: "https://github.com",
        demo: "https://example.com"
    },
    /*
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
        */
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
