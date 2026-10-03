import { revalidatePath } from "next/cache";

// Every cached page carries the root "/layout" tag. Route-pattern paths like
// "/[locale]" never match here because cache tags include the "(site)" route
// group, so after any dashboard edit we refresh from the root. The catalog is
// small, so regenerating all pages on next visit is cheap.
export function revalidateEverything() {
  revalidatePath("/", "layout");
}
