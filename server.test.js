const request = require('supertest');
const fs = require('mz/fs');
const app = require('./app');

describe("POST /api/images/upload", () => {

    describe("upload an empty file", () => {
        it("should return error", async () => {
            const response = await request(app)
                .post("/api/images/upload")
                .attach('file')
            const { success, message } = response.body

            expect(response.statusCode).toBe(400);
            expect(success).toBeFalsy();
            expect(message).toBe("No file is inserted");

        })
    })

    describe("upload a non image or zip file", () => {
        it('should return error and file is not saved', async () => {
            const testDataPath = `${__dirname}/testData/test-5.pdf`;
            const filePath = `${__dirname}/uploads/test-5.pdf`;

            const response = await request(app)
                .post("/api/images/upload")
                .attach('file', testDataPath)
            const { success, message } = response.body
            const fileExists = await fs.exists(filePath)

            expect(response.statusCode).toBe(400);
            expect(success).toBeFalsy();
            expect(message).toBe("Allowed only image type or zip type of images");
            expect(fileExists).toBeFalsy()
        })
    })
    describe("upload a single image", () => {
        it("should upload a image successfully", async () => {
            const testDataPath = `${__dirname}/testData/test-4.jpg`;
            const filePath = `${__dirname}/uploads/test-4.jpg`;

            const response = await request(app)
                .post("/api/images/upload")
                .attach('file', testDataPath)

            const { success, message, images } = response.body

            const urlExist = images[0]._link.includes('/uploads/test-4.jpg')
            const fileExists = await fs.exists(filePath)

            expect(fileExists).toBeTruthy();
            expect(response.statusCode).toBe(200);
            expect(success).toBeTruthy();
            expect(message).toBe("Uploaded successfully");
            expect(urlExist).toBeTruthy();
            fs.unlink(filePath)
        })
    })

    describe("upload a zip of images", () => {
        it("should successfully upload zip of images", async () => {
            const testDataPath = `${__dirname}/testData/test.zip`;
            const imagesLink = ['/uploads/test-1.jpg', '/uploads/test-2.jpg', '/uploads/test-3.jpg']
            const response = await request(app)
                .post("/api/images/upload")
                .attach('file', testDataPath)
            const { success, message, images } = response.body

            expect(images).not.toBe([])
            images.forEach((image, index) => {
                console.log(image._link)
                expect(image._link.includes(imagesLink[index])).toBeTruthy
            })
            expect(response.statusCode).toBe(200);
            expect(success).toBeTruthy();
            expect(message).toBe("Uploaded successfully");
        })

        it("should return error when upload zip contains non image type", async () => {
            const testDataPath = `${__dirname}/testData/test-contains-pdf.zip`;
            const filePath = `${__dirname}/uploads/test-contains-pdf.zip`;

            const response = await request(app)
                .post("/api/images/upload")
                .attach('file', testDataPath)
            const { success, message } = response.body
            const fileExists = await fs.exists(filePath)

            expect(fileExists).toBeFalsy();
            expect(response.statusCode).toBe(400);
            expect(success).toBeFalsy();
            expect(message).toBe("Zip contains non image type");
        })

    })
})
