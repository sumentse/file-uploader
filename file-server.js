'use strict';

const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const jade = require('jade');
const moment = require('moment');

const storage = multer.diskStorage({
	destination:'./uploads',
	filename: (req, file, cb)=>{
		cb(null, file.originalname);
	}
})

const upload = multer({storage});

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/files", express.static(path.join(__dirname, 'uploads')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
const port = 1275;

app.get('/', (req, res)=>{
  res.render('index');
});

app.get("/files",(req,res)=>{
	fs.readdir(path.join(__dirname,"uploads"), (err,files)=>{

		let fileItems = []
		let totalSize = 0;
		files.shift();
		files.sort();

		for(let i = 0; i < files.length; i++){

			fs.stat(path.join(__dirname, "uploads", files[i]),(err, stats)=>{
				let {size,mtime} = stats;
				fileItems.push({name: files[i],mtime:moment(mtime).format('M/D/YYYY h:mm a'),size});
				totalSize += size;
				if(files.length === fileItems.length){
					res.render('files', {files: fileItems, totalSize});
				}
			});
			
		}


	});
});

app.post("/delete/:filename", (req,res)=>{
	fs.unlink(path.join(__dirname,"uploads",req.params.filename),(err)=>{
		if(err) return console.log(err);
		res.redirect("/files");
	});
});


app.post('/upload', upload.single('file'), (req,res)=>{
	/* example output:
	{ title: 'abc' }
	 */
	// console.log(req.file); //form files
	/* example output:
            { fieldname: 'upl',
              originalname: 'grumpy.png',
              encoding: '7bit',
              mimetype: 'image/png',
              destination: './uploads/',
              filename: '436ec561793aa4dc475a88e84776b1b9',
              path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
              size: 277056 }
	 */
	res.status(200).send("File Successfully Uploaded");
});

app.listen( port, ()=>{ 
	console.log('listening on port '+ port); 
} );