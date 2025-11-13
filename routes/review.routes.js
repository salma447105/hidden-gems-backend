import express from 'express';
import { ReviewValidation } from '../validations/reviewValidations';
import handleValidation from '../middleware/handleValidation';
import { create, deleteReview, getAllReviewsByGemId } from '../services/review.service';
import { catchAsyncError } from '../middleware/catchAsyncError';
const router = express.Router();


router.get('/:id', ReviewValidation.getReviewValidation(), handleValidation, async (req, res) => {
    const id = req.params;
    const reviews = await getAllReviewsByGemId(id);
    if(!reviews) {
        return res.status(404).send({message: "Reviews for a place can not be found"});
    }
    return res.status(200).send(reviews);
})

router.post("/", ReviewValidation.createValidationRules(), handleValidation, catchAsyncError(async (req, res) => {
    const review = req.body;
    const createdReview = await create(review);
    if(!createdReview) {
        return res.status(400).send({message: "Review for a user can not be posted"});
    }
    return res.status(200).send(createdReview);
}))

router.delete("/:id", ReviewValidation.getReviewValidation(), handleValidation, async(req, res) => {
    const id = req.params;
    const deletedReview = await deleteReview(id);
    if(!deleteReview) {
        return res.status(400).send({message: "Review for a user can not be deleted"});
    }
    return res.status(200).send(deleteReview);
})

// router.put("/:id", ReviewValidation.createValidationRules(), ReviewValidation.getReviewValidation(), handleValidation, async(req, res) => {
//     const review = req.body;
//     const id  = req.params;
// })