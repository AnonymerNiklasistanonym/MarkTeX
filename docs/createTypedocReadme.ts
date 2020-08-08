import { promises as fs } from "fs";
import path from "path";

export const createTypedocReadme = async (): Promise<void> => {

    // Create build directory if not existing
    const distDir = path.join(__dirname, "dist");
    await fs.mkdir(distDir, { recursive: true });

    // Copy top level README into it
    const finalReadmePath = path.join(distDir, "README.md");
    await fs.copyFile(path.join(__dirname, "typedocReadme.md"), finalReadmePath);

    // Append extra data to typedoc README
    const dataReadme = await fs.readFile(path.join(__dirname, "..", "README.md"), { encoding: "utf-8" });
    await fs.appendFile(finalReadmePath, "\n" + dataReadme.replace(/^#/g, "##"));
    const dataTodo = await fs.readFile(path.join(distDir, "todos.md"), { encoding: "utf-8" });
    await fs.appendFile(finalReadmePath, "\n" + dataTodo.replace(/^#/g, "##"));
};
