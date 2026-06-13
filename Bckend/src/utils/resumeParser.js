import { createRequire } from 'module';

// pdf-parse is CommonJS — use createRequire for ESM compatibility
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

import { BRANCHES } from '../constants/branches.js';

// ── Skills dictionary ────────────────────────────────────────────────────────
const SKILLS_DICT = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust',
  'Swift', 'Kotlin', 'PHP', 'Ruby', 'Scala', 'R', 'MATLAB', 'Dart', 'Perl',
  // Web frontend
  'React', 'Angular', 'Vue', 'Next.js', 'Nuxt.js', 'Svelte', 'HTML', 'CSS',
  'Tailwind CSS', 'Bootstrap', 'jQuery', 'Redux', 'Webpack', 'Vite',
  // Web backend
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Spring',
  'Laravel', 'Rails', 'ASP.NET', 'Nest.js',
  // Databases
  'MySQL', 'PostgreSQL', 'MongoDB', 'SQLite', 'Oracle', 'Redis', 'Cassandra',
  'DynamoDB', 'Firebase', 'Supabase', 'SQL',
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions',
  'Terraform', 'Ansible', 'Linux', 'Bash', 'CI/CD',
  // ML / Data
  'Machine Learning', 'Deep Learning', 'Data Science', 'NLP', 'Computer Vision',
  'TensorFlow', 'PyTorch', 'Keras', 'Pandas', 'NumPy', 'scikit-learn', 'OpenCV',
  'Matplotlib', 'Tableau', 'Power BI',
  // Mobile
  'React Native', 'Flutter', 'Android', 'iOS',
  // Tools & practices
  'Git', 'GitHub', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum',
  'Figma', 'Postman', 'VS Code', 'Jira',
  // Networking / Security
  'TCP/IP', 'Networking', 'Cybersecurity', 'Ethical Hacking',
];

// Branch keyword map — keys must exactly match BRANCHES constant
const BRANCH_KEYWORDS = {
  'Computer Science':           ['computer science', 'cse', 'b.tech cse', 'b.e. cse'],
  'Information Technology':     ['information technology', ' it ', 'b.tech it', 'b.e. it'],
  'Electronics & Communication':['electronics & communication', 'electronics and communication', 'ece', 'e&c', 'ec'],
  'Electrical Engineering':     ['electrical engineering', 'electrical & electronics', 'eee', ' ee '],
  'Mechanical Engineering':     ['mechanical engineering', 'mech', ' me '],
  'Civil Engineering':          ['civil engineering', 'civil engg'],
  'Chemical Engineering':       ['chemical engineering', 'chemical engg'],
  'Biotechnology':              ['biotechnology', 'biotech'],
};

// ── Extractors ───────────────────────────────────────────────────────────────

const extractCGPA = (text) => {
  const patterns = [
    /cgpa[\s:–-]*([0-9]+\.?[0-9]*)\s*(?:\/\s*10)?/i,
    /gpa[\s:–-]*([0-9]+\.?[0-9]*)/i,
    /([0-9]+\.[0-9]+)\s*\/\s*10/,
    /cumulative\s+grade[\s\w]*?([0-9]+\.[0-9]+)/i,
    /aggregate[\s:–-]*([0-9]+\.?[0-9]*)\s*%?/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const val = parseFloat(m[1]);
      if (val > 10) return null;          // percentage, not CGPA
      if (val > 0 && val <= 4.1) return parseFloat((val * 2.5).toFixed(2)); // 4.0 scale → 10
      if (val > 0) return val;
    }
  }
  return null;
};

const extractPhone = (text) => {
  // Indian mobile: optional +91 / 0 prefix, then 10 digits starting 6-9
  const m = text.match(/(?:\+91[\s\-]?|0)?([6-9]\d{9})/);
  return m ? m[0].replace(/\s/g, '') : null;
};

const extractBranch = (text) => {
  const lower = text.toLowerCase();
  for (const [branch, keywords] of Object.entries(BRANCH_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return branch;
  }
  return null;
};

const extractGraduationYear = (text) => {
  // Prefer year near graduation-related words
  const contextPattern =
    /(?:graduation|graduating|batch|passout|passing year|expected|year of passing|class of)[\s:,–-]*(?:year)?[\s:,–-]*\b(20[2-3][0-9])\b/i;
  const degreePattern = /(?:b\.?tech|b\.?e|m\.?tech|mca|mba|b\.?sc)[\s\w(),–-]*?\b(20[2-3][0-9])\b/i;
  const rangePattern = /20[1-2][0-9]\s*[-–]\s*(20[2-3][0-9])/;  // e.g. 2021-2025

  for (const p of [contextPattern, degreePattern, rangePattern]) {
    const m = text.match(p);
    if (m) return parseInt(m[1], 10);
  }
  return null;
};

const extractSkills = (text) => {
  const found = [];
  const lower = text.toLowerCase();
  for (const skill of SKILLS_DICT) {
    // Match whole-word / boundary to avoid false positives (e.g. "C" inside "React")
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, 'i');
    if (regex.test(lower)) found.push(skill);
  }
  return found;
};

// ── Main export ──────────────────────────────────────────────────────────────

export const parseResume = async (buffer) => {
  try {
    const { text } = await pdfParse(buffer);
    return {
      cgpa:           extractCGPA(text),
      phone:          extractPhone(text),
      branch:         extractBranch(text),
      graduationYear: extractGraduationYear(text),
      skills:         extractSkills(text),
    };
  } catch (err) {
    console.error('[resumeParser] PDF parse error:', err.message);
    return { cgpa: null, phone: null, branch: null, graduationYear: null, skills: [] };
  }
};
