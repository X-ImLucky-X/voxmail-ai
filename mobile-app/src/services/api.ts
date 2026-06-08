import { supabase } from "../lib/supabase";

const BASE_URL = "http://10.210.215.208:8000";

/**
 * Dynamically fetches the current user session from Supabase memory
 * and appends the explicit Bearer token context alongside content constraints.
 */
async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    "Authorization": `Bearer ${session?.access_token ?? ""}`,
    "Content-Type": "application/json",
  };
}

export async function getEmails() {
  const response = await fetch(`${BASE_URL}/inbox`, {
    headers: await getAuthHeaders(),
  });
  return await response.json();
}

export async function processEmail(id: string) {
  const response = await fetch(`${BASE_URL}/emails/${id}/process`, {
    headers: await getAuthHeaders(),
  });
  return await response.json();
}

export async function toggleTask(taskId: string) {
  await fetch(`${BASE_URL}/tasks/${taskId}/toggle`, {
    method: "POST",
    headers: await getAuthHeaders(),
  });
}

export async function getTasks() {
  const response = await fetch(`${BASE_URL}/tasks`, {
    headers: await getAuthHeaders(),
  });
  return response.json();
}

export async function saveStyle(reply: string) {
  const response = await fetch(`${BASE_URL}/save-style`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ reply }),
  });
  return await response.json();
}

// 🎯 Bug Fix: Attached dynamic headers to replyEmail to prevent 401 failures
export async function replyEmail(to: string, subject: string, body: string) {
  const response = await fetch(`${BASE_URL}/reply-email`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      to,
      subject,
      body,
    }),
  });
  return await response.json();
}

export async function getDashboard() {
  const response = await fetch(`${BASE_URL}/dashboard`, {
    headers: await getAuthHeaders(),
  });
  return await response.json();
}

// 🛡️ Extra Endpoints: Fully authenticated fallback hooks for standalone agent pipelines
export async function standaloneTriage(subject: string, body: string) {
  const response = await fetch(`${BASE_URL}/triage`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ subject, body }),
  });
  return await response.json();
}

export async function testAuth() {

  const response = await fetch(
    `${BASE_URL}/me`,
    {
      headers: await getAuthHeaders(),
    }
  );

  const data = await response.json();

  console.log("AUTH TEST:", data);

  return data;
}

export async function standaloneDraft(emailContent: string) {
  const response = await fetch(`${BASE_URL}/draft`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify({ email: emailContent }),
  });
  return await response.json();
}