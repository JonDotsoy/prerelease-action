import { PR } from "../../types/PR";

export const makeListStringHistory = <
  T extends Pick<PR, "number">,
>(
  prs: T[],
): string => prs.map((pr) => `${pr.number}\n`).join("");
