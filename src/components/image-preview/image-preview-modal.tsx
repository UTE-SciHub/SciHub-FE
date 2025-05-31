import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, ZoomIn, ZoomOut, RotateCw, Download } from "lucide-react"

interface ImagePreviewModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    imageUrl: string | null
    altText?: string
}

const ImagePreviewModal = ({ open, onOpenChange, imageUrl, altText = "Image preview" }: ImagePreviewModalProps) => {
    const [scale, setScale] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(false)

    // Reset state when modal opens with new image
    useEffect(() => {
        if (open) {
            setScale(1)
            setRotation(0)
            setIsLoading(true)
            setError(false)
        }
    }, [open, imageUrl])

    const handleZoomIn = () => {
        setScale((prev) => Math.min(prev + 0.25, 3))
    }

    const handleZoomOut = () => {
        setScale((prev) => Math.max(prev - 0.25, 0.5))
    }

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360)
    }

    const handleDownload = () => {
        if (!imageUrl) return

        const link = document.createElement("a")
        link.href = imageUrl
        link.download = altText || "image"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleImageLoad = () => {
        setIsLoading(false)
    }

    const handleImageError = () => {
        setIsLoading(false)
        setError(true)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black/90 border-none">
                <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
                    {/* Close button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 z-10 text-white hover:bg-white/20 rounded-full"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>

                    {/* Image controls */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 rounded-full p-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={handleZoomIn}
                        >
                            <ZoomIn className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={handleZoomOut}
                        >
                            <ZoomOut className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={handleRotate}
                        >
                            <RotateCw className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full"
                            onClick={handleDownload}
                        >
                            <Download className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-8 w-8 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="text-white text-center">
                            <p>Failed to load image</p>
                            <Button
                                variant="outline"
                                className="mt-2 text-white border-white hover:bg-white/20"
                                onClick={() => window.open(imageUrl || "", "_blank")}
                            >
                                Open in new tab
                            </Button>
                        </div>
                    )}

                    {/* Image */}
                    {imageUrl && !error && (
                        <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={altText}
                            className="max-h-[80vh] max-w-full object-contain transition-all duration-200"
                            style={{
                                transform: `scale(${scale}) rotate(${rotation}deg)`,
                                display: isLoading ? "none" : "block",
                            }}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ImagePreviewModal
