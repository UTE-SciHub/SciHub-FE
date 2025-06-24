import { useState, useRef, useEffect } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    label?: string
    error?: string
    height?: string
    className?: string
    id?: string
    name?: string
    maxLength?: number
    readOnly?: boolean
    showWordCount?: boolean
    showCharCount?: boolean
    onFocus?: () => void
    onBlur?: () => void
}

export const RichTextEditor = ({
    value,
    onChange,
    placeholder = "Nhập nội dung...",
    label,
    error,
    height = "400px",
    className = "",
    id = "editor-" + Math.random().toString(36).substr(2, 9),
    name,
    maxLength,
    readOnly = false,
    showWordCount = true,
    showCharCount = false,
    onFocus,
    onBlur,
}: RichTextEditorProps) => {
    const [charCount, setCharCount] = useState(0)
    const TINYMCE_API_KEY = import.meta.env.VITE_NEXT_PUBLIC_TINYMCE_API_KEY ?? 'yqe5lcxb3x7ttjhksx8x0pqq7bfwvkgnlp05pilrkpf7y7ny'
    const [wordCount, setWordCount] = useState(0)
    const [isFocused, setIsFocused] = useState(false)
    const editorRef = useRef<any>(null)

    useEffect(() => {
        if (value) {
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = value
            const textContent = tempDiv.textContent || tempDiv.innerText || ""
            setCharCount(textContent.length)

            const words = textContent.split(/\s+/).filter((word) => word.length > 0)
            setWordCount(words.length)
        } else {
            setCharCount(0)
            setWordCount(0)
        }
    }, [value])

    const handleChange = (content: string) => {
        if (maxLength) {
            const tempDiv = document.createElement("div")
            tempDiv.innerHTML = content
            const textContent = tempDiv.textContent || tempDiv.innerText || ""

            if (textContent.length <= maxLength) {
                onChange(content || "")
            }
        } else {
            onChange(content || "")
        }
    }

    const handleFocus = () => {
        setIsFocused(true)
        if (onFocus) onFocus()
    }

    const handleBlur = () => {
        setIsFocused(false)
        if (onBlur) onBlur()
    }

    // Font sizes matching the image (12pt is default)
    const fontSizes = [
        { title: "8pt", value: "8pt" },
        { title: "10pt", value: "10pt" },
        { title: "12pt", value: "12pt" },
        { title: "14pt", value: "14pt" },
        { title: "18pt", value: "18pt" },
        { title: "24pt", value: "24pt" },
        { title: "36pt", value: "36pt" },
    ]

    // Font families
    const fontFormats =
        'System Font=system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;' +
        "Arial=arial,helvetica,sans-serif;" +
        "Arial Black=arial black,avant garde;" +
        "Courier New=courier new,courier;" +
        "Georgia=georgia,palatino;" +
        "Helvetica=helvetica;" +
        "Times New Roman=times new roman,times;" +
        "Trebuchet MS=trebuchet ms,geneva;" +
        "Verdana=verdana,geneva;"

    return (
        <div className={cn("w-full", className)}>
            <Editor
                apiKey={TINYMCE_API_KEY}
                onInit={(evt, editor) => (editorRef.current = editor)}
                value={value || ""}
                onEditorChange={handleChange}
                init={{
                    height,
                    menubar: true,
                    statusbar: true,
                    plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "code",
                        "fullscreen",
                        "insertdatetime",
                        "media",
                        "table",
                        "help",
                        "wordcount",
                    ],
                    toolbar1:
                        "undo redo | paragraph | fontfamily | fontsize | bold italic underline strikethrough superscript subscript | link image table",
                    toolbar2: "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent",
                    font_size_formats: fontSizes.map((size) => size.value).join(" "),
                    font_family_formats: fontFormats,
                    content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
              font-size: 14px;
              margin: 12px;
            }
          `,
                    placeholder,
                    readonly: readOnly,
                    branding: false,
                    elementpath: false,
                    resize: false,
                    promotion: false,
                    setup: (editor) => {
                        editor.on("focus", handleFocus)
                        editor.on("blur", handleBlur)

                        // Add custom button for paragraph styles
                        editor.ui.registry.addMenuButton("paragraph", {
                            text: "Paragraph",
                            fetch: (callback) => {
                                const items = [
                                    {
                                        type: "menuitem",
                                        text: "Paragraph",
                                        onAction: () => editor.execCommand("FormatBlock", false, "p"),
                                    },
                                    {
                                        type: "menuitem",
                                        text: "Heading 1",
                                        onAction: () => editor.execCommand("FormatBlock", false, "h1"),
                                    },
                                    {
                                        type: "menuitem",
                                        text: "Heading 2",
                                        onAction: () => editor.execCommand("FormatBlock", false, "h2"),
                                    },
                                    {
                                        type: "menuitem",
                                        text: "Heading 3",
                                        onAction: () => editor.execCommand("FormatBlock", false, "h3"),
                                    },
                                    {
                                        type: "menuitem",
                                        text: "Heading 4",
                                        onAction: () => editor.execCommand("FormatBlock", false, "h4"),
                                    },
                                    {
                                        type: "menuitem",
                                        text: "Heading 5",
                                        onAction: () => editor.execCommand("FormatBlock", false, "h5"),
                                    },
                                    {
                                        type: "menuitem",
                                        text: "Heading 6",
                                        onAction: () => editor.execCommand("FormatBlock", false, "h6"),
                                    },
                                    {
                                        type: "menuitem",
                                        text: "Preformatted",
                                        onAction: () => editor.execCommand("FormatBlock", false, "pre"),
                                    },
                                ]
                                callback(items)
                            },
                        })

                        // Add custom button for font family
                        editor.ui.registry.addMenuButton("fontfamily", {
                            text: "System Font",
                            fetch: (callback) => {
                                const items = fontFormats
                                    .split(";")
                                    .filter(Boolean)
                                    .map((font) => {
                                        const [name, value] = font.split("=")
                                        return {
                                            type: "menuitem",
                                            text: name,
                                            onAction: () => editor.execCommand("FontName", false, value),
                                        }
                                    })
                                callback(items)
                            },
                        })

                        // Add custom button for font size
                        editor.ui.registry.addMenuButton("fontsize", {
                            text: "12pt",
                            fetch: (callback) => {
                                const items = fontSizes.map((size) => ({
                                    type: "menuitem",
                                    text: size.title,
                                    onAction: () => editor.execCommand("FontSize", false, size.value),
                                }))
                                callback(items)
                            },
                        })
                    },
                    menu: {
                        file: {
                            title: "File",
                            items: "newdocument restoredraft | preview | export print | deleteallconversations",
                        },
                        edit: { title: "Edit", items: "undo redo | cut copy paste pastetext | selectall | searchreplace" },
                        view: {
                            title: "View",
                            items: "code | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments",
                        },
                        insert: {
                            title: "Insert",
                            items:
                                "image link media addcomment pageembed template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime",
                        },
                        format: {
                            title: "Format",
                            items:
                                "bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat",
                        },
                        tools: { title: "Tools", items: "spellchecker spellcheckerlanguage | a11ycheck code wordcount" },
                        table: { title: "Table", items: "inserttable | cell row column | advtablesort | tableprops deletetable" },
                    },
                }}
                disabled={readOnly}
            />

            {/* Footer with stats */}
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                <div className="flex gap-3">
                    {showCharCount && maxLength && (
                        <div
                            className={cn(
                                "text-gray-500",
                                charCount > maxLength * 0.9 && "text-amber-600",
                                charCount >= maxLength && "text-red-600",
                            )}
                        >
                            {charCount}/{maxLength} ký tự
                        </div>
                    )}
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        </div>
    )
}

export const FormRichTextEditor = ({
    field,
    fieldState,
    label,
    placeholder,
    height,
    className,
    maxLength,
    readOnly,
    showWordCount,
    showCharCount,
}: {
    field: any
    fieldState: any
    label?: string
    placeholder?: string
    height?: string
    className?: string
    maxLength?: number
    readOnly?: boolean
    showWordCount?: boolean
    showCharCount?: boolean
}) => {
    return (
        <RichTextEditor
            value={field.value || ""}
            onChange={(value) => {
                field.onChange(value)
            }}
            placeholder={placeholder}
            label={label}
            error={fieldState.error?.message}
            height={height}
            className={className}
            id={field.name}
            name={field.name}
            maxLength={maxLength}
            readOnly={readOnly}
            showWordCount={showWordCount}
            showCharCount={showCharCount}
            onFocus={field.onFocus}
            onBlur={() => {
                field.onBlur()
            }}
        />
    )
}
