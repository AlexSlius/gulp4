const { src, dest, parallel, series, watch } = require("gulp");
const MbrowserSync = require("browser-sync").create();
const Msass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const ttf2woff2 = require('gulp-ttf2woff2');
const ttf2woff = require('gulp-ttf2woff');
const webp = require('gulp-webp');
const fileinclude = require('gulp-file-include');
const webpHTML = require('gulp-webp-html');
const clean = require('gulp-clean');
const babel = require('gulp-babel');

// ways
const sourse_folder = '#app/';
const project_folder = 'dist/';

const paths = {
	entry: {
		html: `${sourse_folder}**/*.html`,
		htmlNoComponent: `!${sourse_folder}**/_*.html`,
		script: `${sourse_folder}scripts/**/*.js`,
		sass: `${sourse_folder}styles/main.scss`,
		fonts: `${sourse_folder}fonts/**/*.ttf`,
		img: `${sourse_folder}img/**/*.{jpg, png, svg, ico, webp}`
	},
	out: {
		html: `${project_folder}`,
		script: `${project_folder}scripts`,
		css: `${project_folder}styles`,
		fonts: `${project_folder}fonts`,
		img: `${project_folder}img`
	},
	clean: `./${project_folder}`
};

// live server
function Tbrowsersync() {
	MbrowserSync.init({
		server: { baseDir: './dist' },
		notify: false,
		online: true
	})
}

// styles
function TSass() {
	return src(paths.entry.sass)
		.pipe(Msass().on('error', Msass.logError))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 10 versions'], grid: true
		}))
		.pipe(concat('main.css'))
		.pipe(dest(paths.out.css))
		.pipe(MbrowserSync.stream())
}

// html
function THtml() {
	return src([paths.entry.html, paths.entry.htmlNoComponent])
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(webpHTML())
		.pipe(dest(paths.out.html))
		.pipe(MbrowserSync.stream())
}

// scripts
function TScripts() {
	return src([paths.entry.script])
		.pipe(fileinclude())
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(concat('main.js'))
		.pipe(dest(paths.out.script))
		.pipe(MbrowserSync.stream())
}

// watch all
function TstartWatch() {
	watch([paths.entry.html], THtml);
	watch([paths.entry.sass], TSass);
	watch([paths.entry.script], TScripts);
}

// fonts woff
function TFontfConverTowoff() {
	return src([paths.entry.fonts])
		.pipe(ttf2woff())
		.pipe(dest(paths.out.fonts))
}

// fonts woff2
function TFontfConverTowoff2() {
	return src([paths.entry.fonts])
		.pipe(ttf2woff2())
		.pipe(dest(paths.out.fonts))
}

// image convert webp
function TImageConverToWebp() {
	return src([paths.entry.img])
		.pipe(webp())
		.pipe(dest(paths.out.img))
}

function Tclean() {
	return src(paths.clean, { read: false })
		.pipe(clean(paths.clean))
}

exports.live = Tbrowsersync;
exports.images = TImageConverToWebp;
exports.clean = Tclean;
exports.fonts = series(TFontfConverTowoff, TFontfConverTowoff2);
exports.build = series(THtml, TScripts, TSass, TFontfConverTowoff, TFontfConverTowoff2);
exports.dev = series(THtml, TScripts, TSass, TFontfConverTowoff, TFontfConverTowoff2, parallel(Tbrowsersync, TstartWatch));