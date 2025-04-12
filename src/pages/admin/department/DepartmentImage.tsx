import { useState, useEffect, useRef } from "react"
import "./css/DepartmentImage.css"
import { ImageIcon } from "lucide-react"
import { createInitialsPlaceholder, generatePlaceholder } from "@/utils/imageUtils"

interface DepartmentImageProps {
    imageUrl: string | null | undefined
    name: string
    size?: "sm" | "md" | "lg"
    onClick?: () => void
    className?: string
    showPlaceholder?: boolean
}

const DepartmentImage = ({
    imageUrl,
    name,
    size = "md",
    onClick,
    className = "",
    showPlaceholder = true,
}: DepartmentImageProps) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const imageRef = useRef<HTMLDivElement>(null)

    // Size classes
    const sizeClasses = {
        sm: "w-10 h-10",
        md: "w-16 h-16",
        lg: "w-24 h-24",
    }

    // Set up intersection observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            { threshold: 0.1 },
        )

        if (imageRef.current) {
            observer.observe(imageRef.current)
        }

        return () => {
            observer.disconnect()
        }
    }, [])

    const handleImageLoad = () => {
        setIsLoaded(true)
        setHasError(false)
    }

    const handleImageError = () => {
        setIsLoaded(true)
        setHasError(true)
    }

    // Generate placeholder with initials if no image or error
    const placeholderUrl = createInitialsPlaceholder(name)
    const blurPlaceholder = generatePlaceholder()

    return (
        <div
            ref={imageRef}
            className={`image-thumbnail ${sizeClasses[size]} ${className}`}
            onClick={onClick}
            style={{ cursor: onClick ? "pointer" : "default" }}
        >
            {isVisible ? (
                <>
                    {!hasError && imageUrl ? (
                        <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={name}
                            className={`lazy-image ${isLoaded ? "loaded" : ""}`}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            style={{ backgroundImage: `url(${blurPlaceholder})` }}
                        />
                    ) : showPlaceholder ? (
                        <div className="image-thumbnail-placeholder">
                            {name ? name.substring(0, 2).toUpperCase() : <ImageIcon size={16} />}
                        </div>
                    ) : (
                        <div className="image-thumbnail-placeholder">
                            <ImageIcon size={16} />
                        </div>
                    )}
                </>
            ) : (
                <div className="image-thumbnail-placeholder">
                    {name ? name.substring(0, 2).toUpperCase() : <ImageIcon size={16} />}
                </div>
            )}
        </div>
    )
}

export default DepartmentImage
