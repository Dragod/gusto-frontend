import Joi from 'joi';

const schema = Joi.object({
	tag_name: Joi.string().min(2).max(8).trim().required().messages({
		'string.base': 'Tag name must be a string.',
		'string.empty': 'Please enter a tag name.',
		'string.min': 'Tag name must be at least 2 characters long.',
		'string.max': 'Tag name must be at most 8 characters long.'
	}),

	description: Joi.string().min(6).max(100).trim().empty('').optional().messages({
		'string.base': 'Description must be a string.',
		'string.empty': 'Please enter a description.',
		'string.min': 'Description must be at least 6 characters long.',
		'string.max': 'Description must be at most 100 characters long.'
	}),

	id: Joi.number().integer().positive().optional()
});

export default schema;
