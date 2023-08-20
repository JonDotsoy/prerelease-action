import { action } from "./lib/action";

type Ctx = { __: string[] } & { [k: string]: any };

type Handler = (ctx: Ctx, index: number, arg: string, args: string[]) => number;

type T = Map<
  (arg: string) => boolean,
  Handler
>;

const makeFlag = (
  args: string[],
  spec: T,
) => {
  const ctx: Ctx = { __: [] };
  let index = 0;
  const handlersMap = Array.from(spec);
  while (index < args.length) {
    const arg = args[index];
    const handler: Handler = handlersMap.find(([test]) =>
      test(args[index])
    )?.[1] ?? ((ctx, index, arg) => {
      ctx.__.push(arg);
      return index + 1;
    });
    index = handler(ctx, index, arg, args);
  }
  return ctx;
};

const spec: T = new Map();

const flagIs = (flag: string, ...alt: string[]) => (arg: string) =>
  [flag, ...alt].includes(arg);

const singleValue = (propName: string): Handler =>
(
  ctx,
  index,
  arg,
  args,
) => {
  ctx[propName] = args[index + 1];
  return index + 2;
};

spec.set(
  flagIs("--label_name_to_merge", "--labelNameToMerge", "-l"),
  singleValue("labelNameToMerge"),
);

spec.set(
  flagIs("--base_brach", "--baseBranch", "-b"),
  singleValue("baseBranch"),
);

spec.set(
  flagIs("--destination_brach", "--destinationBranch", "-d"),
  singleValue("destinationBranch"),
);

function missingArgument<T extends Ctx, F extends string>(
  ctx: T,
  flag: string,
) {
  if (!ctx[flag]) {
    throw new Error(`missing argument: --${flag}`);
  }
}

const main = async (args: string[]) => {
  const ctx = makeFlag(args, spec);

  missingArgument(ctx, `labelNameToMerge`);
  missingArgument(ctx, `baseBranch`);
  // missingArgument(ctx, `destinationBranch`);

  await action(ctx as any);
};

main(process.argv.slice(2)).catch((ex) => {
  console.error(ex);
  process.exitCode = process.exitCode ?? 1;
});
