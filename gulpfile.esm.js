import gulp from 'gulp';
const { src, dest, watch, series } = gulp;
import changed from 'gulp-changed';

import htmlminifier from 'gulp-html-minifier-terser';

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import GulpPostCss from 'gulp-postcss';
import autoPrefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcssPresetEnv from 'postcss-preset-env';

import babel from 'gulp-babel';
import GulpConcat from 'gulp-concat';
import GulpTerser from 'gulp-terser';

const browsersync = require('browser-sync').create();

//+++++++++ PATH ++++++++++++
const path = {
  html: {
    src: './src/index.html',
    dest: './build/',
    pro: './dist',
  },
  css: {
    src: ['./src/assets/scss/style.scss'],
    dest: './build/assets/css/',
    pro: './dist/assets/css/',
  },

  js: {
    src: [
      './src/assets/js/dom-selector.js',
      './src/assets/js/component.js',
      './src/assets/js/main.js',
    ],
    dest: './build/assets/js/',
    pro: './dist/assets/js/',
  },
  img: {
    src: ['./src/assets/img/*.{jpg,png}'],
    srcAll: ['./src/assets/img/*'],
    dest: './build/assets/img/',
    pro: './dist/assets/img/',
  },
  screenshot: {
    src: './src/screenshot/*.{jpg,png}',
    dest: './build/assets/screenshot/',
    pro: './dist/assets/screenshot/',
  },
};

// +++++++++ IMAGE Start ++++++++++

export function imgTask() {
  return src(path.img.srcAll)
    .pipe(changed(path.img.dest))
    .pipe(dest(path.img.dest));
}

export function imgPro() {
  return src(path.img.srcAll).pipe(dest(path.img.pro));
}

// ++++++++++ HTML Start +++++++++++++
export function htmlTask() {
  return src(path.html.src).pipe(dest(path.html.dest));
}

export function htmlPro() {
  return src(path.html.src)
    .pipe(
      htmlminifier({
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true,
        preserveLineBreaks: false,
        removeComments: true,
      })
    )
    .pipe(dest(path.html.pro));
}

// +++++++++ SASS Start ++++++++++++
const plugins = [
  autoPrefixer({
    add: true,
    flexbox: false,
    grid: false,

    cascade: false,
  }),
  cssnano(),
  postcssPresetEnv({
    stage: 2,
    minimumVendorImplementations: 2,
  }),
];
export function cssTask() {
  return src(path.css.src, { sourcemaps: true })
    .pipe(changed(path.css.dest))
    .pipe(sass())
    .pipe(dest(path.css.dest, { sourcemaps: '.' }));
}

export function cssPro() {
  return src(path.css.src, { sourcemaps: true })
    .pipe(changed(path.css.dest))
    .pipe(sass().on('error', sass.logError))
    .pipe(GulpPostCss(plugins))
    .pipe(dest(path.css.pro, { sourcemaps: '.' }));
}

// +++++++++ javaScript Start ++++++++++++
export function jsTask() {
  return src(path.js.src, { sourcemaps: true })
    .pipe(changed(path.js.dest))
    .pipe(GulpConcat('script.js'))
    .pipe(dest(path.js.dest, { sourcemaps: '.' }));
}

export function jsPro() {
  return src(path.js.src, { sourcemaps: true })
    .pipe(changed(path.js.dest))
    .pipe(GulpConcat('script.js'))
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(GulpTerser())
    .pipe(dest(path.js.pro, { sourcemaps: '.' }));
}

// +++++++++ Browse-sync Start ++++++++++++
function browsersyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: './build',
    },
    port: 8080,
    ui: {
      port: 9090,
    },
  });
  cb();
}
function browsersyncReload(cb) {
  browsersync.reload();
  cb();
}

//+++++++++ Watch Task +++++++++++
function watchTask() {
  watch(
    [
      './src/assets/img/*.{jpg,png}',
      './src/*.html',
      './src/assets/scss/**/*.scss',
      './src/assets/js/**/*.js',
    ],
    series(imgTask, htmlTask, cssTask, jsTask, browsersyncReload)
  );
}

// Default Gulp task
const build = series(
  gulp.parallel(imgTask, htmlTask, cssTask, jsTask, browsersyncServe),
  watchTask
);
export default build;

// Distribution Gulp Task
export const dist = series(gulp.parallel(imgPro, htmlPro, cssPro, jsPro));
