// Heureka.js
// 
// (C) 2014 David J. Goehrig <dave@dloh.org>
//

var config = require( process.env['HOME'] + '/.heurekarc' )
var request = require('request') 
var EventEmitter = require('events').EventEmitter
var emitter = new EventEmitter()

Object.prototype.list = function() { return Array.prototype.slice.apply(this,[0]) }
Object.prototype.after = function(x) { return Array.prototype.slice.apply(this,[ x ]) }

var domain = 'localhost';

function usage_message() {
	console.log(process.argv[1],"[add|remove|list] [domain] [type] [host] [text]")
	console.log("\tadd ")
}

function url() {
	return 'http://' + config[domain].host + ':' + config[domain].port + '/'
}

function get(ev) {
	request(url() + arguments.after(1).join('/'), function(err,req,body) {	
		if (err) return console.log(err)
		emitter.emit(ev,body)
	})
}

function date() {
	// TODO: write a Date() -> YYYYMMDDHH format
	return '2013111311'
}

module.exports = function() {
	var args = arguments.list()
	domain = args[1]
	switch(args[0]) {
	case 'add':
		var type = args[2]
		switch(type) {
		case 'domain':
			get('added','create_domain',domain,'master','admin')
			break
		case 'soa':
			var content = args[3] ? args[3] : 'ns.' + domain + '.%20admin.' + domain + '.%20' + date() + '%2010800%203600%20604800%203600'
			get('added','create_soa', domain, content)
			break;
		case 'a':
			break;
		case 'cname':
			break;
		case 'ns':
			break;
		case 'txt':
			break;
		case 'srv':
			break;
		default:
			console.log("I don't know how to add a ", type, "record")
		}
		emitter.once('added', function(data) {

			console.log('added',data)
		})
		break;
	case 'remove':
		emitter.once('removed', function(data) {

			console.log('removed',data)
		})
		break;
	case 'list':
		get('listed', 'list_domain', domain)
		emitter.once('listed', function(data) {
			console.log('listed',data)
		})
		break;
	default:
		usage_message()
	}

}
