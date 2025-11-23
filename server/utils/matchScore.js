exports.calculateMatchScore = (studentSkills, jobSkills) => {
    if (!studentSkills || !jobSkills || studentSkills.length === 0 || jobSkills.length === 0) {
        return 60; // Base score if skills are missing
    }

    const jobSkillsSet = new Set(jobSkills.toLowerCase().split(',').map(s => s.trim()));
    let matchedSkills = 0;

    studentSkills.forEach(skill => {
        if (jobSkillsSet.has(skill.toLowerCase().trim())) {
            matchedSkills++;
        }
    });

    const matchPercentage = (matchedSkills / jobSkillsSet.size) * 100;
    
    // Scale the score to be between 60 and 98 for realism
    const scaledScore = 60 + (matchPercentage / 100) * 38;
    return Math.min(Math.round(scaledScore), 98);
};