/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    bracketSameLine: true,
    trailingComma: "all",
    semi: true,
    endOfLine: "lf",
    arrowParens: "always",
    singleQuote: false,
    jsxSingleQuote: false,
    plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
