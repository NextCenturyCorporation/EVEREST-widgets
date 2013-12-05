// Generated on 2013-12-02 using generator-webapp 0.4.4
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // configurable paths
        yeoman: {
            base: './',
            widgets: 'src/widgets',
            components: 'src/components'
        },
        watch: {
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.widgets %>/**/*.html',
                    '<%= yeoman.widgets %>/**/*.css',
                    '<%= yeoman.widgets %>/**/*.js',
                    'test/**/*.js'
                ]
            },
            test: {
                files: [
                    '<%= yeoman.widgets %>/**/*.js',
                    'test/**/*.js'
                ],
                tasks: ['jasmine']
            }
        },
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '.tmp',
                        '<%= yeoman.base %>'
                    ]
                }
            },
            test: {
                options: {
                    base: [
                        '.tmp',
                        'test',
                        '<%= yeoman.widgets %>'
                    ]
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>',
                    livereload: false
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.widgets %>/scripts/{,*/}*.js',
                '!<%= yeoman.widgets %>/scripts/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },
        jasmine: {
            heatChart: {
                src: [
                    '<%= yeoman.widgets %>/heatChart/js/time.js'
                ],
                options: {
                    specs: [
                        'test/heatChart/time.spec.js'
                    ],
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfigFile: '<%= yeoman.widgets %>/heatChart/js/main.js'
                    }
                }
            }
        }
    });

    grunt.registerTask('serve', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', function() {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve']);
    });

    grunt.registerTask('test', function(target) {
        if (target) {
            grunt.task.run(['connect:test','jasmine:', 'watch:test']);
        } else {
            grunt.log.error('Please specify a widget target for jasmine.');
        }
    });

    grunt.registerTask('default', [
        'serve'
    ]);
};