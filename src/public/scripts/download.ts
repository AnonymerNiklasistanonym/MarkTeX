export const saveAsBinary = (buffer: Buffer, contentType: string, filename: string): void => {
    const c = window.document.createElement("a");
    // Dumb fix because buffers are in frontend different to the backend?????
    const byteArray = new Uint8Array(JSON.parse(JSON.stringify(buffer)).data);
    c.href = window.URL.createObjectURL(new Blob([byteArray], {
        type: contentType
    }));
    c.download = filename;
    window.document.body.appendChild(c);
    c.click();
    window.document.body.removeChild(c);
};
