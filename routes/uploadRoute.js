const express = require("express");
const uploadController = require("../controllers/uploadController");
const router = express.Router();

router.use((req, res, next) => {
    res.error = (errMessage) => {
        return res.status(400).json({ 'success': false, 'message': errMessage })
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

router.post('/', uploadController.uploadsFile)

module.exports = router