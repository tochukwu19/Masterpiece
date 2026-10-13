const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = /^(image\/|video\/|application\/pdf$)/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const redirect = (request, path) => Response.redirect(new URL(path, request.url).toString(), 303);

const field = (form, name, max) => String(form.get(name) ?? '').trim().slice(0, max);

const toBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
};

const verifyTurnstile = async (env, token, ip) => {
  const body = new FormData();
  body.append('secret', env.TURNSTILE_SECRET_KEY);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const result = await response.json();
  return result.success === true;
};

const sendEmail = async (env, email) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(email),
  });
  if (!response.ok) throw new Error(`Resend ${response.status}: ${await response.text()}`);
};

export const onRequestPost = async ({ request, env }) => {
  let form;
  try {
    form = await request.formData();
  } catch {
    return redirect(request, '/contact/#error-invalid');
  }

  const details = {
    firstName: field(form, 'first_name', 80),
    lastName: field(form, 'last_name', 80),
    email: field(form, 'email', 200),
    storeUrl: field(form, 'store_url', 200),
    message: field(form, 'message', 10000),
  };

  if (!details.firstName || !details.lastName || !EMAIL.test(details.email) || !details.storeUrl || !details.message) {
    return redirect(request, '/contact/#error-invalid');
  }

  const files = form.getAll('attachments').filter((file) => typeof file === 'object' && file.size > 0);
  if (files.length > MAX_FILES || files.some((file) => file.size > MAX_FILE_BYTES || !ALLOWED_TYPES.test(file.type))) {
    return redirect(request, '/contact/#error-files');
  }

  const verified = await verifyTurnstile(env, field(form, 'cf-turnstile-response', 4096), request.headers.get('CF-Connecting-IP'));
  if (!verified) return redirect(request, '/contact/#error-verification');

  const name = `${details.firstName} ${details.lastName}`;
  const attachments = await Promise.all(
    files.map(async (file) => ({ filename: file.name || 'attachment', content: toBase64(await file.arrayBuffer()) }))
  );

  try {
    await sendEmail(env, {
      from: env.SUPPORT_FROM,
      to: [env.SUPPORT_INBOX],
      reply_to: details.email,
      subject: `Vermeil support: ${name} (${details.storeUrl})`,
      text: [
        `Name: ${name}`,
        `Email: ${details.email}`,
        `Store: ${details.storeUrl}`,
        `Attachments: ${attachments.length}`,
        '',
        details.message,
      ].join('\n'),
      attachments,
    });
  } catch (error) {
    console.error(error);
    return redirect(request, '/contact/#error-delivery');
  }

  try {
    await sendEmail(env, {
      from: env.SUPPORT_FROM,
      to: [details.email],
      reply_to: env.SUPPORT_INBOX,
      subject: 'We received your Vermeil support request',
      text: [
        `Hi ${details.firstName},`,
        '',
        'Thanks for contacting Vermeil support. We received your message and will reply within two business days.',
        'To add details or screenshots, reply to this email.',
        '',
        'Your message:',
        '',
        details.message,
        '',
        'Vermeil support',
      ].join('\n'),
    });
  } catch (error) {
    console.error(error);
  }

  return redirect(request, '/contact/sent/');
};
