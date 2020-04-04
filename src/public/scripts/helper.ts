export const getMetaInformation = (metaName: string): string|undefined => {
    for (const meta of document.getElementsByTagName("meta")) {
        if (meta.getAttribute("name") && meta.getAttribute("name") === metaName) {
            const content = meta.getAttribute("content");
            if (content) {
                return content;
            }
        }
    }
};

export const stringToNumberSafe = (numberString: string|undefined): number|undefined => {
    const possibleNumber = Number(numberString);
    if (!isNaN(possibleNumber)) {
        return possibleNumber;
    }
};
