var gulp = require("gulp"); //подключаем сам gulp
var sass = require("gulp-sass"); //подключаем sass
var plumber = require("gulp-plumber"); //подключаем плагин не дающий остановить ход исполнения команды при ошибке
var postcss = require("gulp-postcss");
var autpprefixer = require("autoprefixer"); //подключаем автопрефиксер
var server = require("browser-sync"); //подключаем браузер
var mqpacker = require("css-mqpacker"); //подключаем плагин объединяющий медиавыражения
var minify = require("gulp-csso"); //подключаем минификатор css
var rename = require("gulp-rename"); //подключаем плагин меняющий имя файла
var imagemin = require("gulp-imagemin"); //подключаем минификатор растровых изображений
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin"); //подключаем минификатор свг изображений
var run = require("run-sequence"); //плагин запускает команды поочередно(т.к нет синхронности)
var del = require("del"); // позволяет удалять файлы(для папки dist)


gulp.task("style", function() {
  gulp.src("sass/style.scss") //читает контент лежащий в файле style.sass
  .pipe(plumber()) //запрещает ошибкам останавливать ход исполнения команды
  .pipe(sass()) //компиляция в css
  .pipe(postcss([ 
    autpprefixer({browsers: [ // автопрефиксер
      "last 1 version",
      "last 2 Chrome versions",
      "last 2 Firefox versions",
      "last 2 Opera versions",
      "last 2 Edge versions"
    ]}),
    mqpacker({ //объединение медиавыраженией
      sort: true
    })
  ])) 
  .pipe(gulp.dest("css"))  //кладет скомпелированный из sass файл в папку css 
  .pipe(minify()) //минифицируем css
  .pipe(rename("style.min.css")) //переименовываем в style.min.css
  .pipe(gulp.dest("css")) // кладет неминифицированный css
  .pipe(server.reload({stream:true}));
});

gulp.task("serve", ["style"], function() { //выводим верстку в браузер, но перед этим запускается [style]
  server.init({
    server:"."
  });
  gulp.watch("sass/**/*.scss", ["style"]); //следит за изменениями во всех файлах *.sass в папке sass и во всех подпапках папки sass **
  gulp.watch ("*.html") //следит за изменениями в html
    .on("change", server.reload);
});
          
 gulp.task("images", function() {
   return gulp.src("img/**/*.{png,jpg,gif}")
     .pipe(imagemin([
     imagemin.optipng({optimizationLevel: 3}), // выбираем уровень оптимизации пнг
     imagemin.jpegtran({progressive: true}) //меняем способ загрузки жпг изображений с построчного на попиксельный
   ]))   
   .pipe(gulp.dest("dist/img"));
 }); 

gulp.task("symbols", function() {
  return gulp.src("img/icons/*.svg")
  .pipe(svgmin())
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("symbols.svg"))
  .pipe(gulp.dest("dist/img"));
});

gulp.task("build", function(fn) {
  run("clean", "copy", "style", "images", "symbols", fn); // запускаем команды поочередно
});
gulp.task("copy", function() { //запускаем копирование в продакшен папку
  return gulp.src ([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**",
    "*.html"    
  ], {
    base: "."
  })
   .pipe(gulp.dest("dist"));             
});

gulp.task('clean', function() {
  return del(['dist/**/*']);
});