var gulp = require('gulp');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var rename = require('gulp-rename');
var ghPages = require('gulp-gh-pages');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var http = require('http');
var ecstatic = require('ecstatic');

gulp.task('html', function() {
	return gulp.src('src/*.jade')
		   .pipe(jade({ data: require('./data/nodecompat-data.json') }))
	           .pipe(gulp.dest('dist'));
});

gulp.task('css', function() {
	return gulp.src('src/styles/*.styl')
	           .pipe(stylus())
	           .pipe(rename({extname: '.css'}))
	           .pipe(gulp.dest('dist/css'));
});

gulp.task('js', function () {
	var b = browserify({
		entries: 'src/scripts/main.js',
		debug: true,
		transform: ['es6-browserify']
	});
	return b.bundle()
	        .pipe(source('app.js'))
	        .pipe(gulp.dest('dist/scripts'));
});

gulp.task('images', function() {
	return gulp.src('src/images/*')
	           .pipe(gulp.dest('dist/images'));
});

gulp.task('misc', function() {
        return gulp.src(['CNAME', 'src/misc/*'])
                   .pipe(gulp.dest('dist/'));
});

gulp.task('build', ['html', 'css', 'js', 'images', 'misc']);

gulp.task('deploy', ['build'], function() {
	return gulp.src('dist/**/*')
	           .pipe(ghPages());
});

gulp.task('serve', ['watch'], function() {
	http.createServer(
		ecstatic({ root: __dirname + '/dist' })
	).listen(process.env.PORT || 8080);
});

gulp.task('watch', ['build'], function() {
	gulp.watch('src/index.jade', ['html']);
	gulp.watch('data/nodecompat-data.json', ['html']);
	gulp.watch('src/mixins/*.jade', ['html']);
	gulp.watch('src/styles/*.styl', ['css']);
	gulp.watch('src/scripts/*.js', ['js']);
	gulp.watch('src/images/*', ['images']);
});
