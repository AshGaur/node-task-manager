const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (name,email) =>{
    sgMail.send({
        to: email,
        from: 'techgeniusashutosh@gmail.com',
        subject: 'Welcome to the Task Manager App',
        text: `Dear ${name},
                Thank you for creating an account with Task-Manager App`
    })
}

const sendCancellationEmail = (name,email) =>{
    sgMail.send({
        to:email,
        from: 'techgeniusashutosh@gmail.com',
        subject: 'Cancellation of Account',
        text: `Dear ${name},
                Sorry to know that you want to cancel your account.
                You have been unsubsrcibed, but you can always resubscribe`
    })
}

module.exports={
    sendWelcomeEmail,
    sendCancellationEmail
}