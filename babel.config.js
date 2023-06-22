export default {
    presets: [
        "@babel/typescript",
        [
            "@babel/env",
            {
                useBuiltIns: "usage",
                corejs: "3",
            },
        ],
    ],
    "plugins": [
        "transform-class-properties",
    ],
};
