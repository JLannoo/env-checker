export function schemaIsZodIsh(schema: any) {
	const zodProps = ["safeParse", "parse", "_cached", "_def"];
	return zodProps.every(prop => prop in schema);
}
