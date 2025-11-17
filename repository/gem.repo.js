import mongoose from "mongoose";
import { gemModel } from "../models/gem.js";

 const getGemsPromise = async () => {
    return await gemModel.find({});
};
 const getGemsQuery = () => {
   return gemModel.find();
};
//why ? because getGemsPromise return a promise that doesn't have the query methods like skip at (ApiFeatures)
//  but getGemsQuery return a query that has the query methods like skip

// BUT why do we need to implement getGemsQuery ?
// because at gem.controller.js at getAllGems we use methods from apiFeatures like paginate, filter,...
// and the implementation of them need to deal with queries not promises 
//                               [that comes from here to gemController]



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

export {
  getGemsPromise,
  getGemsQuery,
  getGem,
  createTheGem,
  updateTheGem,
  deleteTheGem,
  findGemByName,
};