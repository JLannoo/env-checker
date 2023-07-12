# Environment Variables Checker

- [Description](#description)
- [Usage](#usage)
- [Options](#options)

## Description
It's a simple script to check if the environment variables are set and correspond to the expected values or types.

The types and/or values of the environment variables are defined in a schema. You can use it along [Zod](https://zod.dev/) for validations or just with a Vanilla JS Object.

## Usage
First, you need to initialize the checker with the schema and the environment variables.

```bash
npx env-var-check init
```
Or, if you want to use it with Zod:
```bash
npx env-var-check init --zod
```

This will generate a `/env` folder containing a `schema.mjs` file and a `env.d.ts` file to use with Typescript. (You will need to include the `/env` folder in your `tsconfig.json` file)

Then, you can run the checker:
```bash
npx env-var-check
```

You might want to add it to `package.json` and do something like this to check the environment variables before running the app:
```json
{
  "scripts": {
    "predev": "env-var-check check",
    "prestart": "env-var-check check",
    "dev": "...",
    "start": "..."
  }
}
```

## Options
- `--zod`: Initialize the schema with Zod objects instead of Vanilla JS Objects
