const admZip = require('adm-zip');
const express = require('express');
const router = express.Router();
const multer = require('multer')
const path = require('path');
const fs = require('fs');
const { resolve } = require('path');
const gm = require('gm').subClass({ imageMagick: true });

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (isFileTypeMatch(file.originalname)) {
            cb(null, true)
        } else {
            cb(null, false);
            return cb(new Error('Allowed only image type or zip type of images'))
        }
    }
})

const isFileTypeMatch = (fileName) => {
    return fileName.match(/.(jpg|jpeg|png|gif|zip)$/i)
}

const uploadsFile = upload.single('file')

router.use((req, res, next) => {
    res.invalidInput = (e) => {
        return res.status(400).json({ 'success': false, 'message': e.message })
    }

    res.success = (images) => {
        return res.status(200).json({
            "success": true,
            "message": "Uploaded successfully",
            "images": images
        })
    }

    next();
})

router.post('/', (req, res) => {
    uploadsFile(req, res, async err => {
        // error if not a image 
        if (err) {
            return res.invalidInput(err);
        }
        //error if file is empty
        if (!req.file) {
            return res.invalidInput(new Error("No file is inserted"));
        }

        const fileOriginalName = req.file.originalname;
        const baseURL = req.protocol + "://" + req.headers.host;
        const fileExtension = path.extname(req.file.originalname);
        const filePath = path.resolve('uploads', fileOriginalName);
        let imagesArray = [];

        //if is a zip
        if (fileExtension === '.zip') {

            try {
                const unzip = new admZip(filePath);

                //delete the original zip file
                fs.unlinkSync(filePath)

                //get all the image name in the zip file
                const images = unzip.getEntries().map(image => {
                    const imageName = image.entryName

                    //check if is a image
                    if (!isFileTypeMatch(imageName)) throw new Error("Zip contains non image type")
                    return image.entryName;
                })

                imagesArray = [...images];
                //unzip to uploads folder
                unzip.extractAllTo('uploads', true);
            } catch (err) {
                return res.invalidInput(err)
            }

        } else { //if only one image
            imagesArray.push(fileOriginalName)
        }

        const imagesObject = imagesArray.map( image => {
            const _link = baseURL + "/uploads/" + image;
            return ({ '_link': _link })
        })

        res.success(imagesObject);
    })
    
})

module.exports = router