
"use strict";

var template = __dirname + '/templates/jasmine-requirejs.html',
    requirejs  = {
      '2.0.0' : __dirname + '/../vendor/require-2.0.0.js',
      '2.0.1' : __dirname + '/../vendor/require-2.0.1.js',
      '2.0.2' : __dirname + '/../vendor/require-2.0.2.js',
      '2.0.3' : __dirname + '/../vendor/require-2.0.3.js',
      '2.0.4' : __dirname + '/../vendor/require-2.0.4.js',
      '2.0.5' : __dirname + '/../vendor/require-2.0.5.js',
      '2.0.6' : __dirname + '/../vendor/require-2.0.6.js',
      '2.1.0' : __dirname + '/../vendor/require-2.1.0.js',
      '2.1.1' : __dirname + '/../vendor/require-2.1.1.js',
      '2.1.2' : __dirname + '/../vendor/require-2.1.2.js',
      '2.1.3' : __dirname + '/../vendor/require-2.1.3.js',
      '2.1.4' : __dirname + '/../vendor/require-2.1.4.js',
      '2.1.5' : __dirname + '/../vendor/require-2.1.5.js'
    },
    path = require('path'),
    parse = require('./lib/parse');

function filterGlobPatterns(scripts) {
  Object.keys(scripts).forEach(function (group) {
    if (Array.isArray(scripts[group])) {
      scripts[group] = scripts[group].filter(function(script) {
        return script.indexOf('*') === -1;
      });
    } else {
      scripts[group] = [];
    }
  });
}

exports.process = function(grunt, task, context) {

  var version = context.options.version;

  // find the latest version if none given
  if (!version) {
    version = Object.keys(requirejs).sort().pop();
  }

  // Remove glob patterns from scripts (see https://github.com/gruntjs/grunt-contrib-jasmine/issues/42)
  filterGlobPatterns(context.scripts);

  // Extract config from main require config file
  if (context.options.requireConfigFile) {
    // Remove mainConfigFile from src files
    var normalizedConfigFile = path.normalize(context.options.requireConfigFile);

    context.scripts.src = grunt.util._.reject(context.scripts.src, function (script) {
      return path.normalize(script) === normalizedConfigFile;
    });

    context.options.mainRequireConfig = parse.findConfig(grunt.file.read(context.options.requireConfigFile)).config;
  }

  // Removes .js from the requireConfig.
  for(var el in context.options.mainRequireConfig.paths) {
    if(typeof context.options.mainRequireConfig.paths[el] === "string") {
      context.options.mainRequireConfig.paths[el] = context.options.mainRequireConfig.paths[el].replace(/\.js$/,"");
    } else {
      for(var i = 0, l = context.options.mainRequireConfig.paths[el].length; i<l; i++) {
        context.options.mainRequireConfig.paths[el][i] = context.options.mainRequireConfig.paths[el][i].replace(/\.js$/,"");
      }
    }
  }

  // Remove baseUrl and .js from src files
  var cleanPath,
      tmpPath,
      pathArray = Object.keys(context.options.mainRequireConfig.paths),
      baseUrl = (context.options.requireConfig && context.options.requireConfig.baseUrl || '/');

  context.scripts.src.forEach(function(script, i){
    script = script.replace(new RegExp('^' + baseUrl),"");
    cleanPath = script.replace(/\.js$/,"");

    for(var j = 0, pathLen = pathArray.length; j<pathLen; j++) {

      tmpPath = context.options.mainRequireConfig.paths[pathArray[j]];

      if(typeof tmpPath === "string") {
        tmpPath = [tmpPath];
      }

      for(var k = 0, l = tmpPath.length; k < l; k++) {
        if(cleanPath === tmpPath[k]) {
          context.scripts.src[i] = pathArray[j];
          return;
        }
      }


      context.scripts.src[i] = cleanPath;
    }
  });

  // Prepend loaderPlugins to the appropriate files
  if (context.options.loaderPlugin) {
    Object.keys(context.options.loaderPlugin).forEach(function(type){
      if (context[type]) {
        context[type].forEach(function(file,i){
          context[type][i] = context.options.loaderPlugin[type] + '!' + file;
        });
      }
    });
  }

  if (!(version in requirejs)) {
      throw new Error('specified requirejs version [' + version + '] is not defined');
  } else {
      task.copyTempFile(requirejs[version],'require.js');
  }

  context.serializeRequireConfig = function(requireConfig) {
      var funcCounter = 0;
      var funcs = {};

      function generateFunctionId() {
          return '$template-jasmine-require_' + new Date().getTime() + '_' + (++funcCounter);
      }

      var jsonString = JSON.stringify(requireConfig, function(key, val) {
          var funcId;
          if (typeof val === 'function') {
              funcId = generateFunctionId();
              funcs[funcId] = val;
              return funcId;
          }
          return val;
      }, 2);

      Object.keys(funcs).forEach(function(id) {
          jsonString = jsonString.replace('"' + id + '"', funcs[id].toString());
      });

      return jsonString;
  };

  var source = grunt.file.read(template);
  return grunt.util._.template(source, context);
};

