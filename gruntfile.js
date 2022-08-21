module.exports = function(grunt) {
     
    grunt.initConfig({
  
        pkg: grunt.file.readJSON('package.json'),
  
        concat: {                        
            js: {
                options: {
                    stripBanners: true,
                    separator: ''
                },                
                src: [
                    './src/configure.js',
                    './src/binders.js',
                    '.src/adapters.js',
                    './src/formatters.js',
                    './src/web-component.js',
                    './src/wire-component.js',
                    './src/end.js'
                    ],
                dest: './dist/wire-webcomponents.dev.js'
            }                             
        },

        copy: {         
          ts: {
            src: './src/index.d.ts',
            dest: './dist/index.d.ts'
          },          
          package: {
            src: './package.npm.json',
            dest: './dist/package.json'
          },        
          readme: {
            src: './README.md',
            dest: './dist/README.md'
          },
          license: {
            src: './LICENSE.md',
            dest: './dist/LICENSE.md'
          }          
        },

        uglify: {
            wire: {
              options: {
                  banner: '/* <%= pkg.description %> v<%= pkg.version %> ' +
                  '(<%= grunt.template.today("yyyy-mm-dd") %>) ' +
                  '(c) 2016-<%= grunt.template.today("yyyy") %> Enterprise Blocks, Inc. ' +
                  'License details: <%= pkg.license %> */'
              },
              files: {
                  './dist/wire-webcomponents.js': ['./dist/wire-webcomponents.dev.js']
              }
            } 
          }
        
    });
  
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
  
    grunt.registerTask('default', ['concat', 'copy', 'uglify']);
  
  };