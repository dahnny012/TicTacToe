var http = require("http");
var fs = require("fs");
var url = require("url");

http.createServer(function(req,res){
    console.log(req);
})

.listen(3000);

var routes = {
    startGame:function(){},
    findGame:function(){},
    default:function(){}
};