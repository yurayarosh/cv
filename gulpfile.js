const gulp = require('gulp')
const sass = require('gulp-sass')
const browserSync = require('browser-sync')
const del = require('del')
const cheerio = require('gulp-cheerio')
const clean = require('gulp-cheerio-clean-svg')
const rename = require('gulp-rename')
const svgmin = require('gulp-svgmin')
const path = require('path')

const config = {
  src: {
    root: './src',
    sass: './src/sass',
    icons: './src/icons'
  },
  dest: {
    root: './build',
    css: './build/css',
    iconsHTML: './src/iconsHTML'
  },
}

// ==================================== clean =====================================
gulp.task('clean', () => del([
  `${config.dest.root}/**/*.*`,
]))

// ==================================== copy =====================================
gulp.task('copy', () => gulp
  .src(`${config.src.root}/*.*`)
  .pipe(gulp.dest(config.dest.root)))
gulp.task('copy:watch', () => gulp
  .watch(`${config.src.root}/**/*.html`, gulp.series('copy')))

// ==================================== sass =====================================
gulp.task('sass',  () => gulp
  .src(`${config.src.sass}/**/*.sass`)
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest(config.dest.css))
)
gulp.task('sass:watch', () => gulp
  .watch(`${config.src.sass}/**/*.sass`, gulp.parallel('sass')))

// ==================================== server =====================================
const server = browserSync.create()
gulp.task('server', done => {
  server.init({
    server: {
      baseDir: config.dest.root,
    },
    files: [
      `${config.dest.root}/*.html`,
      `${config.dest.css}/*.css`,
    ],
    port: 8080,
    notify: false,
    open: false,
  })
  done()
})

// ==================================== svg icons =====================================
gulp.task('svgicons:clean', () => del([
  `${config.dest.iconsHTML}/*.html`,
]))

gulp.task('svgicons:create', () => gulp
  .src(`${config.src.icons}/*.svg`)
  .pipe(svgmin({
    js2svg: {
      pretty: true,
    },
    plugins: [{
      removeXMLProcInst: true,
    }, {
      removeComments: true,
    }, {
      removeDoctype: true,
    }, {
      removeXMLNS: true,
    }, {
      convertStyleToAttrs: false,
    }],
  }))
  .pipe(cheerio(clean({
    attributes: [
      'id',
      'fill*',
      'clip*',
      'stroke*',
    ],
  })))
  .pipe(cheerio({
    run: ($, file) => {
      const iconName = path.basename(file.relative, path.extname(file.relative))
      const svg = $('svg')
      const svgStyle = svg.attr('style')

      if (svgStyle && svgStyle.indexOf('enable-background') !== -1) {
        svg.removeAttr('style')
      }

      const h = +svg.attr('height') || +svg.attr('viewBox').split(' ')[3]
      const w = +svg.attr('width') || +svg.attr('viewBox').split(' ')[2]
      if (!svg.attr('viewBox')) {
        svg.attr('viewBox', `0 0 ${w} ${h}`)
      }
      const height = '1em'
      const width = `${(w / h).toFixed(3)}em`

      svg.attr('class', `icon icon-${iconName}`)
      svg.attr('width', width)
      svg.attr('height', height)
    },
    parserOptions: { xmlMode: false },
  }))
  .pipe(rename({
    prefix: '_',
    extname: '.html',
  }))
  .pipe(gulp.dest(config.dest.iconsHTML)))

gulp.task('svgicons', gulp.series(['svgicons:clean', 'svgicons:create']))

gulp.task('svgicons:watch', () => gulp
  .watch(`${config.src.icons}/**/*.svg`, gulp.parallel('svgicons')))

// ==================================== main init =====================================
gulp.task(
  'build',
  gulp.parallel(
    'clean',
    'copy',
    'sass',
    'svgicons'
  ),
)
gulp.task(
  'watch',
  gulp.parallel(
    'copy:watch',
    'sass:watch',
    'svgicons:watch'
  ),
)

gulp.task('default', gulp.series(['build', 'server', 'watch']))
