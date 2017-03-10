var path=require("path"),
	express=require("express"),
	router=express.Router(),
	debug=require("debug")("routerAll"),
	constVar=require(constVarPath),
	until=require(path.join(constVar.untilPath,"./until")),
	stateCode=require(path.join(constVar.configPath,"./stateCode"));
	adminRouter=require("./admin"),
	indexRouter=require("./index");

	router.use("/",indexRouter);

	router.use("/admin",adminRouter)



module.exports=exports=router;