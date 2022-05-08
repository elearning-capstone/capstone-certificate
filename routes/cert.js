const axios = require("axios");
const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

router.get("/", async (req, res) => {
    try {
        const { user_id, course_id } = req.query;

        const certImage = __dirname + "/../images/certificate.png";
        const nameFont = __dirname + "/../fonts/KaushanScript-Regular.ttf";
        const desFont = __dirname + "/../fonts/Roboto-Regular.ttf";

        // TO DO: get & fill information
        const email = "";
        const fullname = "";
        const coursename = "";
        const description = "for completing the course: \n" + coursename;
        const lecturer = "";
        //

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "", // TO BE FILLED
              pass: "" // TO BE FILLED
            }
        });
        
        const doc = new PDFDocument({
            layout: "landscape",
            size: "A4",
        });

        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", () => {

            let pdfData = Buffer.concat(buffers);

            const mailOptions = {
                from: "", // TO BE FILLED
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