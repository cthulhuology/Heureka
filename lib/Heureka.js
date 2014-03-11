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
			var contents = args.length > 4 ? args.slice(3) : 
				['ns.' + domain + '.','admin.' + domain + '.', date(),'10800','3600','604800','3600']
			get('added','create_soa', domain, contents.join('%20'))
			break;
		case 'a':
			get('added','create_a',domain,args[3],args[4])
			break;
		case 'cname':
			get('added','create_cname',domain,args[3],args[4])
			break;
		case 'ns':
			get('added','create_ns',domain,args[3])
			break;
		case 'txt':
			get('added','create_txt',domain,args[3],args[4])
			break;
		case 'srv':
			get('added','create_srv',domain,args[3],args[4])
			break;
		default:
			console.log("I don't know how to add a ", type, "record")
		}
		emitter.once('added', function(data) {
			try {
				var res = JSON.parse(data)
				
			console.log('added',data)
			} catch (E)  {
				console.log("Error:", E)
			}
		})
		break;
	case 'remove':
		var type = args[2]
		switch(type) {
		case 'soa':
			var contents = args.length > 4 ? args.slice(3) : 
				['ns.' + domain + '.','admin.' + domain + '.', date(),'10800','3600','604800','3600']
			get('removed','delete_soa', domain, contents.join('%20'))
			break;
		case 'a':
			get('removed','delete_a',domain,args[3],args[4])
			break;
		case 'cname':
			get('removed','delete_cname',domain,args[3],args[4])
			break;
		case 'ns':
			get('removed','delete_ns',domain,args[3])
			break;
		case 'txt':
			get('removed','delete_txt',domain,args[3],args[4])
			break;
		case 'srv':
			get('removed','delete_srv',domain,args[3],args[4])
			break;
		default:
			console.log("I don't know how to delete a ", type, "record")
		}
		emitter.once('removed', function(data) {

			console.log('removed',data)
		})
		break;
	case 'list':
		get('listed', 'list_domain', domain)
		var lister = function(data) { console.log('listed',data) }
		if (args[2] && typeof(args[2]) == "function") lister = args[2]
		emitter.once('listed', lister) 
		break;
	default:
		usage_message()
	}

}
