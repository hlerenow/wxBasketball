var path=require("path"),
	express=require("express"),
	debug=require("debug")("adminRouter"),
	constVar=require(constVarPath),
	until=require(path.join(constVar.untilPath,"./until")),
	stateCode=require(path.join(constVar.configPath,"./stateCode"));

	var adminRouter=express.Router();
	var opm=require(path.join(constVar.modelPath,"./system/optionModel"));

/**
 * 管理员认证
 * @param  {[type]} req                                              [description]
 * @param  {[type]} res                                              [description]
 * @param  {[type]} next){		debug(req.body);		if((req.body.username [description]
 * @return {[type]}                                                  [description]
 */
	adminRouter.post("/login",function(req,res,next){
		debug(req.body);
		if((req.body.username==="admin")&&(req.body.password=="n_zhi_lanqiu")){
			req.session.loginState=true;
			res.json(stateCode.success());
		}else{
			res.json(stateCode.parMiss());
		}
	});

/**	
 * 登录验证过滤
 * @param  {[type]} req                                                                                                                         [description]
 * @param  {[type]} res                                                                                                                         [description]
 * @param  {[type]} next){		console.log("登录过滤");		if(!req.session.loginState){			res.json(stateCode.notLogin());			return;		}		next();				} [description]
 * @return {[type]}                                                                                                                             [description]
 */
	adminRouter.post("*",function(req,res,next){
		console.log("登录过滤");
		if(!req.session.loginState){
			res.json(stateCode.notLogin());
			return;
		}
		next();			
	});

/**
 * 获取后台设置
 * @param  {[type]} req          [description]
 * @param  {[type]} res          [description]
 * @param  {[type]} next){		var optArry       [description]
 * @return {[type]}              [description]
 */
	adminRouter.post("/api/option/get",function(req,res,next){
		var optArry=until.jsonParse(req.body.options);
		opm.getOptions(function(data) {
			debug(data);
			res.json(data);
		});
	});

/**
 * 修改后台设置
 * @param  {[type]} req          [description]
 * @param  {[type]} res          [description]
 * @param  {[type]} next){		var optArry       [description]
 * @return {[type]}              [description]
 */
	adminRouter.post("/api/option/modify",function(req,res,next){
		var optArry=until.jsonParse(req.body.options);

		if(!optArry){
			res.json(stateCode.jsonParseFail({moreInfo:"options解析出错"}));
			return ;
		}

		opm.setOptions(optArry,function(result){
			if(result.state===200){
				//更新系统全局变量
				opm.getOptions(function(data) {
					debug("系统变量更新成功");
					debug(data);
					var opObj = {};

					data.forEach(function(ite) {
						opObj[ite.name] = ite.val;
					});

					app.locals.systemOption = opObj;
				});
			}
			res.json(result);
		});
	});

module.exports=exports=adminRouter;