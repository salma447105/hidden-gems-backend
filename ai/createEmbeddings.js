import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../utils/AppError.js';
import { config } from 'dotenv';
import { getGemsPromise } from '../repository/gem.repo.js';
config();
export const createEmbeddings = async (gemDescription) => {
    if(!process.env.GEMINI_KEY) {
        throw new AppError("GEMINI key not found", 500);
    }
    const googleGenAi = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = googleGenAi.getGenerativeModel({model: 'gemini-embedding-001'});

    const res = await model.embedContent(gemDescription)
    return res.embedding.values;
}

export const cosineSimilarity = (vecA, vecB) => {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a*a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b*b, 0));
  return dot / (magA * magB);
};

// export const generateAiPrompt = async (gem) => {
//   // console.log(JSON.stringify(gem));
//   const prompt = `Describe a hidden gem travel destination with the following details:
//   Name: ${gem.name}
//   Location: ${gem.gemLocation}
//   Description: ${gem.description}`;

//   console.log(prompt)
//   const googleGenAi = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  

//   const model = googleGenAi.getGenerativeModel({ model: 'gemini-2.5-flash' });

//   const chat = model.startChat({
//     config: {
//           // 🚀 Explicitly require a short summary
//          systemInstruction: "You are a professional travel writer. Your description MUST strictly use the Name and Location provided. Generate only a single, highly concise, 3-sentence summary (around 300 characters total) that highlights the gem's unique appeal. DO NOT include any headings like 'Name:', 'Location:', or 'Description:'.",
//           temperature: 0.2, // Low temperature for high adherence
//           maxOutputTokens: 50, // Strict, low token limit for conciseness
//       }
//   });

//   const apiResponse = await chat.sendMessage(prompt); 

//   return apiResponse.response.candidates[0].content.parts[0].text;
// }

