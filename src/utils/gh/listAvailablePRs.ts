import { ghPRList } from "./ghPRList";

export const listAvailablePRs = async (labelToFilter: string) => {
  let prs = await ghPRList([
    "headRefName",
    "state",
    "id",
    "title",
    "number",
    "labels",
    "headRefOid",
  ]);

  return prs.filter((pr) =>
    pr.labels.some((label) => label.name === labelToFilter)
  ).sort((a, b) => a.number - b.number);
};
