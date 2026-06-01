const BASE_URL = "http://192.168.1.38:8000";

export async function getEmails() {
  const response = await fetch(`${BASE_URL}/inbox`);
  return await response.json();
}

export async function processEmail(id: string) {
  const response = await fetch(
    `${BASE_URL}/emails/${id}/process`
  );

  return await response.json();
}


export async function saveStyle(
  reply: string
) {
  const response = await fetch(
    `${BASE_URL}/save-style`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        reply,
      }),
    }
  );

  return await response.json();
}

export async function replyEmail(
  to: string,
  subject: string,
  body: string
) {

  const response = await fetch(
    `${BASE_URL}/reply-email`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        body,
      }),
    }
  );

  return await response.json();
}

export async function getDashboard() {

  const response = await fetch(
    `${BASE_URL}/dashboard`
  );

  return await response.json();
}