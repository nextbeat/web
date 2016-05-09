var _               = require('lodash'),
    gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    nodemon         = require('gulp-nodemon'),
    uglify          = require('gulp-uglify'),
    browserify      = require('browserify'),
    watchify        = require('watchify'),
    babelify        = require('babelify'),
    envify          = require('envify/custom'),
    source          = require('vinyl-source-stream'),
    buffer          = require('vinyl-buffer'),
    livereload      = require('gulp-livereload');

const MAC_ENV = {
    NODE_ENV: 'mac',
    CLIENT_NAME: 'web',
    CLIENT_SECRET: 'CLIENT_SECRET',
    SESSION_SECRET: 'secret'
}

gulp.task('styles', function() {
    return gulp.src('client/layout/main.scss')
        .pipe(sass())
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('client/public/css'));
});

gulp.task('build', ['styles'], function() {
    return browserify('client/app.js')
        .transform(babelify, { presets: ['react', 'es2015']})
        .transform(envify())
        .bundle()
        .pipe(source('bundle.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('client/public/js'));
});

gulp.task('server', function() {
    nodemon({
        script: 'server/server.js',
        ext: 'html js',
        watch: 'server/*',
        env: MAC_ENV
    });
});

gulp.task('watch', ['styles'], function() {

    gulp.watch('client/layout/**/*.scss', ['styles']);

    livereload.listen(); 
    var opts = _.assign({}, watchify.args, { debug: true });
    var b = browserify('client/app.js', opts)
        .plugin(watchify, {ignoreWatch: ['**/node_modules/**', '**/bower_components/**']}) // Watchify to watch source file changes
        .transform(babelify, { presets: ['es2015', 'react'], plugins: ['transform-object-rest-spread'] }) // Babel tranforms
        .transform(envify(MAC_ENV));

    function bundle() {
        b.bundle()
        .pipe(source('bundle.js')) 
        .pipe(buffer())
        .pipe(gulp.dest('client/public/js'))
        .pipe(livereload());
    }

    bundle();
    b.on('update', bundle);
});

gulp.task('default', ['watch', 'server']);

