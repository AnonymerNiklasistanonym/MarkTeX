export const writeHelloWorld = (): void => {
    const words: string[] = ["Hello", "World"];
    for (const word of words) {
        // eslint-disable-next-line no-console
        console.log(word);
    }
};
