const Joi = require('joi');

const registerSchema = Joi.object({
    firstName: Joi.string().trim().required().messages({
        'string.empty': 'El nombre es obligatorio',
        'any.required': 'El nombre es obligatorio'
    }),
    lastName: Joi.string().trim().required().messages({
        'string.empty': 'El apellido es obligatorio',
        'any.required': 'El apellido es obligatorio'
    }),
    country: Joi.string().trim().required().messages({
        'string.empty': 'El país es obligatorio',
        'any.required': 'El país es obligatorio'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'La contraseña es obligatoria',
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'any.required': 'La contraseña es obligatoria'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'El correo electrónico no es válido',
        'any.required': 'El correo electrónico es obligatorio'
    }),
    acceptedTerms: Joi.boolean().valid(true).required().messages({
        'any.only': 'Debe aceptar los términos y condiciones',
        'any.required': 'Debe aceptar los términos y condiciones'
    })
});

const validateRegistration = (req, res, next) => {
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        return res.status(400).json({ success: false, errors });
    }
    next();
};

module.exports = {
    validateRegistration
};
