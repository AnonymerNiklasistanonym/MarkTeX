interface HbsLayoutErrorLink {
    link: string
    text: string
};

export interface HbsLayoutError {
    error: HbsLayoutErrorError
    production?: boolean
};

interface HbsLayoutErrorError {
    status: number
    message: string
    stack?: string
    explanation?: string
    links?: HbsLayoutErrorLink[]
};
