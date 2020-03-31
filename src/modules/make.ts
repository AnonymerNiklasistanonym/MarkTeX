export interface MakeInput {
    /** @example ARGS_DEFINITION="some value" */
    definitions: MakeInputDefinition[]
    /**
     * @example
     * all: defaultJob
     *
     * job: dependency
     *      commands
     */
    jobs: MakeInputJob[]
};

/** @example name=value */
export interface MakeInputDefinition {
    name: string
    value: string
};

/**
 * @example
 * all: nameIfDefaultOptional
 *
 * name: optionalDependency1 optionalDependency2
 *      command1
 *      command2
 */
export interface MakeInputJob {
    name: string
    default?: boolean
    dependencies?: string[]
    commands: string[]
};

export const createMakefileVersion = "1.0.0";

/**
 * Create Makefile content.
 *
 * @param input Makefile options
 * @returns Makefile content string
 */
export const createMakefile = (input: MakeInput): string => {
    // Add definitions
    return input.definitions
        .reduce((definitionString, definition) => `${definitionString}${definition.name} = ${definition.value}\n`,
            `# Auto generated Makefile v${createMakefileVersion}\n`)
    // Add default jobs
     + input.jobs
         .filter(job => job.default !== undefined && job.default)
         .reduce((defaultString, job) => `${defaultString} ${job.name}`, "\nall:")
     // Add jobs
     + input.jobs
         .reduce((jobString, job) => `${jobString}\n${job.name}:${
             job.dependencies !== undefined ? ` ${job.dependencies.join(" ")}` : ""
         }\n${
             job.commands.reduce((commandString, command) => `${commandString}\t${command}\n`, "")
         }`, "\n");
};
