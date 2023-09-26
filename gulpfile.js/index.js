const { src, dest, parallel, series, watch } = require("gulp");
const MbrowserSync = require("browser-sync").create();
const Msass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const ttf2woff2 = require('gulp-ttf2woff2');
const ttf2woff = require('gulp-ttf2woff');
const webp = require('gulp-webp');

// ways
const sourse_folder = '#app/';
const project_folder = 'dist/';

const paths = {
	entry: {
		sass: `${sourse_folder}styles/main.scss`,
		fonts: `${sourse_folder}fonts/**/*.ttf`,
		img: `${sourse_folder}img/**/*.{jpg, png, svg, ico, webp}`
	},
	out: {
		css: `${project_folder}styles`,
		fonts: `${project_folder}fonts`,
		img: `${project_folder}img`
	}
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

function TJavaScripts() {
	
}

// watch all
function TstartWatch() {
	watch([paths.entry.sass], TSass);
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

exports.live = Tbrowsersync;
exports.images = TImageConverToWebp;
exports.fonts = series(TFontfConverTowoff, TFontfConverTowoff2);
exports.dev = parallel(TSass, Tbrowsersync, TstartWatch);