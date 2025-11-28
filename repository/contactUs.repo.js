import { contactModel } from "../models/contactUs.js";

const getContactsQuery = () => {
  return contactModel.find().sort({ createdAt: -1 });
};

const getContact = async (id) => {
  return await contactModel
    .findById(id)
    .populate("adminReplies.repliedBy", "firstName ");
};

const getContactsByStatus = (status) => {
  return contactModel.find({ status }).sort({ createdAt: -1 });
};

const getContactsByEmailForAdmin = (email) => {
  return contactModel
  .find({ email: email })
  .sort({ createdAt: -1 });
};
const getContactsByEmailForUser = (email) => {
  return contactModel
    .find({ email: email })
    .select("-adminNotes -adminReplies.repliedBy") 
    .sort({ createdAt: -1 });
};  
const createContact = async (contactData) => {
  return await contactModel.create(contactData);
};
const deleteContactMessage = async (id) => {
  return await contactModel.findByIdAndDelete(id);
};
const adminAddReply = async (contactId, replyData) => {
  return await contactModel
    .findByIdAndUpdate(
      contactId,
      {
        $push: { adminReplies: replyData },
        $set: { status: "reviewed" }, 
      },
      { new: true }
    )
    .populate("adminReplies.repliedBy", "firstName ");
};

const updateContact = async (id, updatedFields) => {
  return await contactModel
  .findByIdAndUpdate(id, updatedFields, { new: true })
  .populate("adminReplies.repliedBy", "firstName");
};  




export {
  getContactsQuery,
  getContact,
  createContact,
  updateContact,
  deleteContactMessage,
  getContactsByStatus,
  getContactsByEmailForAdmin,
  adminAddReply,
  getContactsByEmailForUser,
};
