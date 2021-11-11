const CracoLessPlugin = require('craco-less');

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              '@primary-color': '#77216F',
              '@text-color': '#1B0E19',
              '@text-color-secondary': '#728096',
              '@font-size-base': '16px',
              '@border-radius-base': '0.25rem'
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};