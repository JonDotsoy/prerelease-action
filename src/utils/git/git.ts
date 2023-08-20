import { ExecOptions, exec } from "@actions/exec";

export const git = async (...args: string[]) => {
  let out = new Uint8Array();

  const exitCode = await exec("git", args, {
    listeners: {
      stdout: (b) => out = new Uint8Array([...out, ...b]),
    },
    ignoreReturnCode: true,
  });

  if (exitCode) throw new Error(new TextDecoder().decode(out));
};

git.setConfig = (path: string, value: string) =>
  exec("git", ["config", path, value]);

git.switchOnly = async (branchName: string, options?: ExecOptions) =>
  await exec("git", ["switch", branchName], options);

git.switch = async (branchName: string, branchBase: string) => {
  const firstIntentCodeStatus = await exec("git", [
    "switch",
    "-c",
    branchName,
    branchBase,
  ], { ignoreReturnCode: true });

  if (firstIntentCodeStatus === 0) return 0;
  if (firstIntentCodeStatus === 128) {
    await git.switchOnly(branchName);
    return;
  }

  throw new Error(`Failed switch branch exist code ${firstIntentCodeStatus}`);
};
