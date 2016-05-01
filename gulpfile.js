var gulp = require('gulp');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var rename = require('gulp-rename');

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

gulp.task('build', ['html', 'css']);

gulp.task('watch', ['build'], function() {
	gulp.watch('src/index.jade', ['html']);
	gulp.watch('src/mixins/*.jade', ['html']);
	gulp.watch('src/styles/*.styl', ['css']);
});
