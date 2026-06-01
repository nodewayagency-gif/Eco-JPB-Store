fetch('https://jpbstorex.com.br/api/webhooks/mercadopago?type=payment&data.id=161896523624', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ type: 'payment', data: { id: '161896523624' } })
}).then(async res => {
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}).catch(err => {
  console.error(err);
});
