// const express = require('express');
// const nodemailer = require('nodemailer');
// const cron = require('node-cron');
// const moment = require('moment-timezone');
// const bodyParser = require('body-parser');

// const app = express();
// app.use(bodyParser.json());

// // Create a transporter object using the default SMTP transport
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'fake89492@gmail.com', // replace with your email ---(take this also from datbase)
//     pass: '123fake456'   // replace with your email password ---(same as above)
//   }
// });


// const deadlineDate="2024-07-29"


// // Function to schedule a reminder email
// function scheduleReminderEmail(deadlineDate, recipientEmail) {
//   // Email options
//   const mailOptions = {
//     from: 'fake89492@gmail.com',
//     to: recipientEmail,
//     subject: 'Reminder: Project Submission Deadline Approaching',
//     text: 'This is a reminder that the project submission deadline is approaching.'
//   };

//   // Calculate the reminder date and time
//   const reminderDate = moment(deadlineDate).subtract(2, 'days').format('YYYY-MM-DD');
//   const reminderTime = '14:35'; 
//   const reminderDateTime = moment.tz(`${reminderDate} ${reminderTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
//   const reminderCron = `${reminderDateTime.second()} ${reminderDateTime.minute()} ${reminderDateTime.hour()} ${reminderDateTime.date()} ${reminderDateTime.month() + 1} *`;
//   console.log('Cron expression:', reminderCron);

//   console.log("Reminder");
//   // Scheduling the email
//   cron.schedule(reminderCron, () => {
//     console.log('Scheduling');
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         return console.log(error);
//       }
//       console.log('Reminder email sent: ' + info.response);
//     });
//   });
// }

// // Function to check if a submission is late
// function isLateSubmission(submissionDate, deadlineDate) {
//   const deadline = moment(deadlineDate).endOf('day');
//   return moment(submissionDate).isAfter(deadline);
// }



// // Routes
// app.get('/', (req, res) => {
//   res.send('Welcome to the Project Management App');
// });

// // Route to submit a project
// app.post('/submit', (req, res) => {
//   const { submissionDate } = req.body; // Expecting submissionDate in the request body

//   if (isLateSubmission(submissionDate, deadlineDate)) {
//     res.status(400).send('The submission is late.');
//   } else {
//     res.send('The submission is on time.');
//   }
// });

// // Route to schedule a reminder email
// app.post('/scheduleReminder', (req, res) => {
//   const {recipientEmail} = req.body; // take deadline also dynamically,if possible not like "20" line

//   scheduleReminderEmail(deadlineDate, recipientEmail);
//   res.send('Reminder email scheduled successfully.');
// });

// const PORT =3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


const express = require('express');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const moment = require('moment-timezone');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());


async function getEmailCredentials() {
  //  database query
  return {
    user: 'fake89492@gmail.com', //  your email from database
    pass: '123fake456'           //  your email password from database
  };
}


async function getDeadlineDate() {
  //  database query
  return '2024-07-29';
}


async function scheduleReminderEmail(recipientEmail) {
  const { user, pass } = await getEmailCredentials();
  const deadlineDate = await getDeadlineDate();
  
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  // Email options
  const mailOptions = {
    from: user,
    to: recipientEmail,
    subject: 'Reminder: Project Submission Deadline Approaching',
    text: 'This is a reminder that the project submission deadline is approaching.'
  };

  // Calculate the reminder date and time
  const reminderDate = moment(deadlineDate).subtract(2, 'days').format('YYYY-MM-DD');
  const reminderTime = '14:52'; 
  const reminderDateTime = moment.tz(`${reminderDate} ${reminderTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Kolkata');
  const reminderCron = `${reminderDateTime.second()} ${reminderDateTime.minute()} ${reminderDateTime.hour()} ${reminderDateTime.date()} ${reminderDateTime.month() + 1} *`;
  console.log('Cron expression:', reminderCron);

  // Schedule the email
  cron.schedule(reminderCron, () => {
    console.log('Scheduling');
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Reminder email sent: ' + info.response);
    });
  });
}

// Function to check if a submission is late
function isLateSubmission(submissionDate, deadlineDate) {
  const deadline = moment(deadlineDate).endOf('day');
  return moment(submissionDate).isAfter(deadline);
}

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Project Management App');
});

// Route to submit a project
app.post('/submit', async (req, res) => {
  const { submissionDate } = req.body; // Expecting submissionDate in the request body
  const deadlineDate = await getDeadlineDate();

  if (isLateSubmission(submissionDate, deadlineDate)) {
    res.status(400).send('The submission is late.');
  } else {
    res.send('The submission is on time.');
  }
});

// Route to schedule a reminder email
app.post('/scheduleReminder', async (req, res) => {
  const { recipientEmail } = req.body; // Expecting recipientEmail in the request body
  await scheduleReminderEmail(recipientEmail);
  res.send('Reminder email scheduled successfully.');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
