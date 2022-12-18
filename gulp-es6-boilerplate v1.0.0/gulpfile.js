'use strict';

// // https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
const gulp = require('gulp');
const { src, dest, watch, series } = require('gulp');
const htmlmin = require('gulp-html-minifier-terser');
const sass = require('gulp-sass')(require('sass'));
const changed = require('gulp-changed');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const concat = require('gulp-concat');
const terser = require('gulp-terser');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const browsersync = require('browser-sync').create();

const path = {
  html: {
    src: './index.html',
    dest: './dist/',
  },
  css: {
    src: ['./scss/style.scss'],
    dest: './dist/assets/css/',
  },

  js: {
    src: ['./js/component.js', './js/dom-selector.js', './js/main.js'],
    dest: './dist/assets/js/',
  },
  img: {
    src: ['./img/*.{jpg,png}'],
    dest: './dist/assets/img/',
  },
  screenshot: {
    src: './screenshot/*.{jpg,png}',
    dest: './dist/assets/screenshot/',
  },
};

// IMAGE Task

function imgTask() {
  return src(path.img.src)
    .pipe(changed(path.img.dest))
    .pipe(webp({ quality: 50 }))
    .pipe(dest(path.img.dest));
}

//SCREENSHOT Task

function scrshotTask() {
  return src(path.screenshot.src).pipe(webp()).pipe(dest(path.screenshot.dest));
}

//HTML Task

function htmlTask() {
  return src(path.html.src)
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        preserveLineBreaks: false,
        removeComments: true,
      })
    )
    .pipe(dest(path.html.dest));
}

// Sass Task

function scssTask() {
  const plugins = [
    autoprefixer({
      flexbox: false,
      cascade: false,
    }),
    cssnano(),
  ];
  return src(path.css.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(plugins))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(path.css.dest));
}

// JavaScript Task

function jsTask() {
  return src(path.js.src)
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(concat('script.js'))
    .pipe(terser())
    .pipe(sourcemaps.write('.'))
    .pipe(dest(path.js.dest));
}

// Browsersync Tasks

function browsersyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: './dist',
    },
  });
  cb();
}
function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

// Watch Task
function watchTask() {
  watch(
    ['./*.html', './scss/**/*.scss', './js/**/*.js'],
    series(htmlTask, scssTask, jsTask, browsersyncReload)
  );
}

//Gulp Tasks
exports.scssTask = scssTask;
exports.jsTask = jsTask;
exports.htmlTask = htmlTask;
exports.imgTask = imgTask;
exports.scrshotTask = scrshotTask;

// Default Gulp task
exports.default = series(
  gulp.parallel(imgTask, htmlTask, scssTask, jsTask, browsersyncServe),
  watchTask
);
