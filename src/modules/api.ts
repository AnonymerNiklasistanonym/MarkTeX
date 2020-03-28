import * as account from "./api/accountManager";
export { account };
import * as content from "./api/contentManager";
export { content };
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
