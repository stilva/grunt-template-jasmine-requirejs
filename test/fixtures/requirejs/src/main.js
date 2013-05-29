require.config({
  paths: {
    $   : [
            // "http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js",
            "vendor/library"
          ],
    _   : "vendor/library2.js"
  },
  config: {
    math: {
      description: "Math module"
    },
    sum: {
      description: "Sum module"
    }
  },
  shim: {
    nonRequireJsLib: {
      init: function () {
        return this.nonRequireJsLib.noConflict();
      }
    },
    nonRequireJsLib2: {
      init: function () {
        return this.nonRequireJsLib2.noConflict();
      }
    }
  }
});

require(['app'], function(app) {
  app.start();
});
