import gulp from 'gulp';
import changed from 'gulp-changed';

import htmlminifier from 'gulp-html-minifier-terser';

import autoPrefixer from 'autoprefixer';
import cssnano from 'cssnano';
import GulpPostCss from 'gulp-postcss';
import gulpSass from 'gulp-sass';
import postcssPresetEnv from 'postcss-preset-env';
import dartSass from 'sass';

import babel from 'gulp-babel';
import GulpConcat from 'gulp-concat';
import GulpTerser from 'gulp-terser';

// +++++++++ SVG Start ++++++++++
import svgSprite from 'gulp-svg-sprite';
import svgMin from 'gulp-svgo';

const { src, dest, watch, series } = gulp;
const sass = gulpSass(dartSass);

const browsersync = require('browser-sync').create();

// +++++++++ PATH ++++++++++++
const path = {
  html: {
    src: './src/index.html',
    dest: './build/',
    pro: '.',
  },
  css: {
    src: ['./src/assets/scss/style.scss'],
    dest: './build/assets/css/',
    pro: './assets/css/',
  },

  js: {
    src: [
      './src/assets/js/dom-selector.js',
      './src/assets/js/component.js',
      './src/assets/js/sprite.js',
      './src/assets/js/main.js',
    ],
    dest: './build/assets/js/',
    pro: './assets/js/',
  },
  img: {
    srcJpgPng: ['./src/assets/img/*.{jpg,png}'],
    srcSvg: ['./src/assets/img/SVG/*.svg'],
    destJpgPng: './build/assets/img/',
    destSvg: './build/assets/img/SVG/',
    proJpgSvg: './assets/img/',
    proSvg: './assets/img/SVG',
  },
  screenshot: {
    src: './src/screenshot/*.{jpg,png}',
    dest: './build/assets/screenshot/',
    pro: './dist/assets/screenshot/',
  },
};

const config = {
  mode: {
    symbol: {
      inline: true,
      dest: '.',
      sprite: 'sprite.svg',
    },
  },
  shape: {
    dest: '.',
  },
};
export function svgTask() {
  return src(path.img.srcSvg)
    .pipe(svgMin())
    .pipe(svgSprite(config))
    .pipe(dest(path.img.destSvg));
}

export function svgPro() {
  return src(path.img.srcSvg)
    .pipe(svgMin())
    .pipe(svgSprite(config))
    .pipe(dest(path.img.proSvg));
}
// +++++++++ IMAGE Start ++++++++++

export function imgTask() {
  return src(path.img.srcJpgPng)
    .pipe(changed(path.img.destJpgPng))
    .pipe(dest(path.img.destJpgPng));
}

export function imgPro() {
  return src(path.img.srcJpgPng).pipe(dest(path.img.proJpgSvg));
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
      }),
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
  return src(path.css.src, {
    sourcemaps: true,
  })
    .pipe(changed(path.css.dest))
    .pipe(sass())
    .pipe(
      dest(path.css.dest, {
        sourcemaps: '.',
      }),
    );
}

export function cssPro() {
  return src(path.css.src, {
    sourcemaps: true,
  })
    .pipe(changed(path.css.dest))
    .pipe(sass().on('error', sass.logError))
    .pipe(GulpPostCss(plugins))
    .pipe(
      dest(path.css.pro, {
        sourcemaps: '.',
      }),
    );
}

// +++++++++ javaScript Start ++++++++++++
export function jsTask() {
  return src(path.js.src, {
    sourcemaps: true,
  })
    .pipe(changed(path.js.dest))
    .pipe(GulpConcat('script.js'))
    .pipe(
      dest(path.js.dest, {
        sourcemaps: '.',
      }),
    );
}

export function jsPro() {
  return src(path.js.src, {
    sourcemaps: true,
  })
    .pipe(changed(path.js.dest))
    .pipe(GulpConcat('script.js'))
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      }),
    )
    .pipe(GulpTerser())
    .pipe(
      dest(path.js.pro, {
        sourcemaps: '.',
      }),
    );
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

// +++++++++ Watch Task +++++++++++
function watchTask() {
  watch(
    ['./src/*.html', './src/assets/scss/**/*.scss', './src/assets/js/**/*.js'],
    series(htmlTask, cssTask, jsTask, browsersyncReload),
  );
}

// Default Gulp task
const build = series(
  gulp.parallel(svgTask, imgTask, htmlTask, cssTask, jsTask, browsersyncServe),
  watchTask,
);
export default build;

// Distribution Gulp Task
export const dist = series(
  gulp.parallel(svgPro, imgPro, htmlPro, cssPro, jsPro),
);
