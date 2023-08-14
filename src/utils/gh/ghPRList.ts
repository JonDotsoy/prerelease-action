import { exec } from "@actions/exec";
import { PR } from "../../types/PR";

export const ghPRList = async <K extends keyof PR>(
  keys: K[]
): Promise<Pick<PR, K>[]> => {
  let prsBuff = new Uint8Array([]);

  await exec(
    "gh",
    [
      "pr",
      "list",
      "--json",
      keys.join(","),
    ],
    {
      listeners: {
        stdout(data) {
          prsBuff = new Uint8Array([...prsBuff, ...data]);
        },
      },
    }
  );

  return JSON.parse(new TextDecoder().decode(prsBuff));
};
