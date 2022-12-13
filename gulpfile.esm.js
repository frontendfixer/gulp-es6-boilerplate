import gulp from 'gulp';
const { src, dest, watch, series } = gulp;

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import GulpPostCss from 'gulp-postcss';
import autoPrefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcssPresetEnv from 'postcss-preset-env';

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
      './src/js/component.js',
      './src/js/dom-selector.js',
      './src/js/main.js',
    ],
    dest: './dist/assets/js/',
  },
  img: {
    src: ['./src/img/*.{jpg,png}'],
    dest: './dist/assets/img/',
  },
  screenshot: {
    src: './src/screenshot/*.{jpg,png}',
    dest: './dist/assets/screenshot/',
  },
};

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
// +++++++++ SASS End ++++++++++++

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
// +++++++++ Browse-sync End ++++++++++++

// Watch Task
function watchTask() {
  watch(
    [
      './src/img/*.{jpg,png}',
      './src/*.html',
      './src/scss/**/*.scss',
      './src/js/**/*.js',
    ],
    series(cssTask, browsersyncReload)
  );
}

//Gulp Tasks
// exports.cssTask = cssTask;
// // exports.jsTask = jsTask;
// exports.htmlTask = htmlTask;
// exports.imgTask = imgTask;
// exports.scrshotTask = scrshotTask;

const build = series(gulp.parallel(cssTask, browsersyncServe), watchTask);

// Default Gulp task
export default build;
