import { exec } from "@actions/exec";

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
