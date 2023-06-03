require("dotenv").config();
const express = require("express");
const axios = require("axios");
const path = require('path');
const soap = require('soap');
const bodyParser = require('body-parser')
const http = require("http");
const xml2js = require('xml2js');

// Configuración variables API-Gateway
const APIPORT = process.env.APIPORT || 3121;
const APIURI =  String(process.env.APIURI) || 'http://0.0.0.0';
const APIURL = `${APIURI}:${APIPORT}`;
const entryPointUser ="gestionUsuarios/usuarios"

// const PORTSOAP = String(process.env.PORTSOAP) || 8000;
// const PORTREST = String(process.env.PORTREST) || 8001;

// Configuración variables consumo de la interface del equipo 1E
const CONSUMEPORT = process.env.CONSUMEPORT;
const CONSUMEURI =  String(process.env.CONSUMEURI)
const CONSUMEENDPOINT = String(process.env.CONSUMEENDPOINT)
const CONSUMEURL = `${CONSUMEURI}:${CONSUMEPORT}/${CONSUMEENDPOINT}`;

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
                    url: `${APIURL}/${entryPointUser}`,
                    method: 'post',
                    headers: headers,
                    data: {query: graphqlQuery}
                }).then((data)=>result=data);
                return {
                    usuarios: result.data.data.leerUsuarios
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

//http server example
var server = http.createServer(function(request,response) {
    response.end('404: Not Found: ' + request.url);
});

server.listen(3037);
soap.listen(server, '/SAE/soap1D', myService, xml, function(){
  console.log('server soap initialized');
});

//body parser middleware are supported (optional)
app.use(bodyParser.raw({type: function(){return true;}, limit: '5mb'}));

const parserXML = new xml2js.Parser({ explicitArray: false });
function eliminarLlaveUnderscore(key, value) {
    if (typeof value === "object" && value !== null) {
      if (value.hasOwnProperty("_")) {
        if(value["$"]["type"] == "str"){
            value = String(value["_"])
        }
        else if(value["$"]["type"] == "int"){
            value = parseInt(value["_"])
        }
        else{
            value = (value["_"]);
        }
      }
      if (value.hasOwnProperty("$")) {
        delete value["$"];
      }
    }
    return value;
  }

//Consumo de la interface del equipo 1E
app.get("/consumo/1C",(request,response)=>{
    // var url = 'http://soapdigapp.ddns.net:61285/digapp?wsdl';
    var url = `${CONSUMEURL}?wsdl`;
    const options = {
        endpoint: `${CONSUMEURL}`, // Nueva dirección
      };
    // console.log(url)
    soap.createClient(url,options, function(err, client) {
        if(err != null) {
          console.log("client create error: ", err);
        }
        
        if(client != null) {
        //   console.log(client.describe());
          client.getAulasEstudio({}, function(err, result) {
                if(err){
                    console.log(err);
                    response.status(400).send("ERROR getAulasEstudio")
                }else{
                    var res;
                    parserXML.parseString(result.getAulasEstudioResult, (err, items) => {
                        if (err) {
                          console.error(err);
                          return;
                        }
                      
                        // Convertir el resultado a JSON
                        const json = JSON.stringify(items, eliminarLlaveUnderscore, 2);
                        const jsonObject = JSON.parse(json);
                        // res = json
                        res = jsonObject["root"]['item'];
                      });

                //   console.log("result: ", result);
                //   console.log("err: ", err);
                    response.status(200).send(res)
                }
          });
        }
      });
})

app.listen(3036, function(){
    //Note: /wsdl route will be handled by soap module
    //and all other routes & middleware will continue to work
    soap.listen(app, '/SAE/soap1D', myService, xml, function(){
      console.log('server app initialized');
    });
});



