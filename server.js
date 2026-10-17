const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'public');
http.createServer((req,res)=>{
 const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
 if(!file.startsWith(root + path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}
 res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.pdf':'application/pdf'})[path.extname(file)]||'application/octet-stream');res.end(data);});
}).listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('Common Criteria guide listening on port '+(process.env.PORT||3000)));
