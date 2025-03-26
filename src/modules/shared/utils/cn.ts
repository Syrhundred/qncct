import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...classes: ClassValue[]) => twMerge(clsx(...classes));

export function cno(
  ...objects: Record<string, ClassValue>[]
): Record<string, string> {
  return objects.reduce(
    (acc, obj) => {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          acc[key] = acc[key] ? cn(acc[key], obj[key]) : obj[key];
        }
      }
      return acc;
    },
    {} as Record<string, string>,
  ) as Record<string, string>;
}
