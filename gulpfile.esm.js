import gulp from 'gulp';
const { src, dest, watch, series } = gulp;

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
    dest: './dist/',
  },
  css: {
    src: ['./src/scss/style.scss'],
    dest: './dist/assets/css/',
  },

  js: {
    src: [
      './src/js/dom-selector.js',
      './src/js/component.js',
      './src/js/main.js',
    ],
    dest: './dist/assets/js/',
  },
  img: {
    src: ['./src/img/*.{jpg,png}'],
    srcAll: ['./src/img/*'],
    dest: './dist/assets/img/',
  },
  screenshot: {
    src: './src/screenshot/*.{jpg,png}',
    dest: './dist/assets/screenshot/',
  },
};

// +++++++++ IMAGE Start ++++++++++

export function imgTask() {
  return src(path.img.srcAll).pipe(dest(path.img.dest));
}

// ++++++++++ HTML Start +++++++++++++
export function htmlTask() {
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
    .pipe(dest(path.html.dest));
}

// +++++++++ SASS Start ++++++++++++
export function cssTask() {
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
  return src(path.css.src, { sourcemaps: true })
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(GulpPostCss(plugins))
    .pipe(dest(path.css.dest, { sourcemaps: '.' }));
}

// +++++++++ javaScript Start ++++++++++++
export function jsTask() {
  return src(path.js.src, { sourcemaps: true })
    .pipe(GulpConcat('script.js'))
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      })
    )
    .pipe(GulpTerser())
    .pipe(dest(path.js.dest, { sourcemaps: '.' }));
}

// +++++++++ Browse-sync Start ++++++++++++
function browsersyncServe(cb) {
  browsersync.init({
    server: {
      baseDir: './dist',
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
      './src/img/*.{jpg,png}',
      './src/*.html',
      './src/scss/**/*.scss',
      './src/js/**/*.js',
    ],
    series(imgTask, htmlTask, cssTask, jsTask, browsersyncReload)
  );
}

const build = series(
  gulp.parallel(imgTask, htmlTask, cssTask, jsTask, browsersyncServe),
  watchTask
);

// Default Gulp task
export default build;
