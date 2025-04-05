const express = require("express");
const router = express.Router();
const {retrieveFeedback , saveFeedback} = require("../controllers/feedback");
const authMiddleware = require("../middlewares/auth");

router.post("/save", authMiddleware.authUser, saveFeedback);
router.post("/get",  authMiddleware.authUser,retrieveFeedback);

module.exports = router;
