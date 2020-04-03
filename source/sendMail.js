const { testAccount_user, testAccount_pass } = require('../config');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');

async function sendEMail(email, context) {
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount_user, // generated ethereal user
      pass: testAccount_pass // generated ethereal password
    }
  });

  const options = {
    viewEngine: {
      extname: '.handlebars',
      layoutsDir:
        '/Users/Arindam/Desktop/Project/js-basic/product-management/views/',
      defaultLayout: 'index',

      partialsDir:
        '/Users/Arindam/Desktop/Project/js-basic/product-management/views/'
    },
    viewPath:
      '/Users/Arindam/Desktop/Project/js-basic/product-management/views/',
    extName: '.handlebars'
  };

  transporter.use('compile', hbs(options));

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'den.peter1234@gmail.com', // sender address
    to: email, // list of receivers
    subject: 'Order Details', // Subject line
    text: 'Hello', // plain text body

    /*attachments: [
      {filename: 'tagore.jpg', path: './source/tagore.jpg'}
    ],*/
    template: 'index',
    context: context
  });

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

module.exports = sendEMail;
