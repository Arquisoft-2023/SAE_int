const express = require("express");
const axios = require("axios");
const soap = require('soap');
const bodyParser = require('body-parser')
const http = require("http");
const path = require('path');

const headers = {
	"content-type": "application/json"
    // "Authorization": "<token>"
};
const graphqlQuery = `query {
    leerUsuarios {
      nombres
      apellidos
      usuarioUn
    }
  }`;

var myService = {
    MyService: {
        MyPort: {
            MyFunction: async function() {                
                var result = {}
                await axios({
                    url: 'http://35.247.192.77:3121/gestionUsuarios/usuarios',
                    method: 'post',
                    headers: headers,
                    data: {query: graphqlQuery}
                }).then((data)=>result=data.data.data);
                console.log(result)
                return {
                    usuarios: result.leerUsuarios
                };
            },

            // This is how to define an asynchronous function with a callback.
            MyAsyncFunction: function(args, callback) {
                // do some work
                callback({
                    name: args.name
                });
            },

            // This is how to define an asynchronous function with a Promise.
            MyPromiseFunction: function(args) {
                return new Promise((resolve) => {
                  // do some work
                  resolve({
                    name: args.name
                  });
                });
            },

            // This is how to receive incoming headers
            HeadersAwareFunction: function(args, cb, headers) {
                return {
                    name: headers.Token
                };
            },

            // You can also inspect the original `req`
            reallyDetailedFunction: function(args, cb, headers, req) {
                console.log('SOAP `reallyDetailedFunction` request from ' + req.connection.remoteAddress);
                return {
                    name: headers.Token
                };
            }
        }
    }
};

const wsdlPath = path.join(__dirname, 'wsdl/myservice.wsdl');
var xml = require('fs').readFileSync(wsdlPath, 'utf8');

//express server example
var app = express();

//Consumo de la interface del equipo 1B
app.get("/consumo/MyFunction",(request,response)=>{
    // var url = require('fs').readFileSync('ip.txt', 'utf8');
    var url = "http://localhost:8000/wsdl"
    var args = {name: 'value'};   
    
    soapClient.createClient(url, {}, function(err, client) {
        if(err) response.status(400).send(err)
        try{
            client.getCareers({}, function(err, result) {
                if(err) response.status(400).send(err)
                console.log(result);
                response.status(200).send(result)
            });
        }catch(err){console.log(err)}
    });
})

//http server example
var server = http.createServer(function(request,response) {
    response.end('404: Not Found: ' + request.url);
});

server.listen(8000);
soap.listen(server, '/MyFunction', myService, xml, function(){
  console.log('server soap initialized');
});

// // Create consumer
// var url = 'http://example.com/yourservice/wsdl?wsdl';
// var args = {name: 'value'};

// soap.createClient(url, {}, function(err, client) {
//     client.MyFunction(args, function(err, result) {
//         console.log(result);
//     });
// });

//body parser middleware are supported (optional)
app.use(bodyParser.raw({type: function(){return true;}, limit: '5mb'}));
app.listen(8001, function(){
    //Note: /wsdl route will be handled by soap module
    //and all other routes & middleware will continue to work
    soap.listen(app, '/MyFunction', myService, xml, function(){
      console.log('server app initialized');
    });
});



