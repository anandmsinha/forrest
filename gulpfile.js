var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefix = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css'),
    less = require('gulp-less'),
    watch = require('gulp-watch'),
    gutil = require('gulp-util'),
    csso = require('gulp-csso'),
    coffee = require('gulp-coffee'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat')

gulp.task('css', function() {
    return gulp.src('bower_components/less/web.less')
        .pipe(less())
        .pipe(prefix(
            'Android 2.3',
            'Android >= 4',
            'Chrome >= 20',
            'Firefox >= 24', // Firefox 24 is the latest ESR
            'Explorer >= 8',
            'iOS >= 6',
            'Opera >= 12',
            'Safari >= 6'
        ))
        .pipe(minifyCSS())
        .pipe(csso())
        .on('error', gutil.log)
        .pipe(gulp.dest('public/css/'))
})

gulp.task('javascript', function() {
    return gulp.src('bower_components/coffee/web.coffee')
        .pipe(coffee())
        .on('error', gutil.log)
        .pipe(gulp.dest('public/js'))
})

gulp.task('minify', function() {
    return gulp.src(['public/js/ngRoute.min.js' ,'public/js/loading-bar.min.js', 'public/js/mentio.min.js', 'public/js/web.js'])
        .pipe(concat('web.min.js'))
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(gulp.dest('public/js/'))
})

gulp.task('watcher', function() {
    gulp.watch('bower_components/coffee/web.coffee', ['javascript', 'minify'])
    gulp.watch('bower_components/less/web.less', ['css'])
})

gulp.task('default', function() {
    gulp.start('css', 'javascript', 'minify', 'watcher')
})