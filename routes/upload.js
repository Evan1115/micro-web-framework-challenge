const express = require('express');
const router = express.Router();
const multer = require('multer')

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
        if (file.originalname.match(/.(jpg|jpeg|png|gif)$/i)) {
            cb(null, true)
        } else {
            cb(null, false);
            return cb(new Error('Allowed only image type'))
        }
    }
})

const uploadsFile = upload.single('file')

router.post('/', (req, res) => {
    uploadsFile(req, res, err => {
        // error if not a image 
        if (err) {
            return res.status(400).json({
                "success": false,
                "message": err.message
            })
        }
        //error if file is empty
        if (!req.file) {
            return res.status(400).json({
                "success": false,
                "message": "No file is inserted"
            });
        }

        const fileOriginalName = req.file.originalname
        const baseURL = req.protocol+"://"+req.headers.host
        const _link = baseURL + "/uploads/" + fileOriginalName

        res.status(200).json({
            "success": true,
            "message": "Uploaded successfully",
            "image": { '_link': _link }
        })
    })
})
module.exports = router