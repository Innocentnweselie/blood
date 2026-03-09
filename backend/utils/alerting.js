import sendEmail from './sendEmail.js';

const ALERT_EMAIL_TO = process.env.ALERT_EMAIL_TO;
const ALERT_THROTTLE_MINUTES = Number.parseInt(process.env.ALERT_THROTTLE_MINUTES || '5', 10);
const ALERT_THROTTLE_MS = (Number.isFinite(ALERT_THROTTLE_MINUTES) ? ALERT_THROTTLE_MINUTES : 5) * 60 * 1000;

let lastAlertAt = 0;

const shouldAlert = (status) => {
  if (!ALERT_EMAIL_TO) return false;
  if (!Number.isFinite(status) || status < 500) return false;
  const now = Date.now();
  if (now - lastAlertAt < ALERT_THROTTLE_MS) return false;
  lastAlertAt = now;
  return true;
};

const buildAlertBody = ({ status, message, stack, req }) => {
  const lines = [
    `Status: ${status}`,
    `Message: ${message}`,
    `Method: ${req?.method || 'n/a'}`,
    `URL: ${req?.originalUrl || 'n/a'}`,
    `IP: ${req?.ip || 'n/a'}`,
  ];
  if (stack) {
    lines.push('Stack:');
    lines.push(stack);
  }
  return lines.join('\n');
};

const sendErrorAlert = async ({ status, message, stack, req }) => {
  if (!shouldAlert(status)) return;
  try {
    await sendEmail({
      email: ALERT_EMAIL_TO,
      subject: `[MedTracker] ${status} server error`,
      message: buildAlertBody({ status, message, stack, req }),
    });
  } catch (err) {
    console.error('Alert email failed:', err);
  }
};

export { sendErrorAlert };
