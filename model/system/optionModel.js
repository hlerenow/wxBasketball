var path=require("path"),
	debug=require("debug")("optionModel"),
	constVar=require(constVarPath),
	dbBase=require(path.join(constVar.modelPath,"./dbBase")),
	until=require(path.join(constVar.untilPath,"./until")),
	stateCode=require(path.join(constVar.configPath,"./stateCode"))

var optionModel=function(){}
var fn=optionModel.prototype=new dbBase;

fn.getOptions=function(func){
	var sql="SELECT * FROM `option`;";
	this.query(sql,[],function(result){
		debug(result.info);
		if(result.state===200){
			func(result.opRes);
		}else{
			func([]);
		}
	});
}

fn.setOptions=function(optArry,func){
	var sql="";
	var pool=this.pool;
	if(optArry.length<0){
		func(stateCode.parMiss());
		return;
	}

	for(var i=0;i<optArry.length;i++){
		var ite=optArry[i];
		if(ite.oid&&ite.val){
			sql+="UPDATE  `option` set val= "+pool.escape(ite.val)+" where oid="+pool.escape(ite.oid)+" ;"
		}
	}


	debug(sql);
	this.query(sql,[],function(result){
		debug(result);
		if(result.state===200){
			func(stateCode.success({moreInfo:"设置修改成功"}));			
		}else{
			func(stateCode.fail({moreIfo:"设置修改失败"}));
		}
	})
};

module.exports=exports=new optionModel;