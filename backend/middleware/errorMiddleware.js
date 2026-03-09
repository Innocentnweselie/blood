import { sendErrorAlert } from '../utils/alerting.js';

const wantsHtml = (req) => req.accepts('html') && !req.path.startsWith('/api/');

const sendHtml = (res, status, message) => {
  res.status(status).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${status} - Not Found</title>
    <style>
      body { font-family: Arial, sans-serif; background: #f6f7fb; color: #1a1a1a; margin: 0; }
      .wrap { max-width: 720px; margin: 12vh auto; padding: 0 24px; }
      .card { background: #fff; border-radius: 12px; padding: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
      h1 { margin: 0 0 8px; font-size: 28px; }
      p { margin: 6px 0 0; color: #555; }
      code { background: #f0f2f6; padding: 2px 6px; border-radius: 6px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>${status} - Not Found</h1>
        <p>${message}</p>
      </div>
    </div>
  </body>
</html>`);
};

const notFound = (req, res, next) => {
  const message = `Route not found: ${req.originalUrl}`;
  if (wantsHtml(req)) return sendHtml(res, 404, message);
  res.status(404).json({ error: message });
};

const errorHandler = (err, req, res, next) => {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : err.status || 500;
  const message = err.message || 'Server error';

  if (status >= 500) {
    void sendErrorAlert({ status, message, stack: err.stack, req });
  }
  if (wantsHtml(req)) return sendHtml(res, status, message);

  const payload = { error: message };
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }
  res.status(status).json(payload);
};

export { notFound, errorHandler };
