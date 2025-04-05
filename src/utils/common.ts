export const getInitialsAvt = (name: string) => {
    if (!name) return "U"
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
}