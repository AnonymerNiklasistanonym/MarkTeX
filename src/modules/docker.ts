export interface DockerInput {
    image: string
    workdir: string
    commands: string[]
    entrypoint: string[]
    cmd: string[]
};

export const createDockerfileVersion = "1.0.0";

export const createDockerfile = (input: DockerInput): string => {
    return `# Auto generated Dockerfile v${createDockerfileVersion}\n\n`
      + `FROM ${input.image}\n`
      + `WORKDIR ${input.workdir}\n`
      + input.commands.reduce((commandStr, command) => `${commandStr}${command}\n`, "\n")
      + "\n"
      + `ENTRYPOINT [${input.entrypoint.reduce((entryPointStr, command) => `${entryPointStr} "${command}"`, "")} ]\n`
      + `CMD [${input.cmd.reduce((cmdStr, command) => `${cmdStr} "${command}"`, "")} ]\n`;
};
