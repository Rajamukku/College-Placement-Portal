// This file acts as a mock database for demonstration purposes.
// In a real application, this data would come from a backend API and a real database (like MongoDB or PostgreSQL).

// =================================================================================
// 1. STUDENT DATABASE
// =================================================================================
export const allStudentsDb = {
    '21CSU101': {
        id: '21CSU101',
        name: 'Priya Sharma',
        email: 'priya.s@pu-student.com',
        phone: '9876543210',
        branch: 'CSE',
        resumeLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        academics: { tenth: '92.5', twelfth: '88.7', cpi: '8.5' },
        skills: ['React', 'Node.js', 'JavaScript', 'Tailwind CSS', 'MongoDB'],
        graduationYear: 2024,
        activeBacklogs: 0,
        projects: [
            {
                title: 'College Placement Portal',
                description: 'Developed a full-stack MERN application featuring separate portals for students, companies, and admins with JWT authentication.',
                link: 'https://github.com/priya-sharma/placement-portal'
            },
            {
                title: 'E-commerce Website',
                description: 'Built a responsive e-commerce front-end using React, Redux for state management, and integrated a dummy payment gateway.',
                link: 'https://github.com/priya-sharma/e-commerce'
            }
        ],
        internships: [
            {
                company: 'Tech Solutions Inc.',
                role: 'Web Development Intern',
                duration: 'May 2023 - July 2023',
                description: 'Worked on the front-end of a client project, fixing bugs and implementing new features using React and TypeScript.'
            }
        ],
        achievements: [
            'Winner, Smart India Hackathon 2023 (Software Edition)',
            '5-star Coder on HackerRank (Problem Solving)',
        ],
    },
    '21ITU045': {
        id: '21ITU045',
        name: 'Rohan Verma',
        email: 'rohan.v@pu-student.com',
        phone: '9123456789',
        branch: 'IT',
        resumeLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        academics: { tenth: '85.0', twelfth: '82.1', cpi: '7.9' },
        skills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Docker'],
        graduationYear: 2024,
        activeBacklogs: 1,
        projects: [
            {
                title: 'Library Management System',
                description: 'Created a backend system using Django and PostgreSQL to manage book issuance, returns, and user management with a RESTful API.',
                link: 'https://github.com/rohan-verma/library-system'
            }
        ],
        internships: [],
        achievements: [
            'Certified AWS Cloud Practitioner',
        ],
    },
    '21CSU088': {
        id: '21CSU088',
        name: 'Sneha Patel',
        email: 'sneha.p@pu-student.com',
        phone: '9988776655',
        branch: 'CSE',
        resumeLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        academics: { tenth: '95.0', twelfth: '91.3', cpi: '9.1' },
        skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'MySQL'],
        graduationYear: 2024,
        activeBacklogs: 0,
        projects: [
            {
                title: 'Cloud-Native Banking API',
                description: 'Designed and built a set of microservices for a banking application using Spring Boot, deployed on AWS Elastic Beanstalk.',
                link: 'https://github.com/sneha-patel/banking-api'
            }
        ],
        internships: [
             {
                company: 'Fintech Corp',
                role: 'Backend Engineering Intern',
                duration: 'May 2023 - July 2023',
                description: 'Contributed to the core transaction processing service, improving API latency by 15%.'
            }
        ],
        achievements: [
            'Oracle Certified Professional, Java SE 11 Developer',
        ],
    }
};


// =================================================================================
// 2. JOB DATABASE
// =================================================================================
let allJobsDb = {
    'JOB001': {
        id: 'JOB001',
        title: 'Frontend Developer',
        company: 'Tech Innovators Inc.',
        description: 'Join our team to build next-generation user interfaces for our flagship products using React and modern web technologies.',
        package: '14 LPA',
        eligibility: 'CPI > 7.0, No active backlogs',
        skills: 'React, JavaScript, CSS, HTML5, TypeScript',
        deadline: '2024-08-15',
        status: 'Live',
        applicants: 125,
    },
    'JOB002': {
        id: 'JOB002',
        title: 'Backend Engineer',
        company: 'Tech Innovators Inc.',
        description: 'Work on scalable backend services for our cloud platform. Responsible for designing and implementing RESTful APIs.',
        package: '16 LPA',
        eligibility: 'CPI > 7.5, CS/IT Branches',
        skills: 'Node.js, Express, MongoDB, REST API, Docker',
        deadline: '2024-08-20',
        status: 'Live',
        applicants: 98,
    },
    'JOB003': {
        id: 'JOB003',
        title: 'Data Analyst Intern',
        company: 'Tech Innovators Inc.',
        description: 'An exciting internship opportunity to work with our data science team on real-world datasets and generate business insights.',
        package: '50,000/month stipend',
        eligibility: 'All branches eligible, CPI > 8.0',
        skills: 'SQL, Python, Pandas, Excel, Tableau',
        deadline: '2024-07-30',
        status: 'Closed',
        applicants: 210,
    },
};

// This represents the jobs posted by the specific company that is "logged in".
// In a real app, the backend would filter this based on the authenticated company.
const companyJobs = ['JOB001', 'JOB002', 'JOB003'];


// =================================================================================
// 3. MAPPING OF APPLICANTS TO JOBS
// =================================================================================
const applicantsPerJob = {
    'JOB001': ['21CSU101', '21ITU045'],
    'JOB002': ['21CSU088', '21ITU045'],
    'JOB003': ['21CSU101', '21CSU088'],
};


// =================================================================================
// 4. MOCK API FUNCTIONS (Simulating Backend Calls)
// =================================================================================

/**
 * Fetches all jobs posted by the "logged in" company.
 */
export const getCompanyJobs = () => {
    return companyJobs.map(jobId => allJobsDb[jobId]).sort((a, b) => (a.status === 'Live' ? -1 : 1));
};

/**
 * Fetches all student IDs who have applied for a specific job.
 * @param {string} jobId The ID of the job.
 * @returns {Array<string>} An array of student IDs.
 */
export const getApplicantsForJob = (jobId) => {
    return applicantsPerJob[jobId] || [];
};

/**
 * Fetches the details for a single job by its ID.
 * @param {string} jobId The ID of the job to fetch.
 * @returns {object | null} The job object or null if not found.
 */
export const getJobById = (jobId) => {
    return allJobsDb[jobId] || null;
};

/**
 * Updates a job in the mock database.
 * @param {string} jobId The ID of the job to update.
 * @param {object} updatedDetails The new details for the job.
 */
export const updateJob = (jobId, updatedDetails) => {
    if (allJobsDb[jobId]) {
        allJobsDb[jobId] = { ...allJobsDb[jobId], ...updatedDetails };
        console.log(`Updated job ${jobId}`, allJobsDb[jobId]);
    }
};

/**
 * Adds a new job to the mock database.
 * @param {object} newJobData The data for the new job posting.
 */
export const addNewJob = (newJobData) => {
    const newId = `JOB${Object.keys(allJobsDb).length + 101}`; // Simple unique ID generation
    const newJob = {
        ...newJobData,
        id: newId,
        company: 'Tech Innovators Inc.', // Hardcoded for the logged-in company
        status: 'Live',
        applicants: 0,
    };
    allJobsDb[newId] = newJob;
    companyJobs.push(newId);
    console.log(`Added new job ${newId}`, newJob);
};

/**
 * Changes the status of a job to "Closed".
 * @param {string} jobId The ID of the job to close.
 */
export const closeJob = (jobId) => {
    if (allJobsDb[jobId]) {
        allJobsDb[jobId].status = 'Closed';
        console.log(`Closed job ${jobId}`);
    }
};