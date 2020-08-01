const saveAsGeneral = (buffer: (Uint8Array|string), contentType: string, filename: string): void => {
    const domElement = window.document.createElement("a");
    domElement.href = window.URL.createObjectURL(new Blob([buffer], {
        type: contentType
    }));
    domElement.download = filename;
    window.document.body.appendChild(domElement);
    domElement.click();
    window.document.body.removeChild(domElement);
};

interface InternalBufferFix extends Buffer {
    data: Iterable<number>
}

export const saveAsBinary = (buffer: Buffer, contentType: string, filename: string): void => {
    // The data accessor is when logged available but Typescript has bug and reports error
    // => Frontend Buffer is different to Backend?????
    const byteArray = new Uint8Array((buffer as InternalBufferFix).data);
    saveAsGeneral(byteArray, contentType, filename);
};

export const saveAsPlainText = (content: string, contentType: string, filename: string): void => {
    saveAsGeneral(content, contentType, filename);
};
