// Configure your Browserify bundles here
//
// Each bundle config must be an object with two properties:
// 1. outputName:  (The filename for your bundle)
// 2. entries:     (An array containing the paths to the modules you want to include in your bundle)
//                 ('./' is relative to the '/js' directory)

module.exports = [
  {
    outputName: 'main.js',
    entries: [
      // views
      './views/home',
      './views/gbmf',

      // modules
      './modules/page'
    ]
  },
  // {
  //   outputName: '',
  //   entries: []
  // },
];
