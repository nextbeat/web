var _               = require('lodash'),
    gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    autoprefixer    = require('gulp-autoprefixer'),
    nodemon         = require('gulp-nodemon'),
    babel           = require('gulp-babel'),
    Cache           = require('gulp-file-cache'),
    uglify          = require('gulp-uglify'),
    browserify      = require('browserify'),
    watchify        = require('watchify'),
    babelify        = require('babelify'), // because this one's for browserify!!
    envify          = require('envify/custom'),
    source          = require('vinyl-source-stream'),
    buffer          = require('vinyl-buffer'),
    gutil           = require('gulp-util'),
    livereload      = require('gulp-livereload');

// const MAC_ENV = {
//     NODE_ENV: 'mac-dev',
//     CLIENT_NAME: 'api_client',
//     CLIENT_SECRET: 'xxxxxxx',
//     SESSION_SECRET: 'secret',
//     GOOGLE_ANALYTICS_ID: 'UA-78319133-2',
//     FACEBOOK_APP_ID: '1021249581291875'
// }

const MAC_ENV = {
    NODE_ENV: 'mac',
    CLIENT_NAME: 'web',
    CLIENT_SECRET: 'CLIENT_SECRET',
    SESSION_SECRET: 'secret',
    GOOGLE_ANALYTICS_ID: 'UA-78319133-2',
    FACEBOOK_APP_ID: '1021249581291875',
    VAPID_PUBLIC_KEY: 'BLrVGYGC0ovlpvCFINITEM_2dfUa57ywuxnuVAT5zBtT4_a4PQqq-E4H85G7xTiPc3EAlV4TaO6RokJ45oKwiVM',
}

const cache = new Cache();

gulp.task('styles', function() {
    return gulp.src('client/layout/main.scss')
        .pipe(sass())
        .pipe(autoprefixer('last 2 versions'))
        .pipe(gulp.dest('client/public/css'));
});

gulp.task('build', ['styles', 'server-compile', 'routes-compile'], function() {
    return browserify('client/app.js')
        .transform(babelify, { 
            presets: ['react', 'es2015'], 
            plugins: ['transform-object-rest-spread']
        })
        .transform(envify())
        .bundle()
        .pipe(source('bundle.min.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('client/public/js'));
});

// todo: single function for these
gulp.task('server-compile', function() {
    return gulp.src('./server/**/*.js')
        .pipe(cache.filter())
        .pipe(babel({ presets: ['react', 'es2015'] }))
        .pipe(cache.cache())
        .pipe(gulp.dest('./dist/server'))
});

gulp.task('routes-compile', function() {
    return gulp.src('./routes/**/*.js')
        .pipe(cache.filter())
        .pipe(babel({ presets: ['react', 'es2015'] }))
        .pipe(cache.cache())
        .pipe(gulp.dest('./dist/routes'))
});

gulp.task('server', function() {
    nodemon({
        script: 'server/server.js',
        ext: 'html js',
        watch: ['server/*', 'routes/*'],
        // tasks: ['server-compile', 'routes-compile'],
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

