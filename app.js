var path=require("path")
global.constVarPath=path.join(__dirname, "config/constVar");
var constVar=require(path.join(constVarPath));


var om=require(path.join(constVar.modelPath,"./system/optionModel"));

var debug=require("debug")("app"),
	express=require("express");
	expressInit=require(path.join(__dirname,"./expressInit.js"));
	app=express();

	om.getOptions(function(data){
		debug(data);
		var opObj={};

		data.forEach(function(ite){
			opObj[ite.name]=ite.val;
		});

		app.locals.systemOption=opObj;
		debug(app.locals.systemOption);

		expressInit(app);
		app.listen(3000,function(){
			console.log("game start listen:3000");
			console.log("http://localhost:3000");
		});
	});


