const UserModel = require('../models/userModel');

const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, country, phone, email, acceptedTerms } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Create user
        const newUser = await UserModel.create({
            firstName,
            lastName,
            country,
            phone,
            email,
            acceptedTerms
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: newUser
        });
    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await UserModel.findAll();
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    getUsers
};
