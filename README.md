# Environment Variables Checker

- [Description](#description)
- [Usage](#usage)
- [Options](#options)
- [TODO](#todo)

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
npx env-var-check check 
```
Or your schema is using Zod:
```bash
npx env-var-check check --zod
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
### `init`
- `--zod`: Initialize the schema with Zod objects instead of Vanilla JS Objects

### `check`
- `--zod`: Use Zod to validate the environment variables
- `--env`: Specify the path to the environment variables file (default: `.env`)
- `--schema`: Specify the path to the schema file (default: `./env/schema.mjs`)

## TODO
- [ ] Add tests
- [ ] Add more options
- [x] Implement the `--schema` option to specify a custom schema file path
- [ ] Add more examples