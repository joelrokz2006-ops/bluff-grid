export function load(key, defaultValue) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? defaultValue : JSON.parse(v);
  } catch (e) {
    return defaultValue;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
}
