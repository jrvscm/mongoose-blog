const mongoose = require('mongoose');

//scheme to represent a blog post

const blogPostSchema = mongoose.Schema({
	title: {type: String, required: true},
	author: {
		firstName: String,
		lastName: String
	},
	content: {type: String, required: true},
	created: {type: Date, default: Date.now}
});

//virtual fullname 
blogPostSchema.virtual('fullNameString').get(function() {
	return `${this.author.firstName} ${this.author.lastName}`.trim()});


// this will be available on all instances o{f the model
blogPostSchema.methods.apiRepr = function() {

	return {
		title: this.title,
		content: this.content,
		author: this.fullNameString,
		created: this.created
	};
}

const Post = mongoose.model('Post', blogPostSchema);

module.exports = {Post, DateGenerator};