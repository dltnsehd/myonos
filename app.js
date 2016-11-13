
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http').Server(app)
  , io = require('socket.io')(http)
  , path = require('path')
  , jf = require('jsonfile')
  ,fs = require('fs')
  , MongoClient = require('mongodb').MongoClient
  , assert = require('assert')
  ,  async = require('async')
  , MongoOplog=require('mongo-oplog')
  , oplog = MongoOplog('mongodb://127.0.0.1:27017/local', {ns:'test.node'}).tail();
 



// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
var url ='mongodb://localhost:27017/test';

var net = require('net'); 
var HOST = '192.168.123.110'; 
// parameterize the IP of the Listen 
var PORT = 5000; // TCP LISTEN port 
// Create an instance of the Server and waits for a conexão

function sed(q,t){
	var k=new Object();
	k.Message_Type=q;
	k.Transaction_ID=t;
	var b= new Array();
	var j=new Object();
	j.Header=k;
	j.JsonArray=b;
	var jsoninfo=JSON.stringify(j);
	return jsoninfo;
}

MongoClient.connect(url,function(err,db){
	console.log("connected correctly to server");
	
	var collec=db.collection("node");
	var collec2=db.collection("link");
	var collec3=db.collection("controller");
	
	net.createServer(function(sock) { 
		// Receives a connection - a socket object is associated to the connection automatically 
		console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort); 
		// Add a 'data' - "event handler" in this socket instance 
		sock.on('data', function(data) { 
			var data3=data.toString('utf-8');
			data3=JSON.parse(data3);
			var jsona=data3.JsonArray;
			var res=sock.remoteAddress.toString();
			var re=res.substring(8,res.length);
			switch(data3.Header.Message_Type){
			case 0:
				var st=sed(0,data3.Header.Transaction_ID);
				sock.write(st+"\n");
				console.log("Hello recive");
				break;
			case 10:
				console.log("Registration recieve");
				var st2=sed(200,data3.Header.Transaction_ID);
				sock.write(st2+"\n");
				var jsona=data3.JsonArray;
				for(var i=0;i<jsona.length; i++){
					switch(jsona[i].Object_Name){
					case 90:
						var s=jsona[i].Summary.Controller_IP;
						var e=jsona[i];
						collec3.insert({_id:s},{w:1},function(err, doc){
							collec3.update({_id:s}, e);
						});
						break;
					case 91:
						var s2=jsona[i].ID;
						var e2=jsona[i];
						collec.insert({_id:s2},{w:1},function(err,doc){
							console.log(err);
							collec.update({_id:s2},e2,function(err,doc){
								console.log(err);
								collec.update({_id:s2},{$set:{controller:re}});
							});
						});
						break;
					case 93:
						var s3=jsona[i].Source_Node+jsona[i].Destination_Node;
						var e3=jsona[i];
						collec2.insert({_id:s3},{w:1},function(err,doc){
							collec2.update({_id:s3},e3);
						});
						break;
					case 94:
						var s4=jsona[i].Host_Id;
						var e4=jsona[i];
						collec.insert({_id:s4},{w:1},function(err,doc){
							collec.update({_id:s4},e4);
						});
						break;
					default:
						console.log("strange info in JsonArray");
						break;
					}
				}
				
				break;
			case 20:
				var st3=sed(200,data3.Header.Transaction_ID);
				sock.write(st3+"\n");
				var s=jsona[0].ID;
				var e=jsona[0];
				collec.insert({_id:s},{w:1},function(err,doc){
					collec.update({_id:s},e,function(err,doc){
						collec.update({_id:s},{$set:{controller:re}});
					});
				});
				console.log("Device add"+s);
				break;
			case 21:
				var st4=sed(200,data3.Header.Transaction_ID);
				sock.write(st4+"\n");
				var s=jsona[0].ID;
				collec.remove({_id:s},{w:1});
				console.log("Device remove"+s);
				break;
			case 22:
				
				var st5=sed(200,data3.Header.Transaction_ID);
				sock.write(st5+"\n");
				var s=jsona[0].ID;
				var e=jsona[0];
					collec.update({_id:s},e);
					console.log("Device update"+s);
				break;
			case 30:
				var st6=sed(200,data3.Header.Transaction_ID);
				sock.write(st6+"\n");
				var s3=jsona[0].Source_Node+jsona[0].Destination_Node;
				var e3=jsona[0];
				collec2.insert({_id:s3},{w:1},function(err,doc){
					collec2.update({_id:s3},e3);
				});
				console.log("Link add"+s3);
				break;
			case 31:
				var st7=sed(200,data3.Header.Transaction_ID);
				sock.write(st7+"\n");
				var s3=jsona[0].Source_Node+jsona[0].Destination_Node;
				var e3=jsona[0];
				collec2.remove({_id:s3},{w:1});
				console.log("Link remove"+s3);
				break;
			case 32:
				var st8=sed(200,data3.Header.Transaction_ID);
				sock.write(st8+"\n");
				var s3=jsona[0].Source_Node+jsona[0].Destination_Node;
				var e3=jsona[0];
					collec2.update({_id:s3},e3);
					console.log("Link update"+s3);
				break;
			case 40:
				var st9=sed(200,data3.Header.Transaction_ID);
				sock.write(st9+"\n");
				var s4=jsona[0].Host_Id;
				var e4=jsona[0];
				collec.insert({_id:s4},{w:1},function(err,doc){
					collec.update({_id:s4},e4);
				});
				console.log("host add"+s4);
				break;
			case 41:
				var stt=sed(200,data3.Header.Transaction_ID);
				sock.write(stt+"\n");
				var s4=jsona[0].Host_Id;
				collec.remove({_id:s4},{w:1});
				console.log("host remove"+s4);
				break;
			case 42:
				var sts=sed(200,data3.Header.Transaction_ID);
				sock.write(sts+"\n");
				var s4=jsona[0].Host_Id;
				var e4=jsona[0];
				collec.update({_id:s4},e4);
				console.log("host update"+s4);
				break;			
			}
			//fs.writeFileSync(file,data3);
			}); 
		sock.on('close', function(data) { 
			console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort); 
			}); 
		}).listen(PORT); 
	
	io.sockets.on('connection', function(socket) {
			var jobj=new Object();	
			async.series([
			                 function(callback){
			                	 collec.find({}).toArray(function(err,docs){
			         				jobj.nodes=docs;
			         			});
			             		callback(null);
			                 },
			                 function(callback){
			                	 collec2.find({}).toArray(function(err,docs){
			         				jobj.links=docs;
			         			});
			                	 callback(null);
			                 },
			                 function(callback){
			                	 collec.count({Object_Name:91},function(err,count){
			         				jobj.devicecount=count;
			         				collec.count({Object_Name:92},function(err,count2){
			         					jobj.devicecount+=count2;
			         				});
			         			});
			                	 callback(null);
			                 },
			                 function(callback){
			                	 collec.count({Object_Name:94},function(err,count){
			         				jobj.hostcount=count;
			         			});
			                	 callback(null);
			                 },
			                 function(callback){
			                 collec2.count({Object_Name:93},function(err,count){
			     				jobj.linkcount=count;
			     				socket.emit('notification',jobj);
			     			});
			                 callback(null);}
			                 ],function(err,a){
				
			});
		
						
		oplog.on('op', function(doc){
			console.log("ho");
			async.series([
			                 function(callback){
			                	 collec.find({}).toArray(function(err,docs){
			         				jobj.nodes=docs;
			         			});
			             		callback(null);
			                 },
			                 function(callback){
			                	 collec2.find({}).toArray(function(err,docs){
			         				jobj.links=docs;
			         			});
			                	 callback(null);
			                 },
			                 function(callback){
			                	 collec.count({Object_Name:91},function(err,count){
			         				jobj.devicecount=count;
			         				collec.count({Object_Name:92},function(err,count2){
			         					jobj.devicecount+=count2;
			         				});
			         			});
			                	 callback(null);
			                 },
			                 function(callback){
			                	 collec.count({Object_Name:94},function(err,count){
			         				jobj.hostcount=count;
			         			});
			                	 callback(null);
			                 },
			                 function(callback){
			                 collec2.count({Object_Name:93},function(err,count){
			     				jobj.linkcount=count;
			     				socket.emit('notification',jobj);
			     			});
			                 callback(null);}
			                 ],function(err,a){
				
			});
			});
		});	
	
});


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
var file = './sports.json';
app.get('/', routes.index);
app.get('/users', user.list);

	http.listen(app.get('port'), function(){
		  console.log('Express server listening on port ' + app.get('port'));
		});


console.log('Server listening on ' + HOST +':'+ PORT);


