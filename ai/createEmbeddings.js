import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../utils/AppError.js';
import { config } from 'dotenv';
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