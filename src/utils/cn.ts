// Minimal class name joiner — avoids needing clsx as a dependency.
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
