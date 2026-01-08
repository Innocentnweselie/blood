const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port: 5001, path, agent: false }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', (err) => reject(err));
  });
}

(async () => {
  try {
    console.log('GET /api/items');
    const items = await get('/api/items');
    console.log('Status:', items.status);
    console.log('Body:', items.body);
  } catch (e) {
    console.error('Error /api/items ->', e.message);
  }

  try {
    console.log('\nGET /api/suppliers');
    const suppliers = await get('/api/suppliers');
    console.log('Status:', suppliers.status);
    console.log('Body:', suppliers.body);
  } catch (e) {
    console.error('Error /api/suppliers ->', e.message);
  }
})();
