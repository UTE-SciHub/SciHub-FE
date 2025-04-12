import type React from "react"
/**
 * Utility functions for image handling
 */

/**
 * Checks if a URL is a valid image URL by extension
 * @param url The URL to check
 * @returns boolean indicating if the URL is likely an image
 */
export const isImageUrl = (url: string): boolean => {
  if (!url) return false

  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"]
  const lowerUrl = url.toLowerCase()

  return imageExtensions.some((ext) => lowerUrl.endsWith(ext))
}

/**
 * Creates a placeholder image URL with initials
 * @param name The name to generate initials from
 * @param bgColor Background color (hex without #)
 * @param textColor Text color (hex without #)
 * @returns A data URL for a SVG image with initials
 */
export const createInitialsPlaceholder = (name: string, bgColor = "0056a6", textColor = "ffffff"): string => {
  const initials = getInitials(name);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="#${bgColor}"/>
      <text x="50" y="50" font-family="Arial" font-size="40" fill="#${textColor}" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>
  `;

  // Encode SVG string safely with UTF-8
  const encodedSvg = window.btoa(unescape(encodeURIComponent(svg)));

  return `data:image/svg+xml;base64,${encodedSvg}`;
}


/**
 * Gets initials from a name
 * @param name The full name
 * @returns Up to 2 characters of initials
 */
export const getInitials = (name: string): string => {
  if (!name) return "?"

  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Handles image loading errors by applying a fallback
 * @param event The error event
 * @param fallback Optional fallback URL
 */
export const handleImageError = (event: React.SyntheticEvent<HTMLImageElement, Event>, fallback?: string): void => {
  const imgElement = event.currentTarget

  if (fallback) {
    imgElement.src = fallback
  } else {
    // Apply a CSS class for styling fallback
    imgElement.classList.add("image-error")

    // Create a parent wrapper if needed for more complex fallbacks
    const parent = imgElement.parentElement
    if (parent) {
      parent.classList.add("image-error-container")
    }
  }
}

/**
 * Generates a blurhash placeholder URL for progressive loading
 * Note: This is a simplified version. In a real app, you'd use a library like blurhash
 * @param width Width of the placeholder
 * @param height Height of the placeholder
 * @param color Background color (hex without #)
 * @returns A data URL for a placeholder image
 */
export const generatePlaceholder = (width = 100, height = 100, color = "e2e8f0"): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#${color}"/>
    </svg>
  `

  const encodedSvg = window.btoa(unescape(encodeURIComponent(svg)));

  return `data:image/svg+xml;base64,${encodedSvg}`;
}
