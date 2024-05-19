import Joi from 'joi';

const schema = Joi.object({
	category_name: Joi.string().min(4).max(100).trim().required().messages({
		'string.base': 'Categotry name must be a string.',
		'string.empty': 'Please enter a category name.',
		'string.min': 'Category name must be at least 4 characters long.',
		'string.max': 'Category name must be at most 100 characters long.'
	}),
	id: Joi.number().integer().positive().optional()
});

export default schema;
