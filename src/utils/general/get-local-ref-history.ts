import { debug } from "@actions/core";
import { exec } from "@actions/exec";
import { existsSync } from "fs";
import { REF_HISTORY_NAME } from "../common/ref-history-name";
import { readFile, writeFile } from "fs/promises";

export const setLocalRefHistory = async (
  payloadRefHistory: string,
) => {
  debug(`Write ${REF_HISTORY_NAME} file`);
  await writeFile(REF_HISTORY_NAME, payloadRefHistory);
  await exec("git", ["add", REF_HISTORY_NAME]);
  await exec("git", ["commit", "-m", `chore: add ${REF_HISTORY_NAME}`]);
};

export const getLocalRefHistory = async (
  destinationBranch: string,
  backBranch: string,
): Promise<string | null> => {
  // Verify changes
  const codeStatus = await exec("git", ["switch", destinationBranch], {
    ignoreReturnCode: true,
  });

  if (codeStatus === 0) {
    if (existsSync(REF_HISTORY_NAME)) {
      debug(`Found ${REF_HISTORY_NAME} file`);
      const payload = await readFile(REF_HISTORY_NAME, "utf-8");
      await exec("git", ["switch", backBranch]);
      return payload;
    }
  }

  await exec("git", ["switch", backBranch]);

  return null;
};
