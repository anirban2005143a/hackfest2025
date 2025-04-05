const express = require("express");
const router = express.Router();
const savingresponse = require("../controllers/chatsave");
const authMiddleware = require("../middlewares/auth");
// chat history
// router.post(
//   "/savechathistory",
//   authMiddleware.authUser,
//   savingresponse.savingresponse
// );
router.post("/savechathistory", authMiddleware.authUser, savingresponse.savingresponse);
router.post("/getchathistory",  authMiddleware.authUser,savingresponse.getchathistory);
router.post("/updatechatquestion", authMiddleware.authUser, savingresponse.updatechathistory);
router.post("/deletechathistory", authMiddleware.authUser, savingresponse.deletechathistory);
router.post("/setarchievehistory",  authMiddleware.authUser,savingresponse.setarchievechat);
router.post("/chatinfo",  authMiddleware.authUser,savingresponse.chatinfo);

module.exports = router;
