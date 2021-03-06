var gulp = require('gulp');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var rename = require('gulp-rename');
var ghPages = require('gulp-gh-pages');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var http = require('http');
var ecstatic = require('ecstatic');
var fs = require('fs');
var eos = require('end-of-stream');

gulp.task('html', function(cb) {
	// Start streaming files from disk early
	var stream = gulp.src('src/*.jade')

	// XXX should we like... be pulling this into the gulp stream or something? Idk
	fs.readFile('./data/nodecompat-data.json', function(err, buf) {
		if (err) return cb(err);

		var data = JSON.parse(buf.toString());

		stream.pipe(jade({ data: data }))
		      .pipe(gulp.dest('dist'));

		// XXX async-done uses {error: false}, maybe we should too?
		eos(stream, cb);
	});
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
        return gulp.src('src/misc/*')
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
