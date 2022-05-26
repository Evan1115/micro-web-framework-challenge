const admZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const gm = require('gm').subClass({ imageMagick: true });
const { uploadFilesMiddleware, isFileTypeMatch } = require('../middlewares/upload');

const uploadsFile = async (req, res) => {
    try {
        await uploadFilesMiddleware(req, res);
        if (!req.file) {
            return res.error("No file is selected");
        }

        const baseURL = req.protocol + "://" + req.headers.host;
        const fileOriginalName = req.file.originalname;
        const fileExtension = path.extname(req.file.originalname);
        const filePath = path.resolve('uploads', fileOriginalName);
        const imagesObject = [];
        let imagesArray = [];


        //if is a zip
        if (fileExtension === '.zip') {
            const unzipedImages = unzipImage(filePath)
            imagesArray = [...unzipedImages];

        } else { //if only one image
            imagesArray.push(fileOriginalName)
        }

        for (const image of imagesArray) {

            //create image object
            const imageObject = await createImageObject(baseURL, image);
            imagesObject.push(imageObject)
        }

        return res.success(imagesObject);

    } catch (e) {
        return res.error("Error when trying upload image: " + e.message)
    }
}

const createImageObject = async (baseURL, image) => {
    const _link = baseURL + "/uploads/" + image;
    const filePath = "./uploads/" + image

    //get image size
    const size = await getImageSize(filePath)

    //create thumbnail object
    const thumbnailsObject = await createThumbNailObject(size, baseURL, image, filePath)


    const imageObject = {
        '_link': _link,
        'thumbnails': thumbnailsObject
    }

    return imageObject;
}

const createThumbNailObject = async (size, baseURL, image, filePath) => {
    const { width, height } = size;
    const thumbnailObject = []

    //compare the size
    if (width >= 128 || height >= 128) {
        const resizeSizes = [32, 64];

        for (const [index, size] of resizeSizes.entries()) {
            //resize image
            const afterResizeImage = await resizeImage(size, image, filePath, index)
            thumbnailObject.push({ '_link': baseURL + "/uploads/" + afterResizeImage })
        }
    } else {
        thumbnailObject.push({ '_link': baseURL + "/uploads/" + image })
    }
    return thumbnailObject
}

const unzipImage = (filePath) => {
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

    //unzip to uploads folder
    unzip.extractAllTo('uploads', true);

    return images
}

const getImageSize = (filePath) => {
    return new Promise(async (resolve, reject) => {
        gm(filePath)
            .size((err, size) => {
                if (err) reject(err)
                resolve(size)
            })
    })
}

const resizeImage = (size, image, filePath, index) => {
    return new Promise((resolve, reject) => {
        const resizeName = image.split('.')[0] + '-resize-' + index + '.'
            + image.split('.')[1]

        gm(filePath)
            .resize(size)
            .write('./uploads/' + resizeName, err => {
                if (err) reject(err)
                resolve(resizeName)
            })
    })
}

module.exports = { uploadsFile }