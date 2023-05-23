const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const sharpConvert = require("../middleware/sharp")

const bookCtrl = require("../controllers/book");

router.get("/bestrating", bookCtrl.getTopBook);
router.get("/", bookCtrl.getAllBooks);
router.get("/:id", bookCtrl.getOneBook);
router.post("/", auth, multer, sharpConvert, bookCtrl.createBook);
router.post("/:id/rating", auth, bookCtrl.rateBook);
router.put("/:id", auth, multer, sharpConvert, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;
