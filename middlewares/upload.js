const multer = require('multer')
const util = require('util')

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const isFileTypeMatch = (fileName) => {
    return fileName.match(/.(jpg|jpeg|png|gif|zip)$/i)
}


const uploadsFile = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (isFileTypeMatch(file.originalname)) {
            cb(null, true)
        } else {
            cb(null, false);
            return cb(new Error('Allowed only image type or zip type of images'))
        }
    }
}).single("file");

const uploadFilesMiddleware = util.promisify(uploadsFile);

module.exports = { uploadFilesMiddleware, isFileTypeMatch };