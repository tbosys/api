module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  globals: {
    rootRequire: false,
    describe: false,
    it: false,
    before: false,
    rootExists: false,
    requireSchema: false,
    requireAction: false,
    actionExists: false
  },
  rules: {
    indent: ["error", 2],
    quotes: ["error", "double"],
    semi: ["error", "always"]
  }
};
