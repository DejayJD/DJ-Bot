require("./environmentVars");
module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            scripts: {
                files: ['dist/**/*.js'],
                tasks: ["newer:scp"],
                option: {
                    debounceDelay: 1500,
                }
            },
        },
        ts: {
            default : {
                src: ["**/*.ts", "!node_modules/**/*.ts"]
            }
        },
        sftp: {
            dist: {
                files: {
                    "./": "dist/*.txt"
                },
                options: {
                    path: '/var/www/dj-bot/dist',
                    host: process.env.SERVER,
                    username: 'ec2-user',
                    privateKey: grunt.file.read(process.env.SERVER_KEY),
                    showProgress: true
                }
            }
        },
        scp: {
            options: {
                host: 'ec2-35-165-93-148.us-west-2.compute.amazonaws.com',
                username: 'ec2-user',
                privateKey: grunt.file.read('JDF_Key.pem')
            },
            your_target: {
                files: [{
                    cwd: 'dist/',
                    src: '**/*.js',
                    filter: 'isFile',
                    // path on the server
                    dest: '/var/www/dj-bot/dist'
                }]
            },
        }
    });
    grunt.event.on('watch', async function(action, filepath, target) {
        grunt.config('scp', {
            options: {
                host: 'ec2-35-165-93-148.us-west-2.compute.amazonaws.com',
                username: 'ec2-user',
                privateKey: grunt.file.read('JDF_Key.pem')
            },
            your_target: {
            files: [{
                cwd: 'dist/',
                src: filepath,
                filter: 'isFile',
                dest: '/var/www/dj-bot/dist'
            }]
        }});
    });
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks("grunt-ts");
    grunt.loadNpmTasks('grunt-scp');
    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-newer');
    // grunt.registerTask("default", ["ts"]);
};
