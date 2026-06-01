fetch('https://jpbstorex.com.br/api/webhooks/mercadopago', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  redirect: 'manual',
  body: JSON.stringify({ type: 'payment', data: { id: '161896523624' } })
}).then(async res => {
  console.log('Status:', res.status);
  console.log('Location:', res.headers.get('location'));
  console.log('Body:', await res.text());
}).catch(err => {
  console.error(err);
});
