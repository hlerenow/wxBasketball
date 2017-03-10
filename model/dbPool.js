var mysql=require("mysql");
var path=require("path");
var constVar=require(constVarPath);
var config=require(path.join(constVar.configPath,"./config.js"));

var pool  = mysql.createPool({
  multipleStatements:true,
  host     : config.db.host,
  user     : config.db.user,
  password : config.db.dbPassword,
  database : config.db.dbName
});

module.exports=exports=pool;
