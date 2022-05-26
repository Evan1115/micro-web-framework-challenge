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
            expect(message).toBe("No file is selected");

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
            expect(message).toBe("Error when trying upload image: Allowed only image type or zip type of images");
            expect(fileExists).toBeFalsy()
        })
    })
    describe("upload a single image", () => {
        describe('upload successfully', () => {
            const testDataPath = `${__dirname}/testData/test-4.jpg`;
            const filePath = `${__dirname}/uploads/test-4.jpg`;

            it("should return success response ", async () => {
                const image_link = '/uploads/test-4.jpg'

                const response = await request(app)
                    .post("/api/images/upload")
                    .attach('file', testDataPath)

                const { success, message, images } = response.body;

                const urlExist = images[0]._link.includes(image_link)
                const fileExists = await fs.exists(filePath)

                expect(fileExists).toBeTruthy();
                expect(response.statusCode).toBe(200);
                expect(success).toBeTruthy();
                expect(message).toBe("Uploaded successfully");
                expect(urlExist).toBeTruthy();
                fs.unlink(filePath)
            })

            it("shoudl return thumbnails ", async () => {
                const thumbnail1_link = '/uploads/' + 'test-4-resize-0.jpg'
                const thumbnail2_link = '/uploads/' + 'test-4-resize-1.jpg'

                const response = await request(app)
                    .post("/api/images/upload")
                    .attach('file', testDataPath)

                const { images } = response.body;
                const thumbnails = images[0].thumbnails;

                const thumbnail1Exist = thumbnails[0]._link.includes(thumbnail1_link);
                const thumbnail2Exist = thumbnails[1]._link.includes(thumbnail2_link);

                expect(thumbnails.length).toBe(2)
                expect(thumbnail1Exist).toBeTruthy();
                expect(thumbnail2Exist).toBeTruthy();
            })
        })

        describe('upload unsuccessfully', () => {
            it("shoudl not save the file ", async () => {
                const testDataPath = `${__dirname}/testData/test-5.pdf`;
                const filePath = `${__dirname}/uploads/test-5.pdf`;

                await request(app)
                    .post("/api/images/upload")
                    .attach('file', testDataPath)

                const fileExists = await fs.exists(filePath)

                expect(fileExists).toBeFalsy()
            })
        })

    })

    describe("upload a zip of images", () => {
        const testDataPath = `${__dirname}/testData/test.zip`;
        const filePath = `${__dirname}/uploads/test.zip`;

        describe("upload successfully", () => {

            it("should return success response ", async () => {
                const imagesLink = ['/uploads/test-1.jpg', '/uploads/test-2.jpg', '/uploads/test-3.jpg']

                const response = await request(app)
                    .post("/api/images/upload")
                    .attach('file', testDataPath)
                const { success, message, images } = response.body;

                expect(images).not.toBe([]);
                expect(images.length).toBe(3);
                images.forEach((image, index) => {
                    expect(image._link.includes(imagesLink[index])).toBeTruthy;
                })
                expect(response.statusCode).toBe(200);
                expect(success).toBeTruthy();
                expect(message).toBe("Uploaded successfully");
            })

            it("should return thumbnails for each image", async () => {
                const thumbnail1_links = ['/uploads/' + 'test-1-resize-0.jpg', '/uploads/' + 'test-1-resize-1.jpg']
                const thumbnail2_links = ['/uploads/' + 'test-2-resize-0.jpg', '/uploads/' + 'test-3-resize-1.jpg']
                const thumbnail3_links = ['/uploads/' + 'test-3-resize-0.jpg']
                const response = await request(app)
                    .post("/api/images/upload")
                    .attach('file', testDataPath)
                const { images } = response.body;

                const thumbnail1 = images[0].thumbnails;
                const thumbnail2 = images[1].thumbnails;
                const thumbnail3 = images[2].thumbnails;

                const thumbnail1_1Exist = thumbnail1[0]._link.includes(thumbnail1_links[0])
                const thumbnail1_2Exist = thumbnail1[1]._link.includes(thumbnail1_links[1])

                const thumbnail2_1Exist = thumbnail2[0]._link.includes(thumbnail2_links[0])
                const thumbnail2_2Exist = thumbnail2[1]._link.includes(thumbnail2_links[1])

                const thumbnail3_1Exist = thumbnail3[0]._link.includes(thumbnail3_links[0])


                expect(thumbnail1.length).toBe(2)
                expect(thumbnail1_1Exist).toBeTruthy
                expect(thumbnail1_2Exist).toBeTruthy

                expect(thumbnail2.length).toBe(2)
                expect(thumbnail2_1Exist).toBeTruthy
                expect(thumbnail2_2Exist).toBeTruthy

                expect(thumbnail3.length).toBe(1)
                expect(thumbnail3_1Exist).toBeTruthy

            })

            it("should delete the zip file", async () => {
                await request(app)
                    .post("/api/images/upload")
                    .attach('file', testDataPath)

                const fileExists = await fs.exists(filePath)

                expect(fileExists).toBeFalsy();
            })
        })

        describe("upload unsuccessfully", () => {
            const testDataPath = `${__dirname}/testData/test-contains-pdf.zip`;
            const filePath = `${__dirname}/uploads/test-contains-pdf.zip`;
            it("should return error when upload zip contains non image type", async () => {

                const response = await request(app)
                    .post("/api/images/upload")
                    .attach('file', testDataPath)
                const { success, message } = response.body
                const fileExists = await fs.exists(filePath)

                expect(fileExists).toBeFalsy();
                expect(response.statusCode).toBe(400);
                expect(success).toBeFalsy();
                expect(message).toBe("Error when trying upload image: Zip contains non image type");
            })

            it("should delete the zip file", async () => {
                await request(app)
                    .post("/api/images/upload")
                    .attach('file', testDataPath)

                const fileExists = await fs.exists(filePath)

                expect(fileExists).toBeFalsy();
            })
        })
    })
})
