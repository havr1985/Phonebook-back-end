const Jimp = require('jimp');
const fs = require('fs/promises');

const sizeChange = async (req, res, next) => {
    const { path: tmpDir, originalname } = req.file;
    console.log(req.file)

    Jimp.read(tmpDir)
        .then(image => {
        return image.resize(250, 250).write(tmpDir)
        })
        .then(() => {
            next()
        })
        .catch(error => {
            fs.unlink(tmpDir, originalname);
        next(error)
    })
}

module.exports = sizeChange;