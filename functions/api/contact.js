const SPARKPOST_API_URL = "https://api.sparkpost.com/api/v1/transmissions";
const ALLOWED_ORIGIN = "https://mdfrossard.com.br";

// Sanitize user-supplied HTML to prevent HTML Injection in emails
function escHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function sendMessage(payload, env) {
  const response = await fetch(SPARKPOST_API_URL, {
    method: "POST",
    headers: {
      Authorization: env.SPARKPOST_SECRET,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: {
        from: env.SITE_EMAIL_FROM || "site@email.mdfrossard.com.br",
        subject: `CONTATO: ${payload.subject}`,
        html: `<html><body><p>Mensagem enviada pelo site</p><p>De: ${escHtml(payload.name)} - ${escHtml(payload.email)}</p><p>Assunto: ${escHtml(payload.subject)}</p><p>Mensagem:<br />${escHtml(payload.message)}</p></body></html>`,
      },
      recipients: [{ address: env.CONTACT_EMAIL }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `SparkPost request failed with ${response.status}`);
  }
}

export async function onRequestOptions() {
  return json({ ok: true });
}

export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.SPARKPOST_SECRET || !env.CONTACT_EMAIL) {
    return json({ message: "Missing SPARKPOST_SECRET or CONTACT_EMAIL." }, 500);
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return json({ message: "Invalid JSON payload." }, 400);
  }

  if (payload.website) {
    return json({ message: "Message sent successfully!" });
  }

  if (!payload.name || !payload.email || !payload.subject || !payload.message) {
    return json({ message: "Required information is missing." }, 422);
  }

  try {
    await sendMessage(payload, env);
    return json({ message: "Message sent successfully!" });
  } catch (error) {
    return json({ message: `Internal Server Error: ${error.message}` }, 500);
  }
}