import * as yaml from "js-yaml";
import { debuglog } from "util";


const debug = debuglog("app-pandoc-config-yml");

// TODO Add the other options too: https://pandoc.org/MANUAL.html#default-files

export interface PandocConfigYmlInput {
    /** @example markdown+emoji */
    from?: string
    /** @example html5 */
    to?: string
    /** leave blank for output to stdout */
    outputFile?: string
    /** leave blank for input from stdin */
    inputFiles?: string[]
    /** @example letter */
    template?: string
    standalone?: boolean
    selfContained?: boolean
    /**
     * @example
     * documentclass: book
     * classoption:
     * - twosides
     * - draft
     */
    variables?: PandocConfigYmlInputVariable[]

    metadata?: PandocConfigYmlInputMetadata
    /**
     * @example
     * - boilerplate.yaml
     */
    metadataFiles?: string[]
    verbosity?: PandocConfigYmlInputVerbosity
    /** @example log.json */
    logFile?: string
    /** @example pdflatex */
    pdfEngine?: string
    /** @example -shell-escape */
    pdfEngineOptions?: string[]
    toc?: boolean
    /** @example 2 */
    tocDepth?: number
    stripComments?: boolean

}

export interface PandocConfigYmlInputVariable {
    name: string
    value?: PandocConfigYmlInputVariable[]
}

export interface PandocConfigYmlInputMetadata {
    authors?: string[]
    title?: string
    date?: string
    more?: PandocConfigYmlInputMetadataMore[]
}

export interface PandocConfigYmlInputMetadataMore {
    name: string
    value?: PandocConfigYmlInputMetadataMore[]
}

export enum PandocConfigYmlInputVerbosity {
    error = 1,
    warning = 2,
    info = 3
}

export const createPandocConfigFileVersion = "1.0.0";

// eslint-disable-next-line complexity
export const createPandocConfigFile = (input: PandocConfigYmlInput): string => {
    debug(`createPandocConfigFile ${JSON.stringify(input)}`);
    const configObject: any = {};
    if (input.from) {
        configObject.from = input.from;
    }
    if (input.to) {
        configObject.to = input.to;
    }
    if (input.outputFile) {
        configObject["output-file"] = input.outputFile;
    }
    if (input.inputFiles) {
        configObject["input-files"] = input.inputFiles;
    }
    if (input.variables) {
        const reduceVariable = (variable: PandocConfigYmlInputVariable, parentObject: any = {}): any => {
            if (variable.value && variable.value.length > 0) {
                if (variable.value.length === 1) {
                    parentObject[variable.name] = reduceVariable(variable.value[0]);
                } else {
                    // TODO: Differentiate between options and lists if necessary
                    parentObject[variable.name] = variable.value.map(value => reduceVariable(value));
                }
            } else {
                return variable.name;
            }
            return parentObject;
        };
        try {
            configObject.variables = input.variables.reduce((finalVariableObject: any, variable) =>
                reduceVariable(variable, finalVariableObject), {});
        } catch (e) {
            throw Error(`Problem parsing variables for pandoc config file (input=${
                JSON.stringify(input.variables)
            },originalError=${JSON.stringify(e)})`);
        }
    }
    if (input.metadata) {
        const metadataObject: any = {};
        if (input.metadata.authors) {
            metadataObject.author = input.metadata.authors;
        }
        if (input.metadata.title) {
            metadataObject.title = input.metadata.title;
        }
        if (input.metadata.date) {
            metadataObject.date = input.metadata.date;
        }
        configObject.metadata = metadataObject;
    }
    if (input.pdfEngine) {
        configObject["pdf-engine"] = input.pdfEngine;
    }
    if (input.pdfEngineOptions) {
        configObject["pdf-engine-opts"] = input.pdfEngineOptions;
    }
    if (input.toc !== undefined) {
        configObject.toc = input.toc;
    }
    if (input.tocDepth !== undefined) {
        configObject["toc-depth"] = input.tocDepth;
    }
    if (input.verbosity) {
        switch (input.verbosity) {
            case PandocConfigYmlInputVerbosity.error:
                configObject.verbosity = "ERROR";
                break;
            case PandocConfigYmlInputVerbosity.info:
                configObject.verbosity = "INFO";
                break;
            case PandocConfigYmlInputVerbosity.warning:
                configObject.verbosity = "WARNING";
                break;
        };
    }
    return yaml.dump(configObject);
};
