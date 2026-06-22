// resumeService.js
const ai = require("./gemini");

async function buildResume(formData) {
  const prompt = `
You are an expert ATS resume writer.

Your task is to optimize the candidate's resume for the provided job description.

Rules:
- Return ONLY valid JSON.
- Do not include markdown or code fences.
- Do not invent facts, companies, dates, or achievements.
- Improve wording, grammar, and ATS keyword alignment using only the provided information.
- Preserve factual accuracy.

Output format:

{
  "header": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": ""
  },
  "professionalSummary": "",
  "skills": {
    "technical": [],
    "tools": [],
    "softSkills": []
  },
  "workExperience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "location": "",
      "bulletPoints": []
    }
  ],
  "projects": [
    {
      "name": "",
      "technologies": [],
      "description": [],
      "impact": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": "",
      "grade": ""
    }
  ],
  "certifications": [],
  "achievements": "",
  "atsOptimization": {
    "matchedKeywords": [],
    "missingKeywords": [],
    "recommendations": []
  }
}


Job Description:
${formData.jobDescription}

Candidate Details:
${JSON.stringify(formData, null, 2)}


`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });


  const clean = JSON.parse(response.text.replace(/^"|"$/g, ""));

  return clean;
}

module.exports = { buildResume };