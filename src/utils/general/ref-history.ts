import { PR } from "../../types/PR";

export const makeListStringHistory = <
  T extends Pick<PR, "number" | "headRefOid">,
>(
  mainHeadRefOid: string,
  prs: T[],
): string =>
  [`${mainHeadRefOid}\n`, ...prs.map((pr) => `${pr.number} ${pr.headRefOid}\n`)]
    .join("");
