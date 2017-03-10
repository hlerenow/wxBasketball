var gulp = require("gulp");
var nodemon = require("gulp-nodemon");
var path = require("path");
var opn=require("opn");

gulp.task("nodemon",function(){
	return nodemon({
		script:"app",
		ext:"js",
		ignore:["view/*","public/*"],
		watch:"./"
	}).on("start",function(){
		console.log("nodemon start ");
	});
});

gulp.task("default",["nodemon"],function(){
	console.log("打开浏览器");
	setTimeout(function(){
		opn("http://localhost:3000");
	}, 1000);
});