#!/usr/bin/env node
import { getInput, setFailed, setOutput } from "@actions/core";
import { inspect } from "node:util";
import { action } from "./lib/action";

const labelNameToMerge = getInput(
  "label_name_to_merge",
  {
    required: true,
    trimWhitespace: true,
  },
);

const baseBranch = getInput(
  "base_brach",
  {
    required: true,
    trimWhitespace: true,
  },
);

const destinationBranch = getInput(
  "destination_brach",
  {
    required: false,
    trimWhitespace: true,
  },
);

action({
  labelNameToMerge: labelNameToMerge,
  baseBranch: baseBranch,
  destinationBranch: destinationBranch
    ? destinationBranch
    : `pre-${baseBranch}`,
})
  .then((s) => {
    setOutput("changed", s.changed);
    setOutput("pr_name", s.prName);
  })
  .catch((ex) => {
    setOutput("changed", false);
    console.error(ex);
    setFailed(
      typeof ex === "string"
        ? ex
        : ex instanceof Error
        ? ex.message
        : inspect(ex),
    );
  });
