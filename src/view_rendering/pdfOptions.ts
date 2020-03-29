
export interface PdfOption {
    attribute?: (string|number)
    label?: string
    labelAfter?: boolean
    labelBefore?: boolean
    name: string
    type: "checkbox" | "text" | "number"
    value?: (string|number)
}
