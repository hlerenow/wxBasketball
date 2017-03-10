var path=require("path");
var constVar={
	stateCodePath:path.join(__dirname, "./stateCode.js"),
	viewPath:path.join(__dirname,"../view"),
	publicPath:path.join(__dirname,"../public"),
	modelPath:path.join(__dirname,"../model"),
	routerPath:path.join(__dirname,"../router"),
	rootPath:path.join(__dirname,"../"),
	untilPath:path.join(__dirname,"../until"),
	configPath:path.join(__dirname)
}

module.exports=exports=constVar;