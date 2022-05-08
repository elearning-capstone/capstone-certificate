const axios = require("axios");
const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

const user_ip = "http://ip-172-31-33-253.ap-southeast-1.compute.internal:3000";
const course_ip = "http://ip-172-31-36-250.ap-southeast-1.compute.internal:3000";

const senderEmail = "";
const senderPass = "";

const certImage = __dirname + "/../images/certificate.png";
const nameFont = __dirname + "/../fonts/KaushanScript-Regular.ttf";
const desFont = __dirname + "/../fonts/Roboto-Regular.ttf";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: senderPass
    }
});

router.get("/", async (req, res) => {
    try {
        const { user_id, course_id } = req.query;

        const user_info = await axios.get(user_ip + "/user/information", { params: { user_id } });
        const course_info = await axios.get(course_ip + "/course/information", { params: { course_id } });
        const lecturer_id = (course_info.data.lecturer_id);
        const lecturer_info = await axios.get(user_ip + "/user/information", { params: { user_id: lecturer_id } });
        
        const email = user_info.data.email;
        const fullname = user_info.data.fullname;
        const coursename = course_info.data.name;
        const description = "for completing the course: \n" + coursename;
        const lecturer = lecturer_info.data.fullname;
        
        const doc = new PDFDocument({
            layout: "landscape",
            size: "A4",
        });

        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {

            let pdfData = Buffer.concat(buffers);

            const mailOptions = {
                from: senderEmail,
                to: email,
                subject: "Certificate for Completion",
                text: "Congratulation for completing the course: "+coursename,
                attachments: [{
                    filename: "Certificate.pdf",
                    content: pdfData
                }]
            };

            return transporter
                .sendMail(mailOptions)
                .then(() => {
                    console.log("email sent");
                })
                .catch(error => {
                    console.error("There was an error while sending the email: ", error);
                });
        });

        doc.image(certImage, 0, 0, { width: 842 });

        doc.font(nameFont);
        doc.fontSize(50).text(fullname, 65, 220, { align: "center" });

        doc.font(desFont);
        doc.fontSize(16).text(description, 65, 310, { align: "center" });

        doc.font(nameFont);
        doc.fontSize(20).text(lecturer, 535, 455, { align: "center" });

        doc.end();

        return res.json({ message: "success" });
    } catch(err) {
        return res.status(404).json({ message: "not found" });
    }
});

module.exports = router;