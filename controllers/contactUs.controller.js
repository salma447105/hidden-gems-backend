
import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { AppError } from "../utils/AppError.js";
import { ApiFeatures } from "../utils/ApiFeatures.js";
import { sendEmail } from "../emails/user.email.js";
import {
  getContactsQuery,
  getContact,
  createContact,
  updateContact,
  deleteContactMessage,
  getContactsByStatus,
  adminAddReply,
  getContactsByEmailForAdmin,
  getContactsByEmailForUser
} from "../repository/contactUs.repo.js";



// User: Submit complaint
const contactSubmission = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, message } = req.body;
    
  const contactData = {
    firstName,
    lastName,
    email,
    message,
    status: "pending",
  };

  let result = await createContact(contactData);

  // Send notification email to admin
//   try {
//     const subject = `New Complaint from ${firstName} ${lastName}`;
//     const html = `
//       <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//         <h2 style="color: #DD0303;">New Complaint Received</h2>
//         <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
//           <p><strong>Name:</strong> ${firstName} ${lastName}</p>
//           <p><strong>Email:</strong> ${email}</p>
//           <p><strong>Complaint:</strong></p>
//           <p style="background: white; padding: 15px; border-left: 4px solid #DD0303;">${message}</p>
//         </div>
//         <p style="color: #666; font-size: 12px; margin-top: 20px;">
//           Received on: ${new Date().toLocaleString()}<br>
//           Complaint ID: ${result._id}
//         </p>
//       </div>
//     `;

//     await sendEmail(
//       process.env.SUPPORT_EMAIL || "support@gemsy.com",
//       subject,
//       html
//     );
//   } catch (emailError) {
//     console.error("Admin notification email failed:", emailError);
//   }

  res.status(201).json({
    message:
      "Your complaint has been submitted successfully! We'll get back to you soon.",
    result,
  });
});

// User: Get their complaints
const getUserComplaints = catchAsyncError(async (req, res, next) => {
  const { email } = req.params;


  const apifeatures = new ApiFeatures(
    getContactsByEmailForUser(email), 
    req.query 
  )
    .sort()
    .paginate();

  const result = await apifeatures.mongooseQuery;
  const totalItems = await getContactsByEmailForUser(email).countDocuments();
  const totalPages = Math.ceil(totalItems / apifeatures.limit);

  return res.status(200).json({
    message: "success",
    page: apifeatures.page,
    totalItems,
    totalPages,
    result,
  });
});

// Admin: Get all complaints
const getAllContacts = catchAsyncError(async (req, res, next) => {
  const countQuery = new ApiFeatures(getContactsQuery(), req.query)
    .filter()
    .search();

  const totalItems = await countQuery.mongooseQuery.countDocuments();

  const apifeatures = new ApiFeatures(getContactsQuery(), req.query)
    .filter()
    .search()
    .sort()
    .fields()
    .paginate();

  const result = await apifeatures.mongooseQuery.populate(
    "adminReplies.repliedBy",
    "firstName"
  );

  const totalPages = Math.ceil(totalItems / apifeatures.limit);

  return res.status(200).json({
    message: "success",
    page: apifeatures.page,
    totalItems,
    totalPages,
    result,
  });
});

// Admin: Get complaint by ID
const getContactById = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let result = await getContact(id);
  if (!result) return next(new AppError(`Complaint not found`, 404));

  res.status(200).json({ message: "success", result });
});

// Admin: Get complaints by status
const getContactsByStatusHandler = catchAsyncError(async (req, res, next) => {
  const { status } = req.params;

  const countQuery = new ApiFeatures(getContactsByStatus(status), req.query)
    .filter()
    .search();

  const totalItems = await countQuery.mongooseQuery.countDocuments();

  const apifeatures = new ApiFeatures(getContactsByStatus(status), req.query)
    .filter()
    .search()
    .sort()
    .fields()
    .paginate();

  const result = await apifeatures.mongooseQuery.populate(
    "adminReplies.repliedBy",
    "firstName"
  );

  const totalPages = Math.ceil(totalItems / apifeatures.limit);

  return res.status(200).json({
    message: "success",
    page: apifeatures.page,
    totalItems,
    totalPages,
    result,
  });
});

// Admin: Get complaints by specific email (with all data)
const getUserContactsByEmailForAdmin = catchAsyncError(async (req, res, next) => {
  const { email } = req.params;

  const apifeatures = new ApiFeatures(
    getContactsByEmailForAdmin(email),
    req.query
  )
    .sort()
    .paginate();

  const result = await apifeatures.mongooseQuery;
  const totalItems = await getContactsByEmailForAdmin(email).countDocuments();
  const totalPages = Math.ceil(totalItems / apifeatures.limit);

  return res.status(200).json({
    message: "success",
    page: apifeatures.page,
    totalItems,
    totalPages,
    result,
  });
});

// Admin: Add reply to complaint
const addReplyToContact = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { message, sentEmail } = req.body;
  const adminId = req.user._id;

  let contact = await getContact(id);
  if (!contact) return next(new AppError(`Complaint not found`, 404));

  const replyData = {
    message,
    repliedBy: adminId,
    sentEmail: sentEmail,
  };

  let result = await adminAddReply(id, replyData);

  // Send email to user if requested
  if (sentEmail) {
    try {
      console.log(`Attempting to send email to: ${contact.email}`);

        const emailSubject =
            "Update on your complaint - Gemsy";
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #DD0303;">Update on Your Complaint</h2>
          <p>Hello ${contact.firstName},</p>
          <p>We have an update regarding to your complaint:</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Our Response:</strong></p>
            <p style="background: white; padding: 15px; border-left: 4px solid #DD0303;">${message}</p>
          </div>
          <p><strong>Complaint Status:</strong> ${result.status}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            You can view all updates on your complaint page.<br>
            Best regards,<br>
            <strong>The Gemsy Support Team</strong>
          </p>
        </div>
      `;

      await sendEmail(contact.email , emailSubject , emailHtml);
      console.log("Email sent successfully to user");
      // Update the reply to mark email as sent
      result = await updateContact(
        id,
        {
          "adminReplies.$[elem].sentEmail": true,
        },
        {
          arrayFilters: [
            {
              "elem._id":
                result.adminReplies[result.adminReplies.length - 1]._id,
            },
          ],
        }
      );
    } catch (emailError) {
      console.error("User notification email failed:", emailError);
    }
  }

  res.status(200).json({
    message: sendEmail
      ? "Reply added successfully and email sent"
      : "Reply added successfully",
    result,
  });
});

// Admin: Update complaint status/notes
const updateContactStatus = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  let contact = await getContact(id);
  if (!contact) return next(new AppError(`Complaint not found`, 404));

  const updateData = {};
  if (status) updateData.status = status;
  if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

  let result = await updateContact(id, updateData);

  res.status(200).json({
    message: `Complaint ${status ? "status" : "notes"} updated successfully`,
    result,
  });
});

// Admin: Delete complaint
const deleteContactSubmission = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  let contact = await getContact(id);
  if (!contact) return next(new AppError(`Complaint not found`, 404));

  await deleteContactMessage(id);
  res.status(200).json({ message: "Complaint deleted successfully",contact });
});

export {
  getAllContacts,
  getContactById,
  getContactsByStatusHandler,
  contactSubmission,
  updateContactStatus,
  deleteContactSubmission,
  addReplyToContact,
  getUserComplaints,
  getUserContactsByEmailForAdmin,
};
