var debug = require("debug")("dbTransition");
var path = require("path");
var constVar=require(constVarPath);
var stateCode = require(path.join(constVar.configPath, "./stateCode"));
var pool = require(path.join(constVar.modelPath, "./dbPool"));
var until = require(path.join(constVar.untilPath, "./until"));

var dbTransition = function() {
	this.con=undefined;
	this.quequ=[];
	this.predata={};
	this.dataArry=[];
	this.error=undefined;
	this.failed=function(err){throw new Error("事务出错，回滚")};
	this.success=function(){};
};

var fn = dbTransition.prototype;

fn.startTransition=function(func){
	var self=this;
	debug("获取事务连接");
	// debug(this);
	pool.getConnection(function(err,connection){
		if(err){
			throw new Error("没有获取到数据库连接(can't get mysql's connection)");
		}else{
			self.con=connection;
			// debug(self);
			func();
		}
	});
};

fn.then=fn.add=function(func){
	debug("添加事务");	
	this.quequ.push(func);
	return this;
};

fn.next=function(){
	debug("执行下一个事务");	
	var func="";
	func=this.quequ.shift();
	if(func){
		func.call(this,this.predata.data,this.predata.fileds);
	}
};

fn.endTransition=function(){
	debug("事务结束");

	this.con.commit((err)=>{
		debug("事务提交");
		if (err) {
			return this.con.rollback(function() {
				// throw err;
			});
		}
		this.success();
		this.con.release();	
	});
};

fn.query=function(sql,val,func){
	this.con.query(sql,val,(err,results,fields)=>{
		// debug(this);
		var preData={data:results,fileds:fields};
		this.predata=preData;
		this.dataArry.push(preData);
		this.error=err;

      if (err) {
        debug(err,err||affect);	      	
      	var self=this;
        return this.con.rollback(function(){
        	debug("回滚");
        	self.failed(err);
          // throw err;
        });
      }	      

		func.call(this,results,fields);
	});
}

fn.exec=function(){
	this.startTransition(()=>{
		// debug(this);
		this.con.beginTransaction((err)=>{
			debug("开始执行事务");			
		    if (err) {
		      return connection.rollback(function() {
		        throw err;
		      });
		    }

			this.next();		
		});
	});
}

fn.end=function(){
	this.quequ.push(this.endTransition);
};

fn.rollback=function(){
	this.quequ.push(function(){
	    return this.con.rollback(()=>{
	    	debug("回滚");
	        // this.error(err);	    	
	    	this.next();
	      // throw err
	    });			
	});
}

fn.$rollback=function(func){
	func=func||function(){};
	return this.con.rollback(func(err));
}
module.exports=exports=dbTransition;

