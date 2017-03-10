var path=require("path");
var constVar=require(constVarPath);
var until=require(path.join(constVar.untilPath,"./until"));
var debug=require("debug")("stateCode");
const stateCode={
	sqlFail:{
		state:102,
		info:"sql操作失败"
	},
	sqlInsertFail:{
		state:103,
		info:"sql插入失败"
	},
	sqlQueryFail:{
		state:104,
		info:"sql查询失败"
	},
	sqlDeleteFail:{
		state:105,
		info:"sql删除失败"
	},
	sqlUpdateFail:{
		state:106,
		info:"sql更新失败"
	},
	sqlNotFound:{
		state:107,
		info:"sql查找结果为空"
	},
	success:{
		state:200,
		info:"操作成功"
	},
	fail:{
		state:400,
		info:"操作失败"
	},
	notLogin:{
		state:401,
		info:"未登录"
	},
	loginFail:{
		state:402,
		info:"登录失败,密码错误"
	},
	loginFailUserNotExit:{
		state:403,
		info:"用户名不存在"
	},

	// 参数错误 State:0xx
	parMiss:{
		state:"001",
		info:"参数不完整"
	},
	//数据库错误 State:1xx;
	notConectDb:{
		state:101,
		info:"没有获取数据库连接"
	},	
	notAuthority:{
		state:600,
		info:"用户没有操作权限"
	},
	fileUploadFail:{
		state:700,
		info:"文件上传失败"
	},
	jsonParseFail:{
		state:701,
		info:"json字符串解析失败"
	},
	noChance:{
		state:702,
		info:"用户没有机会抽奖"
	},
	chanceUsed:{
		state:702,
		info:"用户已经抽奖"
	},
	noPrize:{
		state:703,
		info:"用户没有中奖"
	},
	sysError:{
		state:900,
		info:"系统错误"
	}
}

var stateCodeFunc=function(){}
var fn=stateCodeFunc.prototype;

/**
 * 混合两个对象，将基础对象的值混合到扩展对象上，基础对象不改变
 * @param  {[object]} obj  [基础对象]
 * @param  {[object]} more [扩展对象]
 * @return {[type]}      [description]
 */
fn.mergeObj=function(obj,more){
	for(let i in obj){
		more[i]=obj[i];
	}

	debug(more);
	return more;
}

// 批量注册函数
for(let i in stateCode){
	fn[i]=function(obj){
		if(until.isEmptyObj(obj)){
			return stateCode[i];
		}else{
			return this.mergeObj(stateCode[i],obj);
		}
	}
}

module.exports=exports=new stateCodeFunc;