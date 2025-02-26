module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": ["eslint:recommended", "plugin:react/recommended"],
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "plugins": ["react"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off",
    "eqeqeq": "error",
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  },

  "ignorePatterns":  ["temp.js", "config/*"],
};

