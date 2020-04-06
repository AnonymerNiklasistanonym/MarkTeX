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

export const promiseTimeout = <T = any>(promise: Promise<T>, milliseconds = 300): Promise<T> => {
    const timeout = new Promise<T>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            clearTimeout(timeoutId);
            reject(Error(`Timeout finished before promise was ready (${milliseconds}ms)`));
        }, milliseconds);
    });
    // Returns a race between our timeout and the passed in promise
    return Promise.race([ promise, timeout ]);
};
