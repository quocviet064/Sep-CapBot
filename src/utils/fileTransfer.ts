export type StoredFile = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

export async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function storeFileTemp(file: StoredFile): string {
  const key = `create-topic-file:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(key, JSON.stringify(file));
  return key;
}

export function loadStoredFile(key: string): StoredFile | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredFile;
  } catch {
    return null;
  }
}

export async function storedToFile(stored: StoredFile): Promise<File> {
  const res = await fetch(stored.dataUrl);
  const blob = await res.blob();
  return new File([blob], stored.name, { type: stored.type });
}
