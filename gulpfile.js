var gulp = require('gulp');
var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var rename = require('gulp-rename');
var ghPages = require('gulp-gh-pages');

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

gulp.task('images', function() {
	return gulp.src('src/images/*')
	           .pipe(gulp.dest('dist/images'));
});

gulp.task('build', ['html', 'css', 'images']);

gulp.task('deploy', ['build'], function() {
	return gulp.src('dist/**/*')
	           .pipe(ghPages());
});

gulp.task('watch', ['build'], function() {
	gulp.watch('src/index.jade', ['html']);
	gulp.watch('data/nodecompat-data.json', ['html']);
	gulp.watch('src/mixins/*.jade', ['html']);
	gulp.watch('src/styles/*.styl', ['css']);
	gulp.watch('src/images/*', ['images']);
});
