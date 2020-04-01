import * as database from "./api/databaseManager";
export { database };
import * as latex from "./api/latexManager";
export { latex };
import * as pandoc from "./api/pandocManager";
export { pandoc };

export default {
    database,
    latex,
    pandoc
};
