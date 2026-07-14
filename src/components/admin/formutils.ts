/* ===== utilidades ===== */
export const isValidUrl = (value: string) => {
    try {
      const u = new URL(value);
      return !!u.protocol && !!u.host;
    } catch {
      return false;
    }
  };