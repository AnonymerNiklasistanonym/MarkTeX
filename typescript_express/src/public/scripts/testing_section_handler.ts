export enum SectionType {
    MARKDOWN = 1,
    LATEX = 2
}

export interface Section {
    type: SectionType
    content: string
}
