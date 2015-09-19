var gulp = require('gulp'),
    less = require('gulp-less'),
    path = require('path'),
    Server = require('karma').Server;

/**
 * Run test once and exit
 */
gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function(exitStatus) {
        done(exitStatus ? "There are failing unit tests." : undefined)
    }).start();
});

/**
 * Watch for file changes and re-run tests on each change
 */
gulp.task('tdd', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js'
    }, function(exitStatus) {
        done(exitStatus ? "There are failing unit tests." : undefined)
    }).start();
});

/**
 * Compile all less files.
 */
gulp.task('less', function () {
    return gulp.src('./less/bootstrap-ext.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('./css'));
});

gulp.task('default', ['less'], function() {
    gulp.start('less');
});