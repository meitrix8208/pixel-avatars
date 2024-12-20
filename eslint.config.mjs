import antfu from "@antfu/eslint-config";

export default antfu({
  stylistic: {
    indent: 2,
    quotes: "double",
    semi: true,
  },
  rules: {
    "antfu/no-top-level-await": "off",
    "no-console": "off",
  },
});
