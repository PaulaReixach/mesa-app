const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.zip':'application/zip','.ttf':'font/ttf','.webp':'image/webp'};
http.createServer((req,res)=>{let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname));}catch{res.writeHead(400);return res.end();}if(file===root)file=path.join(root,'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(err,bytes)=>{if(err){res.writeHead(404);return res.end('No encontrado');}res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);});}).listen(8770,'127.0.0.1',()=>process.stdout.write('MESA diseño: http://127.0.0.1:8770\n'));

