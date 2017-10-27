const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Post} = require('./models');

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());


//GET requests to /blogposts return all posts

app.get('/blogposts', (req, res) => {
	Post
	.find()
	.then(posts => {
		res.json({
			posts: posts.map(
				(index) => index.apiRepr())
		});
	})
	.catch(
		err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});


app.get('/blogposts/:id', (req, res) => {
	Post
	.findById(req.params.id)
	.then(post => res.json(post.apiRepr()))
	.catch(err => {
		console.error(err);
			res.status(500).json({message: 'Internal server error'})
	});
});

app.post('/blogposts', (req, res) => {
	const requiredFields = ['title', 'content', 'author'];
	for(let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if(!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`
			console.error(message);
		}
	}

	Post
	.create({
		title: req.body.title,
		content: req.body.content,
		author: req.body.author,
	})
	.then(
		post => res.status(201).json(post.apiRepr()))
	.catch(err => {
		console.error(err);
		res.status(500).json({message: 'Internal server error'});
	});
});

app.put(`/blogposts/:id`, (req, res) => {
	if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
		const message = (
			`Request path id (${req.params.id}) and request body id ` +
			`(${req.body.id}) must match`);
		console.error(message);
		return res.status(400).json({message: message});
	}

	const toUpdate = {};
	const updateableFields =['title', 'content', 'author'];

	updateableFields.forEach(field => {
		if (field in req.body) {
			toUpdate[field] = req.body[field];
		}
	});

	Post
	.findByIdAndUpdate(req.params.id, {$set: toUpdate})
	.then(post => res.status(204).end())
	.catch(err => res.status(500).json({message: 'Internal server error'}));
});

app.delete(`/blogposts/:id`, (req, res) => {
	Post
	.findByIdAndRemove(req.params.id)
	.then(post => res.status(204).end())
	.catch(err => res.status(500).json({message: `Internal server error`}));
});

app.use('*', function(req, res) {
	res.status(404).json({message: "Not found"})
});

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {

	return new Promise((resolve, reject) => {
	mongoose.connect(databaseUrl, err => {
		if (err) {
			return reject(err);
		}
		server = app.listen(port, () => {
			console.log(`Your app is listening on port ${port}`);
			resolve();
		})
		.on('error', err => {
			mongoose.disconnect();
			reject(err);
			});
		});
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if(err) {
					return reject(err);
				}

				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};