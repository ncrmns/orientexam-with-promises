'use strict'
document.querySelector('button').addEventListener('click', (e) => {
  e.preventDefault();

  fetch('http://localhost:1234/api/links',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(
        {
          url: document.querySelector('.url').value,
          alias: document.querySelector('.alias').value
        })
    })
    .then(data => data.json())
    .then(
      data => {
        if (data.error)
          document.querySelector('p').innerText = data.error;
        else {
          document.querySelector('p').innerText = `Your URL is aliased to ${data.alias} and your secret code is ${data.secretcode}.`;
          document.querySelector('.url').value = '';
          document.querySelector('.alias').value = '';
        }
      }
    )
});

