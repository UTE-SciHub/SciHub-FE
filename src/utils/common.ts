export const getInitialsAvt = (name: string) => {
    if (!name) return "U"
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
}

export const stripHtml = (str: string) => {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
};

export const trimAndStrip = (value?: string) => {
    if (!value) return value;
    const trimmed = value.trim();
    const stripped = stripHtml(trimmed);
    return stripped;
};

export const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}