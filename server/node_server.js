var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    fs = require('fs'),
    ffmpeg = require('fluent-ffmpeg');

var child    = require('child_process');
var path     = "./tmp/";

var counter  = 0;
var removed  = 0;
var m_socket = null;

console.log('start running.....');

server.listen(3001);

// app.get('/', function (req, res) 
// {
//     console.log(__dirname);
//     res.sendfile(__dirname + '/index.html');
// });
    // Add headers
// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8888');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });

io.sockets.on('connection', function (socket)
{
    m_socket = socket;
    console.log('connected');

    socket.on('render-frame', function (data) 
    {
        data.file = data.file.split(',')[1]; // Get rid of the data:image/png;base64 at the beginning of the file data
        
        var buffer  = new Buffer(data.file, 'base64');

        fs.writeFile(path + data.name + "-" + data.frame + ".jpg", buffer.toString('binary'), 'binary');

        counter ++;

        if(data.isEnd)
            create_video(data.name, data.width, data.height, data.user)
    });
});

function create_video(name, width, height, user)
{
    var ffmpeg  = require('fluent-ffmpeg');
    var proc    = new ffmpeg();
    
    console.log("Starting Convert...");

    // proc.setFfmpegPath("C:\\ffmpeg\\bin\\ffmpeg.exe");
    proc.addInput(path + name + "-%03d.jpg")
    .on('start', function(ffmpegCommand) 
    {

    })
    .on('progress', function(data) 
    {

    })
    .on('end', function() 
    {
        clear_file(name, 0);
        console.log('success');
        m_socket.emit("video_complete",
        {
            user : user,
            name : "result_video_" + user + ".mp4"
        });
    })
    .on('error', function(error) 
    {
        console.log(error);
    })

    .addInputOption('-framerate 15')
    .size(width + 'x' + height)
    .outputOptions(['-c:v libx264', '-r 30', '-pix_fmt yuv420p'])
    .output('result_video_' + user + '.mp4')
    .run();
}

function clear_file(name, num)
{
    var file_name = "";
    var frame_num = "";

    if(num < 10)
        frame_num = "00" + num;
    else if(num < 100)
        frame_num = "0" + num;
    else
        frame_num = num;

    file_name = path + name + "-" + frame_num + ".jpg";

    fs.exists(file_name, function(exists) 
    {
        if(exists) 
        {
            fs.unlink(file_name);
        }

        removed ++;

        if(removed <= counter)
        {
            clear_file(name, num + 1);
        }
    });
}