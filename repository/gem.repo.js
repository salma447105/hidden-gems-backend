import mongoose from "mongoose";
import { gemModel } from "../models/gem.js";

 const getGems = async () => {
    return await gemModel.find();
};

 const getGem = async (id) => {
    return await gemModel.findById(id);
}

const createTheGem = async (gem) => { 
    return await gemModel.create(gem);
}

 const updateTheGem = async (id, updatedFields) => {
    return await gemModel.findByIdAndUpdate(id,  updatedFields , {new: true});
}

 const deleteTheGem = async (id) => {
    return await gemModel.findByIdAndDelete(id);
}

const findGemByName = async (name) => {
    return await gemModel.findOne({ name:name });
}

export { getGems , getGem, createTheGem, updateTheGem, deleteTheGem , findGemByName};