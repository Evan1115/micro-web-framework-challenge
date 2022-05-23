const request = require('supertest');
const fs = require('mz/fs');
const app = require('./app');

describe("POST /api/images/upload - upload a new image", () => {

    it("should upload file successfully", async () => {
        const testDataPath = `${__dirname}/testData/clipboard-0.jpg`;
        const filePath = `${__dirname}/uploads/clipboard-0.jpg`;

        const response = await request(app)
            .post("/api/images/upload")
            .attach('file', testDataPath)

        const { success, message, image } = response.body

        const urlExist = image._link.includes('/uploads/clipboard-0.jpg')
        const fileExists = await fs.exists(filePath)

        expect(fileExists).toBeTruthy();
        expect(response.statusCode).toBe(200);
        expect(success).toBeTruthy();
        expect(message).toBe("Uploaded successfully");
        expect(urlExist).toBeTruthy();
        fs.unlink(filePath)
    })

    it('should return error when file type is empty ', async () => {
        const response = await request(app)
            .post("/api/images/upload")
            .attach('file')
        const { success, message } = response.body

        expect(response.statusCode).toBe(400);
        expect(success).toBeFalsy();
        expect(message).toBe("No file is inserted");
    })

    it('should return error when file type is wrong ', async () => {
        const testDataPath = `${__dirname}/testData/Lim_Lee_Jing_Resume.pdf`;
        const filePath = `${__dirname}/uploads/Lim_Lee_Jing_Resume.pdf`;

        const response = await request(app)
            .post("/api/images/upload")
            .attach('file', testDataPath)
        const { success, message } = response.body
        const fileExists = await fs.exists(filePath)

        expect(response.statusCode).toBe(400);
        expect(success).toBeFalsy();
        expect(message).toBe("Allowed only image type");
        expect(fileExists).toBeFalsy()
    })
})
