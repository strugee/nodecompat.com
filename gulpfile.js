var gulp = require('gulp');
var jade = require('gulp-jade');

gulp.task('html', function() {
	return gulp.src('src/*.jade')
		   .pipe(jade({ data: require('./data/nodecompat-data.json') }))
	           .pipe(gulp.dest('dist'));
});
