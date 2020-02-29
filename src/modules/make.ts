export interface MakeInput {
    definitions: MakeInputDefinition[]
    jobs: MakeInputJob[]
};

export interface MakeInputDefinition {
    name: string
    value: string
};

export interface MakeInputJob {
    name: string
    default?: boolean
    dependencies?: string[]
    commands: string[]
};

export const createMakefileVersion = "1.0.0";

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
