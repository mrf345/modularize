// babel.config.js
module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            node: 'current',
            ie: 11,
            chrome: 41,
            edge: 12,
            firefox: 44,
            opera: 17,
            safari: 10,
          },
        },
      ],
    ],
};
