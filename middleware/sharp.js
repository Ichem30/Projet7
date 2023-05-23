const sharp = require('sharp');
const fs = require('fs');

const sharpConvert = async (req, res, next) => {
  if (!req.file) return next();

  const inputFile = req.file.path;
  const outputFile = inputFile.replace(/.(jpg|jpeg|png)$/, '.webp');

  try {
    await sharp(inputFile).toFormat('webp').toFile(outputFile);
    fs.unlinkSync(inputFile);

    req.file.path = outputFile;
    req.file.mimetype = 'image/webp';
    req.file.filename = req.file.filename.replace(/.(jpg|jpeg|png)$/, '.webp');
  } catch (err) {
    console.error("Error while converting image:", err);
  }
  next();
};

module.exports = sharpConvert;