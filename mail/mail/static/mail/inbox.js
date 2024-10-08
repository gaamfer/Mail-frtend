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

  // Clear the previous emails
  document.querySelector('#emails-view').innerHTML += '';

  // fetch the emails from the mailbox  
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    emails.forEach(email => {
      
      // For the 'archive' mailbox, only show the archived emails
      if (mailbox === 'archive' && email.archived) {
        add_email(email);
      }

      // For other types of mailboxes, show all non archived emails
      else if (mailbox !== 'archive' && !email.archived) {
        add_email(email);
      }

    });
  });
}

// Function to add email to the DOM
function add_email(email){

  // Create the div for the email
  const email_div = document.createElement('div');
  
  email_div.className = `email_${email.id} clickable`;
  email_div.id = 'eachmail';
  email_div.setAttribute('role', 'button');
  email_div.innerHTML = `
    <h4 id='mailsender'> ${email.sender}</h4>
    <p id='subject'> ${email.subject} </p>
    <p id='timestamp'> ${email.timestamp} </p>`;
  
  if (email.read) {
  email_div.style.backgroundColor = 'gray';
  }

  // Add archive/unarchive button based on email's archived status
  if (email.archived) {
    email_div.innerHTML += `<button class="unarchive" data-id="${email.id}">Unarchive</button>`;
  } else {
    email_div.innerHTML += `<button class="archive" data-id="${email.id}">Archive</button>`;
  }

  // Append email to the DOM
  document.querySelector('#emails-view').append(email_div);

  // Event listener to view the email when clicked (not the button itself)
  email_div.addEventListener('click', function() {
    read_email(email);  // This function would load the email's details into the view
  });

  // Prevent the email view click event from firing when archive/unarchive is clicked
  email_div.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(event) {
      event.stopPropagation();  // Prevent click event from triggering the email view

      // Handle archiving/unarchiving
      if (button.classList.contains('archive')) {
        add_to_archives(email.id);  // Archive the email
      } else if (button.classList.contains('unarchive')) {
        remove_from_archives(email.id);  // Unarchive the email
      }
    });
  });

}


// Function to archive the email
function add_to_archives(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  .then(() => load_mailbox('inbox'));
}

// Function to remove from the archives
function remove_from_archives(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  .then(() => load_mailbox('archive'));
}

// Function to open the email
function read_email(email) {
   // Set read status to true for the email
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });

  // Hide the emails-view
  document.querySelector('#emails-view').style.display = 'none';

  // fetch the email.id url
  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email_body => {
   
    // Print email to console for debugging
    console.log(email_body);
    
    // Clear the previous email content
    document.querySelector('#emails-view').innerHTML = '';

    // Create a div for the email body
    const eb_div = document.createElement('div');
    eb_div.id = 'email_body';
    eb_div.innerHTML  = `<h4 id='mailsender'> ${email.sender}</h4> <p id='mail_recipients'> ${email.recipients}</p> <p id='subject'> ${email.subject} </p> <p id='body'>${email.body}</p> <p id='timestamp'> ${email.timestamp} </p>`;

    // Add the email body to the DOM
    document.querySelector('#emails-view').append(eb_div);

    // Show the emails-view
    document.querySelector('#emails-view').style.display = 'block';
  })
};

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