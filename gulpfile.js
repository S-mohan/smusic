/**
 * Created by smohan on 2016/11/15.
 */
"use strict";
const gulp = require('gulp'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    plumber = require('gulp-plumber'),
    cleanCss = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    order = require('gulp-order'),
    concat = require("gulp-concat"),
    header = require('gulp-header'),
    sourcemaps = require("gulp-sourcemaps"),
    babel = require("gulp-babel");

const pkg = require('./package.json');

const CONFIGS = {
    scss: {
        lineNumbers: true,
        //style : 'expanded',
        sourcemap: false
    },
    css: {
        advanced: true,
        keepBreaks: false,
        mediaMerging: true,
        keepSpecialComments: '*'
    },
    js: {
        mangle: true,
        compress: true,
        preserveComments: 'some'
    }
};

gulp.task('clean', () => {
    return gulp.src(['dist/', 'build/'])
        .pipe(clean());
});

//编译scss文件
gulp.task('compile:css', () => {

    return gulp.src('src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true,
            remove: true
        }))
        .pipe(gulp.dest('dist/css'))
});

//编译es6文件
gulp.task('compile:js', () => {
    return gulp.src('src/js/**/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: [
                ['es2015', {
                    modules: false,
                    loose: true
                }]
            ]
        }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest('dist/js'));
});

//编辑 => dist
gulp.task('compile', ['compile:js', 'compile:css']);

//banner
const Banner = [
    '/*!',
    ' * <%= pkg.name %> v<%= pkg.version %>',
    ' * <%= pkg.author %>',
    ' * The <%= pkg.license %> License (<%= pkg.license %>)',
    ' * https://smohan.net/lab/smusic',
    ' * <%= pkg.homepage%>',
    ' */',
    ''
].join('\n');

//min css
gulp.task('build:css', () => {
    return gulp.src('dist/css/smusic.css')
        .pipe(cleanCss(CONFIGS.css))
        .pipe(rename('smusic.min.css'))
        .pipe(header(Banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('build/'));
});

//concat && min js
gulp.task('build:js', () => {
    return gulp.src('dist/js/**/*.js')
        .pipe(order([
            'mo.js',
            'smusic.js',
        ]))
        .pipe(concat("smusic.min.js"))
        .pipe(uglify(CONFIGS.js))
        .pipe(header(Banner, {
            pkg: pkg
        }))
        .pipe(gulp.dest('build/'));
});

//min => build
gulp.task('build', ['build:js', 'build:css']);



gulp.task('watch', () => {
    gulp.watch('src/js/**/*.js', ['compile:js']);
    gulp.watch('src/scss/**/*.scss', ['compile:css']);
});

gulp.task('default', ['watch']);