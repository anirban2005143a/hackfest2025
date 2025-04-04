const express = require("express");
const router = express.Router();
const savingresponse = require("../controllers/chatsave");

// chat history
// router.post(
//   "/savechathistory",
//   authMiddleware.authUser,
//   savingresponse.savingresponse
// );
router.post("/savechathistory", savingresponse.savingresponse);
router.get("/getchathistory", savingresponse.getchathistory);
router.post("/updatechatquestion", savingresponse.updatechathistory);
router.post("/deletechathistory", savingresponse.deletechathistory);
router.post("/setarchievehistory", savingresponse.setarchievechat);

module.exports = router;
