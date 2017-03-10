var path=require("path"),
	debug=require("debug")("expressInit"),
	favicon=require("express-favicon"),
	compression=require("compression"),
	cookieParser=require("cookie-parser"),
	bodyParser=require("body-parser"),
	express=require("express"),
	routers=require("./router/router"),
	session = require("express-session"),
	helmet = require('helmet');

var urlencode=bodyParser.urlencoded({
		extend:true
	}),
	jsonParser=bodyParser.json();


function expressInit(app){
	//环境选择
	switch (app.get('env')) {
		case "development":
			{
				app.use(require("morgan")("dev"));
				break;
			}
		case 'production':
			{
				app.use(require("express-logger")({
					path: __dirname + "/log/log.txt"
				}));
				break;
			}
	}

	app.disable('x-powered-by');

	// 设置模版引擎
	app.engine('html', require('ejs').renderFile); 
	app.set("view engine", "html"); 
	app.set("views", path.join(__dirname, "view"));

	// 中间件挂载
	app.use(favicon(path.join(__dirname, "/public/favicon.png")));
	app.use(cookieParser("ni-zhig-wx-basketball"));
	app.use(urlencode);
	app.use(jsonParser);
	app.use(compression());
	app.use(session({
		secret: "ningzhi_2015_wxb",
		cookie: {
			secure: false
		},
		name: "nz-id",
		resave: false,
		saveUninitialized: true
	}));	
	app.use(express.static(path.join(__dirname, "public")));
	app.use(helmet());

	//路由
	app.use("/",routers);

	app.all("*",function(req,res,next){
		res.send("404 not found \n");
	});	
}

module.exports=exports=expressInit;
