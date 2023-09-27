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
const imagemin = require('gulp-imagemin');
const webpcss = require("gulp-webpcss");
const svgSprite = require('gulp-svg-sprite');

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
		img: `${sourse_folder}img/**/*.{jpg, png, svg, ico, webp}`,
		svg: `${sourse_folder}iconsprite/**/*.svg`,
	},
	out: {
		html: `${project_folder}`,
		script: `${project_folder}scripts`,
		css: `${project_folder}styles`,
		fonts: `${project_folder}fonts`,
		img: `${project_folder}img`,
		icons: `${project_folder}icons`,
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
		.pipe(webpcss({
			baseClass: '.webp',
			replace_from: /\.(png|jpg|jpeg)/,
			replace_to: '.webp',
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
		.pipe(concat('main.js'))
		.pipe(dest(paths.out.script))
		.pipe(MbrowserSync.stream())
}

// watch all
function TstartWatch() {
	watch([paths.entry.html], THtml);
	watch([paths.entry.sass], TSass);
	watch([paths.entry.script], TScripts);
	watch([paths.entry.img], TImages);
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

// images
function TImages() {
	return src(paths.entry.img)
		.pipe(webp({
			quality: 70
		}))
		.pipe(dest(paths.out.img))
		.pipe(src(paths.entry.img))
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			interlaced: true,
			optimizationLevel: 3, // 0 to 7
		}))
		.pipe(dest(paths.out.img))
		.pipe(MbrowserSync.stream())
}

// icons svg
function TSpriteIcon() {
	return src(paths.entry.svg)
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../sprite.svg",
					example: true
				}
			}
		}))
		.pipe(dest(paths.out.icons))
}

// delete page dist
function Tclean() {
	return src(paths.clean, { read: false })
		.pipe(clean(paths.clean))
}

exports.live = Tbrowsersync;
exports.clean = Tclean;
exports.sprite = TSpriteIcon;
exports.fonts = series(TFontfConverTowoff, TFontfConverTowoff2);
exports.build = series(THtml, TScripts, TSass, TFontfConverTowoff, TFontfConverTowoff2, TImages);
exports.dev = series(THtml, TScripts, TSass, TFontfConverTowoff, TFontfConverTowoff2, parallel(Tbrowsersync, TstartWatch, TImages));