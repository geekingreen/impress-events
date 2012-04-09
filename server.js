var http = require('http'),
	fs = require('fs'),
    clients = new Array();
    
http.createServer( function(req, res) {
	if (req.url == '/') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(fs.readFileSync('./index.html'));
		res.end();
	} else if (req.url == '/master') {	
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(fs.readFileSync('./index.html'));
		res.end();
	} else if (req.url == '/main.css') {
		res.writeHead(200, {'Content-Type': 'text/css'});
		res.write(fs.readFileSync('./main.css'));
		res.end();
	} else if (req.url == '/impress.js') {
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		res.write(fs.readFileSync('./impress.js'));
		res.end();
    } else if (req.headers.accept && req.headers.accept === 'text/event-stream') {
        if (req.url == '/events') {
            acceptRequest(req, res);
        } else {
            res.writeHead(404);
            res.end();
        }
    } else if(req.url == '/send') {
	    var data = [];
		req.on('data', function(chunk) {
			data.push(chunk);
		});
		req.on('end', function() {
			data = data.join('');
			for(var id in clients) {
				sendEvent(clients[id], 'slide', data);
			}
		});
		res.end();
    } else {
		res.end();
	}
}).listen(8090);

console.log('Server started on *:8090...');

function acceptRequest(req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.__id = req.connection.remoteAddress;
    req.on('close', function() {
        delete clients[res.__id];
		console.log('Client Disconnected: ' + res.__id);
    });
    clients[res.__id] = res;
    console.log('Client connected: ' + res.__id);
}

function sendEvent(res, id, data) {
    res.write('id: ' + id + '\n');
    res.write('data: ' + data + '\n\n');
    console.log('Sending to ' + res.__id + ': ' + data);
}

