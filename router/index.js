var path = require("path"),
	express = require("express"),
	debug = require("debug")("indexRouter"),
	constVar = require(constVarPath),
	until = require(path.join(constVar.untilPath, "./until")),
	fileUpload = require(path.join(constVar.untilPath, "./fileUpload")),
	stateCode = require(path.join(constVar.configPath, "./stateCode")),
	indexRouter = express.Router(),
	registerModel = require(path.join(constVar.modelPath, "./index/registerMOdel")),
	voteModel = require(path.join(constVar.modelPath, "./index/voteModel")),
	fs = require("fs");


indexRouter.post("/registerTeam", function(req, res, next) {
	//上传文件到服务器，返回缓存的url
	var fileOptions = {
		uploadDir: path.join(constVar.publicPath, "./tempUpload"),
		maxFilesSize: 1024 * 1024,
	};

	fileUpload(req, fileOptions, function(result) {
		if (result.state !== 200) {
			res.json(stateCode.fileUploadFail());
			return;
		}

		var rm = new registerModel;
		debug(result);
		var obj = until.jsonParse(result.fields.data);
		if (!obj) {
			res.json(stateCode.parMiss());
			return;
		}

		if (result.files["groupPhoto"]) {
			obj.groupPhoto = result.files["groupPhoto"].path;
		} else {
			res.json(stateCode.parMiss({
				moreInfo: "没有图片"
			}));
			return;
		}

		debug(obj);

		rm.registerTeam(obj, function() {
			//将图片从临时文件夹移动到正式文件夹
			//这里的上下文 this  是一个mysql 事务对象
			var self = this;

			//事务出错时调用的函数
			this.failed=function(err){
				debug(err);
				debug("事务失败回调");
				res.json(stateCode.sqlInsertFail());
			};

			//事务成功过时调用的函数
			this.success=function(){
				debug("事务成功回调");
				var path = result.files["groupPhoto"].path;
				var newPath = path.replace("tempUpload", "upload");
				fs.rename(path, newPath, function(err) {
					if (err) { //回滚啊
						debug(err);
						fs.unlink(path, function(err) {
							debug(err);
						});
					}
				});				
				res.json(stateCode.success());
			};

			self.end();

			self.exec();				
		
			// debug(self);
		});
	});
});

indexRouter.get("/index",function(req,res,next){
	var vm=new voteModel;
	vm.getUser('qwe',function(result){
		res.json(result);
	});
});

indexRouter.get("/schools",function(req,res,next){
	var rm =new registerModel;
	rm.getSchoolInfo(function(result){
		res.json(result);
	});
});

indexRouter.post("/luckyRoll",function(req,res,next){
	var vm=new voteModel;
	vm.luckyRoll({uid:1,type:'second'},function(result){
		res.json(result);
	});

});

indexRouter.post("/vote",function(req,res,next){
	var vm=new voteModel;
	vm.vote({uid:1,tid:1},function(result){
		res.json(result);
	});

});

module.exports = exports = indexRouter;