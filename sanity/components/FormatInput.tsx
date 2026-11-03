import { useFormValue, type StringInputProps } from "sanity";
import { FORMATS_BY_COLUMN } from "../lib/formats";

/** The article's Format choices, narrowed to its column's formats (sanity/lib/formats.ts). */
export function FormatInput(props: StringInputProps) {
  const category = useFormValue(["category"]) as string | undefined;
  const list = FORMATS_BY_COLUMN[category ?? ""] ?? [];
  return props.renderDefault({ ...props, schemaType: { ...props.schemaType, options: { ...props.schemaType.options, list, layout: "radio" } } });
}
