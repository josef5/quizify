export async function encrypt(text: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(import.meta.env.VITE_ENCRYPTION_KEY),
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text),
  );
  // Store IV with ciphertext (base64)
  return btoa(
    String.fromCharCode(...iv) +
      String.fromCharCode(...new Uint8Array(encrypted)),
  );
}

export async function decrypt(data: string): Promise<string> {
  const raw = atob(data);
  const iv = new Uint8Array([...raw].slice(0, 12).map((c) => c.charCodeAt(0)));
  const encrypted = new Uint8Array(
    [...raw].slice(12).map((c) => c.charCodeAt(0)),
  );
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(import.meta.env.VITE_ENCRYPTION_KEY),
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted,
  );
  return new TextDecoder().decode(decrypted);
}
