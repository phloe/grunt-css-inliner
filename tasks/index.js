"use strict";

module.exports = function (grunt) {
	var fs = require("fs"),
		path = require("path"),
		exec = require("child_process").exec,
		spawn = require("child_process").spawn,
		async = require("async"),
		phantomjs = require("phantomjs").path;
	
	grunt.registerTask("css-inliner", "", function () {
		
		var done = this.async(),
			options = this.options(),
			files = grunt.config(this.name).files, 
			inlineOptions = grunt.config(this.name).options || {},
			_inlineOptions = [], value,
			tasks = [];
	
		for (var key in inlineOptions) {
			if (inlineOptions[key] === true) {
				_inlineOptions.push(key);
			}
			else {
				value = inlineOptions[key];
				switch (key) {
					case "-r":
					case "--required-selectors":
						if (value.indexOf(" ") > -1) {
							value = JSON.stringify(value);
						}
						break;
			
					case "-s":
					case "--strip-resources":
						if (typeof value == "string") {
							value = [value];
						}
						value = escapeReg(JSON.stringify(value).replace(/"/g, "\\\""));
						break;
					
				}
				_inlineOptions.push(key, value);
			}
		}
		
		tasks = files.map(function (file) {
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
	
	function escapeReg (str){
		return str.replace(/\\\\([.*+?=^!:${}()|[\]\/\\])/g, '\\\\\\\\$1');
	};
	
	function inline (file, options, callback) {
		var script = path.join(__dirname, "../lib/dr-css-inliner/index.js"),
			args = [phantomjs, script, file].concat(options).join(" ");
		
		console.log("Inlining CSS in " + file + "...");
		
		var pjs = exec(args, function (error, stdout, stderr) {
			if (error) {
				grunt.log.error("Error", error);
			}
			else if (stderr) {
				grunt.log.error("Stderr", stderr);
			}
			else if (stdout) {
				fs.writeFileSync(file, stdout);
			}
			callback(null);
		});
		
	}
	
};