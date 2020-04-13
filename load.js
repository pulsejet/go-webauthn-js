"use strict";
var $global, $module;
if (typeof window !== "undefined") { /* web page */
    $global = window;
}
else if (typeof self !== "undefined") { /* web worker */
    $global = self;
}
else if (typeof global !== "undefined") { /* Node.js */
    $global = global;
    $global.require = require;
}
else { /* others (e.g. Nashorn) */
    $global = this;
}
if ($global === undefined || $global.Array === undefined) {
    throw new Error("no global object found");
}
if (typeof module !== "undefined") {
    $module = module;
}
if (!$global.process) {
    $global.process = {
        getuid: function () { return -1; },
        getgid: function () { return -1; },
        geteuid: function () { return -1; },
        getegid: function () { return -1; },
        getgroups: function () { throw 'enosys'; },
        pid: -1,
        ppid: -1,
        umask: function () { throw 'enosys'; },
        cwd: function () { throw 'enosys'; },
        chdir: function () { throw 'enosys'; },
        env: {}
    };
}
$global.process.getuid = $global.process.getuid || function () { return -1; };
$global.process.getgid = $global.process.getgid || function () { return -1; };
$global.process.geteuid = $global.process.geteuid || function () { return -1; };
$global.process.getegid = $global.process.getegid || function () { return -1; };
$global.process.pid = $global.process.pid || -1;
$global.process.ppid = $global.process.ppid || -1;
$global.process.env = $global.process.env || {};
$global.process.argv = $global.process.argv || ['node'];
