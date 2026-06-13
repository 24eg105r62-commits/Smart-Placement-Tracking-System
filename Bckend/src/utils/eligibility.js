// Compares a student's profile against a job's requirements and explains the verdict.
export const checkEligibility = (student, job) => {
  const reasons = [];

  const cgpaOk = typeof student.cgpa === 'number' && student.cgpa >= job.eligibilityCgpa;
  if (!cgpaOk) {
    reasons.push(`Requires CGPA >= ${job.eligibilityCgpa}, you have ${student.cgpa ?? 'N/A'}`);
  }

  let branchOk = true;
  if (Array.isArray(job.eligibleBranches) && job.eligibleBranches.length > 0) {
    branchOk = job.eligibleBranches.includes(student.branch);
    if (!branchOk) {
      reasons.push(`Open to: ${job.eligibleBranches.join(', ')}`);
    }
  }

  let skillsOk = true;
  let missingSkills = [];
  if (Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0) {
    const studentSkills = (student.skills || []).map((s) => s.toLowerCase().trim());
    missingSkills = job.requiredSkills.filter(
      (skill) => !studentSkills.includes(skill.toLowerCase().trim())
    );
    skillsOk = missingSkills.length === 0;
    if (!skillsOk) {
      reasons.push(`Missing skills: ${missingSkills.join(', ')}`);
    }
  }

  const eligible = cgpaOk && branchOk && skillsOk;

  return {
    eligible,
    status: eligible ? 'Eligible' : 'Not Eligible',
    checks: {
      cgpa: { required: job.eligibilityCgpa, actual: student.cgpa ?? null, passed: cgpaOk },
      branch: { required: job.eligibleBranches || [], actual: student.branch ?? null, passed: branchOk },
      skills: { required: job.requiredSkills || [], missing: missingSkills, passed: skillsOk },
    },
    reasons,
  };
};
