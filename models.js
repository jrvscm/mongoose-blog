const mongoose = require('mongoose');
const DateGenerator = require('random-date-generator');
//scheme to represent a blog post

const blogPostSchema = mongoose.Schema({
	title: {type: String, required: true},
	author: {
		firstName: String,
		lastName: String
	},
	content: {type: String, required: true},
	created: {type: String}
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
		created: DateGenerator.getRandomDate()
	};
}

const Post = mongoose.model('Post', blogPostSchema);

module.exports = {Post, DateGenerator};