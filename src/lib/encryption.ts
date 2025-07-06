import CryptoJS from "crypto-js";

export async function encrypt(text: string): Promise<string> {
  return new Promise((resolve) => {
    const encryptedText = CryptoJS.AES.encrypt(
      text,
      import.meta.env.VITE_ENCRYPTION_KEY,
    ).toString();

    resolve(encryptedText);
  });
}

export function encryptSync(text: string) {
  return CryptoJS.AES.encrypt(
    text,
    import.meta.env.VITE_ENCRYPTION_KEY,
  ).toString();
}

export async function decrypt(data: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const bytes = CryptoJS.AES.decrypt(
        data,
        import.meta.env.VITE_ENCRYPTION_KEY,
      );

      const originalText = bytes.toString(CryptoJS.enc.Utf8);

      if (!originalText) {
        throw new Error("Decryption failed - invalid key or corrupted data");
      }

      resolve(originalText);
    } catch (error) {
      reject(error);
    }
  });
}

export function decryptSync(data: string) {
  const bytes = CryptoJS.AES.decrypt(data, import.meta.env.VITE_ENCRYPTION_KEY);

  const decryptedText = bytes.toString(CryptoJS.enc.Utf8) as string;

  if (!decryptedText) {
    throw new Error("Decryption failed - invalid key or corrupted data");
  }

  return decryptedText;
}
