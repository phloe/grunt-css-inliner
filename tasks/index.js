"use strict";

module.exports = function (grunt) {
	var fs = require("fs"),
		path = require("path"),
		exec = require("child_process").exec,
		async = require("async"),
		phantomjs = require("phantomjs").path;
	
	grunt.registerTask("css-inliner", "", function () {
		
		var done = this.async(),
			options = this.options({}),
			inlineOptions = options.options || {},
			_inlineOptions = [],
			tasks = []; 
	
		for (var key in inlineOptions) {
			if (inlineOptions[key] === true) {
				_inlineOptions.push(key);
			}
			else {
				_inlineOptions.push(key, inlineOptions[key]);
			}
		}

		tasks = options.files.map(function (file) {
			return function (callback) {
				inline(file, _inlineOptions, callback);
			}
			
		});
		
		async.series(tasks, function (err) {
			if (err) {
				console.error(err);
			}
			console.log("Done.");
			done();
		});
		
	});
	
	function inline (file, options, callback) {
		var script = path.join(__dirname, "../lib/index.js"),
			args = [phantomjs, script, file].concat(options).join(" ");
		
		var pjs = exec(args, function (error, stdout, stderr) {
			if (error) {
				console.error("Error", error);
			}
			else if (stderr) {
				console.error("Stderr", stderr);
			}
			else if (stdout) {
				fs.writeFileSync(file, stdout);
			}
			callback(null);
		});
	}
	
};