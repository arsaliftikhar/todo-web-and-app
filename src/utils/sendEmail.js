import nodemailer from 'nodemailer'

export default async function sendEmail(props) {
    //email sending start
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        // secure: true,
        auth: {
            user: process.env.EMAIL_ADDRESS,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: props.to,
        subject: props.subject,
        html: props.html
    };

    try 
    {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true;
    } 
    catch (error) 
    {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
    //email sending end
}
