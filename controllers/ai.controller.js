import { cosineSimilarity, createEmbeddings } from "../ai/createEmbeddings.js";
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { getGemsPromise } from "../repository/gem.repo.js";
import { getAllGems } from "./gem.controller.js";

const generateSuggestions = catchAsyncError(async (req, res, next) => {
    const userPrompt = req.body.prompt;
    const userVector = await createEmbeddings(userPrompt);
    const gems = await getGemsPromise();
    const similarties = gems.map(gem => ({
        gem,
        score: cosineSimilarity(userVector, gem.embeddings || 0)
    }))

    similarties.sort((a,b) => b.score - a.score);
    const [bestMatch] = similarties.slice(0, 1).map(s => {
            const {embeddings, ...gem} = s.gem.toObject();
            return gem;
        }); 
    return res.status(200).json({
        suggestions: bestMatch
    })
})

export {
    generateSuggestions
}