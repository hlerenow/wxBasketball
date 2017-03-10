var path=require("path"),
	debug=require("debug")("voteModel"),
	constVar=require(constVarPath),
	dbBase=require(path.join(constVar.modelPath,"./dbBase")),
	until=require(path.join(constVar.untilPath,"./until")),
	stateCode=require(path.join(constVar.configPath,"./stateCode")),
	Trans=require(path.join(constVar.modelPath,"./dbTransition"));

var voteModel=function(){};
fn=voteModel.prototype=new dbBase;

/**
 * 获取用户基本信息
 * @param  {[type]} openid [description]
 * @param  {[type]} func   [description]
 * @return {[type]}        [description]
 */
fn.getUser=function(openid,func){
	var self=this;
	this.query("select uid,sex,nickname,voteState,sendPrize from user where openid=?;",[openid],function(result){

		var sql="select * from userprizechance where uid=?";

		self.query(sql,[result.opRes[0].uid],function(result2){
			result.opRes={
				baseData:result.opRes[0],
				other:result2.opRes
			}

			func(result);
		});
	});
}

/**
 * 添加用户
 */
fn.addUser=function(func){
	var sql="INSERT INTO `wxbasketball`.`user` (`nickname`, `sex`, `openid`, `voteState`, `sendPrize`) "+
					"VALUES ('asd', '11', 'qwe', 'n', 'n');";
	this.query(sql,[],function(result){
		func(result);
	});
};


/**
 * 获取该用户的中奖情况
 * @return {[type]} [description]
 */
fn.getPrize=function(obj,func){
	var sql="select * from userprize where uid=?;";
	this.query(sql,[obj.uid],function(result){
		func(result);
	});
}

/**
 * 用户投票
 * @return {[type]} [description]
 */
fn.vote=function(obj,func){

	this.query("select * from user where uid=? ;",[obj.uid],function(result){
		if(result.state==200&&result.opRes[0].voteState=='n'){

			//开启事务
			var tran=new Trans;
			tran.add(function(){
				var sql="UPDATE user SET voteState='y' where uid =?;";				
				this.query(sql,[obj.uid],function(data){
					if(data.affectedRows<1){
						return this.$rollback();
					}

					this.next();
				});
			}).then(function(preData){
				var sql="INSERT INTO `vote` (`uid`, `tid`) VALUES (?, ?);";

				this.query(sql,[obj.uid,obj.tid],function(data){
					if(data.insertId<0){
						return this.$rollback();
					}

					this.next();
				});
			});

			tran.failed=function(err){
				func(stateCode.fail({
					moreInfo:"投票失败"
				}));
			};

			tran.success=function(){
				func(stateCode.success({
					moreInfo:"投票成功"
				}));				
			}

			tran.end();
			tran.exec();


		}else{
			func(stateCode.fail({
				moreInfo:"您已经投过票了"
			}));
		}
	});
}

/**
 * 用户抽奖
 * @return {[type]} [description]
 */
fn.luckyRoll=function(obj,func){
	var self=this;
	//判断用户是否有机会
	this.query("select * from userprizechance where type=? and uid=?",[obj.type,obj.uid],function(data){
		//判断是否有机会和是否已经抽过奖啦
		if(data.state!=200){
			func(data);
			return;
		}

		if(data.opRes.length==0){
			debug("没有抽奖机会");			
			func(stateCode.noChance());
			return;
		}

		if(data.opRes[0].state=='n'){
			debug("已经抽过奖抽奖");			
			func(stateCode.chanceUsed());
			return;
		}
		debug("开始抽奖");
		//抽奖
		var rollRes=until.getRate(0.1);
		var sql="";
		//中奖
		if(rollRes){
			if(obj.type==="first"){
				self.getPrizeFirst(obj,function(res){
					func(res);
				});			
			}else if(obj.type==="second"){
				self.getPrizeSecond(obj,function(res){
					func(res);
				})
			//没有中奖
			}else{
				self.noPrize(obj,function(res){
					func(res);
				});
			}

		}else{
			//未中奖
			self.noPrize(obj, function(res) {
				func(res);
			})
		}
	});
}

/**
 * 用户领奖
 */
fn.sendPrize=function(uid,func){
	var sql="UPDATE user set sendPrize='y' where uid=?;";	
	this.query("sql",openid,function(result){
		func(result);
	});
}

/**
 * 获取第一种的奖品
 * @param  {[type]} obj  [description]
 * @param  {[type]} func [description]
 * @return {[type]}      [description]
 */
fn.getPrizeFirst=function(obj,func){
	var tran=new Trans;
	var resData="";

	tran.add(function() {
		var sql = "update prizesInfo set count=count-1 where type='first';";
		//将二维码总数减一，锁表
		this.query(sql, (data)=>{
			this.next();
		});

	}).then(function(preData){
		this.query("select * from prizeCode limit 1;",[],(data)=>{
			if(data.length===0){
				this.$rollback();
				return;
			}
			resData=data;
			this.next();
		})
	}).then(function(preData){
		var sql="INSERT INTO userprize (`uid`, `type`, `VALUE`) VALUES(?,'first',?); ";
		this.query(sql,[obj.uid,preData[0].prizeNumber],(data)=>{
			if(data.insertId<1){
				this.$rollback();
				return;
			}
			this.next();
		});
	}).then(function(pres){
		var sql="UPDATE `userprizechance` SET `state`='n' WHERE (uid=? and type=?);";
		this.query(sql,[obj.uid,obj.type],(data)=>{
			if(data.affectedRows!=1){
				this.$rollback();
				return;
			}
			this.next();
		});

	});

	tran.failed=function(){
		func(stateCode.sqlFail());
	};

	tran.success=function(preData){
		var self=this;
		func(stateCode.success({
			moreInfo:"您中奖啦",
			opRes:resData
		}));
	};

	tran.end();
	tran.exec();
}

//获取第二种奖品
fn.getPrizeSecond=function(obj,func){
	var tran=new Trans;

	tran.add(function(){
		var sql="UPDATE `userprizechance` SET `state`='n' WHERE (uid=? and type=?);";
		this.query(sql,[obj.uid,obj.type],(data)=>{
			if(data.affectedRows!=1){
				this.$rollback();
				return;
			}
			this.next();
		});		
	}).then(function(preData){
		var sql="INSERT INTO userprize (`uid`, `type`, `VALUE`) VALUES(?,'second','电影票');";
		this.query(sql,[obj.uid],function(data){
			if(data.insertId<1){
				this.$rollback();
				return;				
			}

			this.next();			
		});		
	});

	tran.fail=function(){
		func(stateCode.sqlInsertFail());
	};

	tran.success=function(){
		func(stateCode.success({
			moreInfo:"您中奖啦"
		}));
	};

	tran.end();
	tran.exec();
}

/**
 * 没有中奖的操作
 * @param  {[type]} obj  [description]
 * @param  {[type]} func [description]
 * @return {[type]}      [description]
 */
fn.noPrize=function(obj,func){
	var sql="UPDATE userprizechance set state='n' where uid =? and type =?";
	this.query(sql,[obj.uid,obj.type],function(result){
		if(result.state===200&&result.opRes.affectedRows===1){
			func(stateCode.noPrize({
					moreInfo: "用户没有中奖"
			}));
		}else{
			func(stateCode.sqlUpdateFail());
		}
	});
}

module.exports=exports=voteModel;