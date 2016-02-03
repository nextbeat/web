var _               = require('lodash'),
    gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    nodemon         = require('gulp-nodemon'),
    browserify      = require('browserify'),
    watchify        = require('watchify'),
    babelify        = require('babelify'),
    source          = require('vinyl-source-stream'),
    buffer          = require('vinyl-buffer'),
    livereload      = require('gulp-livereload');

gulp.task('styles', function() {
    return gulp.src('layout/main.scss')
        .pipe(sass())
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('public/css'));
});

gulp.task('build', ['styles'], function() {
    return browserify('app.js')
        .transform(babelify, { presets: ['react', 'es2015']})
        .bundle()
        .pipe(source('bundle.js')) // todo: uglify
        .pipe(buffer())
        .pipe(gulp.dest('public/js'));
});

gulp.task('server', function() {
    nodemon({
        script: 'server/server.js',
        ext: 'html js',
        ignore: ['components/*', 'public/js/bundle.js', 'containers/*', 'actions/*', 'reducers/*', 'store/*', 'middleware/*', 'schemas/*'],
        env: {
            NODE_ENV: 'mac',
            CLIENT_NAME: 'web',
            CLIENT_SECRET: 'CLIENT_SECRET'
        }
    });
});

gulp.task('watch', ['styles'], function() {

    gulp.watch('layout/**/*.scss', ['styles']);

    livereload.listen(); 
    var opts = _.assign({}, watchify.args, { debug: true });
    var b = browserify('app.js', opts)
        .plugin(watchify, {ignoreWatch: ['**/node_modules/**', '**/bower_components/**']}) // Watchify to watch source file changes
        .transform(babelify, { presets: ['es2015', 'react'], plugins: ['transform-object-rest-spread'] }); // Babel tranforms

    function bundle() {
        b.bundle()
        .pipe(source('bundle.js')) 
        .pipe(buffer())
        .pipe(gulp.dest('public/js'))
        .pipe(livereload());
    }

    bundle();
    b.on('update', bundle);
});

gulp.task('default', ['watch', 'server']);

