import { debuglog } from "util";


const debug = debuglog("app-latex-request-cache");


/**
 * The data for a latex cache entry.
 */
interface LatexRequestCacheInput {
    svgData: string
}

/**
 * The internal structure for latex cache entries.
 */
interface Latex2SvgCacheEntry extends LatexRequestCacheInput {
    /** The date when the entry was added to the cache. */
    date: Date
}

/** The latex cache. */
const latex2SvgCache = new Map<string,Latex2SvgCacheEntry>();
/** The maximum number of cache entries. */
const latex2SvgCacheMaxSize = 150;

/**
 * Add element to cache.
 *
 * @param latexStringKey The hash of the latex string.
 * @param newEntry A new latex entry that should be cached.
 */
// eslint-disable-next-line complexity
export const add = (latexStringKey: string, newEntry: LatexRequestCacheInput): void => {
    debug(`Add entry to cache (id=${latexStringKey})`);
    // Add it to the cache
    latex2SvgCache.set(latexStringKey, { ... newEntry, date: new Date() });
    // If cache reaches a specific size, remove older items
    if (latex2SvgCache.size > latex2SvgCacheMaxSize) {
        let oldestCacheEntry;
        for (const [ key, value ] of latex2SvgCache.entries()) {
            if (oldestCacheEntry) {
                if (oldestCacheEntry.date > value.date) {
                    oldestCacheEntry = { date: value.date, id: key };
                }
            } else {
                oldestCacheEntry = { date: value.date, id: key };
            }
        }
        // Remove oldest cache entry
        if (oldestCacheEntry) {
            latex2SvgCache.delete(oldestCacheEntry.id);
            debug(`Remove oldest entry (n=${latex2SvgCacheMaxSize}) from cache: ${oldestCacheEntry.id}`);
        }
    }
};

/**
 * Get element from cache.
 *
 * @param latexStringKey The hash of the latex string.
 * @returns Either undefined if no element was found in cache or the cached element.
 */
export const get = (latexStringKey: string): LatexRequestCacheInput | undefined => {
    debug(`Get entry from cache (id=${latexStringKey})`);
    const possibleEntry = latex2SvgCache.get(latexStringKey);
    if (possibleEntry) {
        debug(`Found compiled version in the cache (id=${latexStringKey})`);
        // Overwrite entry with same data but new date
        add(latexStringKey, { svgData: possibleEntry.svgData });
        // Return data
        return { svgData: possibleEntry.svgData };
    }
};
