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