const express = require('express'),
    chalk = require('chalk'),
    fs = require( 'fs' );

const pkg = require( './package.json' );

const start = Date.now(),
    protocol = process.env.PROTOCOL || 'https',
    port = process.env.PORT || '3000',
    host = process.env.HOST || 'localhost';

let server;

function sendBootStatus( status ) {
	// don't send anything if we're not running in a fork
	if ( ! process.send ) {
		return;
	}
	process.send( { boot: status } );
}

const app = express();

app.get('/', (request, response) => {
    response.send('Hello, world!');
});

app.get( '/version', function( request, response ) {
	response.json( {
		version: pkg.version,
	} );
} );

console.log(
	chalk.yellow( '%s booted in %dms - %s://%s:%s' ),
	pkg.name,
	Date.now() - start,
	protocol,
	host,
	port
);

// Start a development HTTPS server.
if ( protocol === 'https' ) {
	let key = './certs/key.pem';
    let certificate = './certs/certificate.pem';

	const options = {
		key: fs.readFileSync( key ),
		cert: fs.readFileSync( certificate ),
		passphrase : 'password'
    };
    
	server = require( 'https' ).createServer( options, app );
    
} else {
    server = require( 'http' ).createServer( app );
}

server.listen( { port, host }, function() {
    // Tell the parent process that Server has booted.
    sendBootStatus( 'ready' );
} );
