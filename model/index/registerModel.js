var path=require("path"),
	debug=require("debug")("registerModel"),
	constVar=require(constVarPath),
	dbBase=require(path.join(constVar.modelPath,"./dbBase")),
	until=require(path.join(constVar.untilPath,"./until")),
	stateCode=require(path.join(constVar.configPath,"./stateCode")),
	Trans=require(path.join(constVar.modelPath,"./dbTransition"));

var registerModel=function(){};
fn=registerModel.prototype=new dbBase;

/**
 * 写入队伍信息
 * @param  {Object} objArry {
 *                          	teamName:"",
 *                          	school:"",
 *                          	hotWords:"",
 *                          	groupPhoto:""
 *                          }
 * @param  {function} func    回调函数
 * @return {[type]}         [description]
 */
fn.registerTeam=function(obj,func){
	//mysql 事务句柄
	var trans=new Trans;
	//
	trans.add(function(){

		var sql='insert into basketballteam (sid,schoolName,teamName,hotWords,groupPhoto) '+
					'select id,name,'+this.con.escape(obj.teamName)+','+this.con.escape(obj.hotWords)+
						','+this.con.escape(obj.groupPhoto)+' from schoolwuhan where id='+this.con.escape(obj.sid)+';';	
			this.query(sql,[],(data)=>{
				debug(data);
				this.next();
			});

	}).then(function(predata){
		var sql="";
		var self=this;
		// debug(self);
		debug("插入成员");
		obj.members.forEach(function(ite){
			sql+="INSERT INTO `wxbasketball`.`teammember` (`name`, `schoolNumber`, `height`, `weight`, `type`, `tid`) "+
						"VALUES ("+self.con.escape(ite.name)+", "+self.con.escape(ite.schoolNumber)+", "+self.con.escape(ite.height)+", "+self.con.escape(ite.weight)+", "+self.con.escape(ite.type)+", "+predata.insertId+");";
		});

		// debug(this);
		this.query(sql,[],(data)=>{		
			debug(data);
			this.next();
		});
	});

	func.call(trans);
};

/**
 * 获取武汉所有的学校信息
 * @param  {function} func 回调函数
 * @return {[type]}      [description]
 */
fn.getSchoolInfo=function(func){
	var sql="SELECT * from schoolwuhan;"
	this.query(sql,[],function(result){
		if(result.state===200){
			func(result);
		}else{
			func(stateCode.fail({moreInfo:"学校信息获取失败"}));
		}
	});
}

module.exports=exports=registerModel;