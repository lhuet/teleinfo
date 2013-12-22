var teleinfo = require("./teleinfo");
var util = require('util');

var trameEvents = teleinfo.teleinfo("/dev/ttyAMA0");

trameEvents.on('tramedecodee', function (data) {
  console.log(util.inspect(data));
});
