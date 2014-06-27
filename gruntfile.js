module.exports = function (grunt) {
  'use strict';
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      debug: {
        options: {
          port: 8000,
          livereload:true
        }
      }
    },
    watch: {
      scripts: {
        options:{livereload:true},
        files: ['js/**/*.js']
      },
      html: {
        options:{livereload:true},
        files: ['**/**.html']
      },
      css: {
        options:{livereload:true},
        files: ['css/**/*.css']      
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('server', ['connect:debug', 'watch']);
  grunt.registerTask('default', ['server']);
};