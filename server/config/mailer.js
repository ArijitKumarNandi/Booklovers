import nodemailer from "nodemailer"

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAIL_FROM,
} = process.env

const hasSmtpConfig = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS

const transporter = hasSmtpConfig ? nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
}) : null

export const sendMail = async ({to, subject, html}) => {
    if(!transporter){
        throw new Error("SMTP email is not configured")
    }

    return transporter.sendMail({
        from: MAIL_FROM || SMTP_USER,
        to,
        subject,
        html,
    })
}
