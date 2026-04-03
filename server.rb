require 'webrick'
server = WEBrick::HTTPServer.new(Port: 8080, DocumentRoot: '/Users/rdc/Desktop/tennisgrid')
trap('INT') { server.shutdown }
server.start
