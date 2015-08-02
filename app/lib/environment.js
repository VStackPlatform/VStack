define([], function() {
    return {
        isWindows: process.platform === 'win32',
        isLinux: ['linux32', 'linux64'].indexOf(process.platform) != -1,
        isMac: ['osx32', 'osx64'].indexOf(process.platform) != -1,
        pathSeparator: function() {
            return this.isWindows ? '\\' : '/';
        },
        newLine: function() {
            return this.isWindows ? '\r\n' : '\n';
        },
        exeFile: function(name) {
            return this.isWindows ? name + '.exe' : name;
        },
        buildPath: function(path) {
            return path.join(this.pathSeparator());
        }
    };
});