const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth");
const savingresponse = require("../controllers/chatsave");
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.registerUser
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.loginUser
);

router.get("/profile", authMiddleware.authUser, userController.getUserProfile);

router.get("/logout", authMiddleware.authUser, userController.logoutUser);
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
