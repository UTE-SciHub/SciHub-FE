import { useState } from "react"
import { TagsInput } from "react-tag-input-component"
import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

interface KeywordsInputProps<TFieldValues extends FieldValues> {
    form: UseFormReturn<TFieldValues>
    field: {
        value: string[] | undefined
        onChange: (value: string[] | undefined) => void
        name: FieldPath<TFieldValues>
    }
    placeholder?: string
    label?: string
    description?: string
    required?: boolean
    readOnly?: boolean
}

export default function KeywordsInput<TFieldValues extends FieldValues>({
    form,
    field,
    placeholder = "Nhập từ khóa",
    label = "Từ khóa",
    description = "Các từ khóa liên quan đến đề tài",
    required = false,
    readOnly = false,
}: KeywordsInputProps<TFieldValues>) {
    const [tags, setTags] = useState<string[]>(field.value || [])

    const handleChange = (newTags: string[]) => {
        if (!readOnly) {
            setTags(newTags)
            field.onChange(newTags.length > 0 ? newTags : undefined)
        }
    }

    return (
        <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
                <div className={readOnly ? "pointer-events-none select-none opacity-100" : ""}>
                    <TagsInput
                        value={tags}
                        onChange={handleChange}
                        placeHolder={readOnly ? "" : placeholder}
                        separators={[",", "Enter"]}
                        classNames={{
                            tag: "bg-gray-100 text-gray-800 text-sm font-medium px-2 py-0.5 rounded border border-gray-300",
                            input: readOnly ? "hidden" : "text-sm p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
                        }}
                    />
                </div>
            </FormControl>
            <FormMessage />
        </FormItem>
    )
}
