document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // fetch the emails from the mailbox  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    for (let email of emails) {
      const email_div = document.createElement('div');
      email_div.className = `email_${email.id}`;
      email_div.id = 'eachmail';
      email_div.innerHTML = `<h4 id='mailsender'> ${email.sender}</h4> <p id='subject'> ${email.subject} </p> <p id='timestamp'> ${email.timestamp} </p>`;
      document.querySelector('#emails-view').append(email_div);
    }
  });
}

function send_email(event) {
  // prevent the default behavior of the form
  event.preventDefault();

  // Create the variables
  const recipients = document.querySelector('#compose-recipients').value;
  const subject  = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // POST the data from the forms
  fetch('/emails', {
    method:'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.error) {
      // Make an alert with the error
      alert(result.error);
      console.log(result);
      return;
    }
    // Make an alert with the response
    alert(result.message);
    console.log(result);
    load_mailbox('sent');
  });
}