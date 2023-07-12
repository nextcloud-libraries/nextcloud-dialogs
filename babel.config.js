export default {
    presets: [
        "@babel/typescript",
        [
            "@babel/env",
            {
                useBuiltIns: false,
            },
        ],
    ],
    "plugins": [
        "transform-class-properties",
    ],
};
