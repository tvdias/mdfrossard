const SparkPost = require('sparkpost');
const sparky = new SparkPost(process.env.SPARKPOST_SECRET);

const headers = {
  // "Access-Control-Allow-Origin" : "https://mdfrossard.netlify.com",
  "Access-Control-Allow-Origin" : "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type"
};

exports.handler = function(event, context, callback) {
  // only allow POST requests
  if (event.httpMethod !== "POST") {
    return callback(null, {
      statusCode: 410,
      body: JSON.stringify({
        message: 'Only POST requests allowed.',
      }),
    });
  }

  // parse the body to JSON so we can use it in JS
  const payload = JSON.parse(event.body);

  // validate the form
  if (
    !payload.name ||
    !payload.email ||
    !payload.subject ||
    !payload.message
  ) {
    return callback(null, {
      statusCode: 422,
      headers,
      body: JSON.stringify({
        message: 'Required information is missing.',
      }),
    });
  }
  
  sparky.transmissions.send({
    content: {
      from: 'site@email.mdfrossard.com.br',
      subject: 'CONTATO: ' + payload.subject,
      html: '<html><body><p>Mensagem enviada pelo site</p><p>De: ' + payload.name + ' - ' + payload.email + '</p><p>Assunto: ' + payload.subject + '</p><p>Mensagem:<br />' + payload.message + '</p></body></html>'
    },
    recipients: [ { address: process.env.CONTACT_EMAIL } ]
  })
  .then(data => {
    console.log('Woohoo! You just sent your first mailing!');
    // if everything was fine we send status code 200
    return callback(null, {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Message sent successfully!",
      }),
    });
  })
  .catch(err => {
    console.log('Whoops! Something went wrong');
    // if there happenend an error on the postmark side we send a 500 error to the client
    return callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error: " + err,
      })
    });
  });
}


  // // finally everything is fine and we can send the mail
  // return client.sendEmail({
  //   "From": "my@email.com",
  //   "To": "my@email.com",
  //   "ReplyTo": payload.email,
  //   "Subject": `${payload.subject}`,
  //   "TextBody": `
  //     Hey,
  //     ${payload.name} sent a new message from your website!
  //     ${payload.message}
  //     Cheers, your webserver!
  //   `
  // }, (err, result) => {
  //   // if there happenend an error on the postmark side we send a 500 error to the client
  //   if (err) {
  //     return callback(null, {
  //       statusCode: 500,
  //       body: JSON.stringify({
  //         message: "Internal Server Error: " + err,
  //       })
  //     });
  //   }
  //   // if everything was fine we send status code 200
  //   return callback(null, {
  //     statusCode: 200,
  //     headers,
  //     body: JSON.stringify({
  //       message: "Message sent successfully!",
  //     }),
  //   });
  // });