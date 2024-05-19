import Joi from 'joi';

const schema = Joi.object({
	name: Joi.string().min(3).max(100).trim().required().messages({
		'string.base': 'Name must be a string.',
		'string.empty': 'Please enter a name.',
		'string.min': 'Name must be at least 3 characters long.',
		'string.max': 'Name must be at most 100 characters long.'
	}),

	description: Joi.string().min(10).max(500).trim().required().messages({
		'string.base': 'Description must be a string.',
		'string.empty': 'Please enter a description.',
		'string.min': 'Description must be at least 10 characters long.',
		'string.max': 'Description must be at most 500 characters long.'
	}),

	price: Joi.number().integer().min(1).max(99).required().messages({
		'number.base': 'Price must be a number.',
		'number.empty': 'Please enter a price.',
		'number.min': 'Price must be at least 1.',
		'number.max': 'Price must be at most 99.'
	}),

	is_pizza: Joi.number().valid(0, 1).required().messages({
		'number.base': 'Is pizza must be a number.',
		'number.empty': 'Please enter a is pizza.',
		'number.min': 'Is pizza must be at least 0.',
		'number.max': 'Is pizza must be at most 1.'
	}),

	tags: Joi.alternatives()
		.try(Joi.array(), Joi.string(), Joi.number(), Joi.allow(null))
		.default([])
		.optional(),

	categoryName: Joi.string().optional(),

	businessId: Joi.number().optional(),

	categoryId: Joi.number().optional()
});

export default schema;
