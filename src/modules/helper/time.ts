export const sleep = async (millisec: number): Promise<void> => new Promise(resolve => setTimeout(resolve, millisec));
