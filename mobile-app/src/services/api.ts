const BASE_URL = "http://10.23.161.114:8000";

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