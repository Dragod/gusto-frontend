import Joi from 'joi';

const schema = Joi.object({
	name: Joi.string().min(3).max(100).trim().required().messages({
		'string.base': 'Name must be a string.',
		'string.empty': 'Please enter a name.',
		'string.min': 'Name must be at least 3 characters long.',
		'string.max': 'Name must be at most 100 characters long.'
	}),

	description: Joi.string().min(10).max(200).trim().empty('').optional().messages({
		'string.base': 'Description must be a string.',
		'string.empty': 'Please enter a description.',
		'string.min': 'Description must be at least 10 characters long.',
		'string.max': 'Description must be at most 500 characters long.'
	}),

	price: Joi.number().greater(0).less(99).required().messages({
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

	//tags: Joi.array().allow(null).default([]).optional(),

	// tags: Joi.alternatives()
	// 	.try(Joi.array(), Joi.string(), Joi.number(), Joi.allow(null))
	// 	.default([])
	// 	.optional(),

	tags: Joi.string()
		.allow('')
		.optional()
		.pattern(new RegExp('^[a-zA-Z, ]*$'))
		.messages({
			'string.pattern.base':
				'Tags can only contain letters and must be separated by a single comma',
			singleComma: 'Tags must be separated by a single comma',
			maxTags: 'A maximum of 3 tags can be provided at the same time',
			tagLength: 'Each tag must be exactly 3 characters'
		})
		.custom((value, helpers) => {
			if (value === '') {
				return value;
			}

			// Check for consecutive commas
			if (/,,/.test(value)) {
				return helpers.error('singleComma');
			}

			const tags = value.split(',').map(
				/** @param {string} tag */
				(tag) => tag.trim().toUpperCase()
			);

			// Check if there are more than 3 tags
			if (tags.length > 3) {
				return helpers.error('maxTags');
			}

			// Check if all tags are exactly 3 characters long
			if (
				!tags.every(
					/** @param {string} tag */
					(tag) => tag.length === 3
				)
			) {
				return helpers.error('tagLength');
			}

			return value;
		}, 'Tags validation')
		.description(
			'Tags must be comma-separated, each tag must be exactly 3 characters, a maximum of 3 tags can be provided at the same time, and there must be at least one tag if tags are provided. Example: "tag1, tag2, tag3". Tags must be letters only. No special characters or numbers.'
		)
		.external(async (value) => {
			if (value === '') {
				return value;
			}

			const tags = value.split(',').map(
				/** @param {string} tag */
				(tag) => tag.trim().toUpperCase()
			);

			const response = await fetch('http://localhost:5000/data/admin/tags');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			console.log(data);
			const existingTags = data.map(
				/** @param {{tag_name: string}} tag */
				(tag) => tag.tag_name
			);

			for (const tag of tags) {
				if (!existingTags.includes(tag)) {
					throw new Error('One or more tags do not exist.');
				}
			}
		}),

	id: Joi.number().optional(),

	category_name: Joi.string().optional(),

	category_id: Joi.number().optional(),

	businessId: Joi.number().optional()
});

export default schema;
