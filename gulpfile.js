const gulp = require('gulp')
const del = require('del')
const cheerio = require('gulp-cheerio')
const clean = require('gulp-cheerio-clean-svg')
const rename = require('gulp-rename')
const svgmin = require('gulp-svgmin')
const path = require('path')

const config = {
  src: {
    icons: './assets/icons'
  },
  dest: {
    iconsHTML: './_includes/iconsHTML'
  },
}

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
      const className = `{% if mod %}{{ mod }} {% endif %}icon icon--${iconName}`

      svg.attr('class', className)
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
