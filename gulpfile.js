var gulp        = require('gulp');
var babel       = require('gulp-babel');
var uglify      = require('gulp-uglify');
var concat      = require('gulp-concat');
var postcss     = require('gulp-postcss');
var cssnano     = require('cssnano');
var plumber     = require('gulp-plumber');
var notify      = require('gulp-notify');
var rimraf      = require('rimraf');
var runSequence = require('run-sequence');

gulp.task('build', function(cb) {
    runSequence('clean', ['scripts', 'styles'], cb);
});

gulp.task('clean', function(cb) {
    rimraf('dist', cb);
});

gulp.task('scripts', function() {
    return gulp.src('src/assets/js/*.js')
        .pipe(plumber({
            errorHandler: notify.onError(err => ({
                title: 'scripts',
                message: err.toString()
            }))
        }))
        .pipe(babel())
        .pipe(concat('ymaps-list.js'))
        .pipe(uglify({
            mangle: {
                keep_fnames: true
            },
            compress: {
                unsafe: false,
                unsafe_comps: false,
                unsafe_Func: false,
                unsafe_math: false,
                unsafe_proto: false,
                unsafe_regexp: false,
                typeofs: false,
                reduce_vars: false,
                reduce_funcs: false,
                pure_getters: true,
                properties: false,
                collapse_vars: false
            }
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('styles', function() {
    return gulp.src('src/assets/css/*.css')
        .pipe(plumber({
            errorHandler: notify.onError(err => ({
                title: 'styles',
                message: err.toString()
            }))
        }))
        .pipe(postcss([
            cssnano({
                zindex: false,
                autoprefixer: true,
                reduceIdents: false
            })
        ]))
        .pipe(gulp.dest('dist/'));
});