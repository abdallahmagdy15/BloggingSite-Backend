
const multer = require("multer");
const imageFilter = require('../helpers/helpers')
// Multer config
module.exports = multer({
  storage: multer.diskStorage({}),
  fileFilter: imageFilter
});