export const saveAsBinary = (buffer: Buffer, contentType: string, filename: string): void => {
    const c = window.document.createElement("a");
    // The data accessor is when logged available but Typescript has bug and reports error
    // => Frontend Buffer is different to Backend?????
    const byteArray = new Uint8Array((buffer as any).data);
    c.href = window.URL.createObjectURL(new Blob([byteArray], {
        type: contentType
    }));
    c.download = filename;
    window.document.body.appendChild(c);
    c.click();
    window.document.body.removeChild(c);
    console.error(buffer.values());
    console.error(buffer.buffer);
};
