const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');

const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, country, password, email, acceptedTerms } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await UserModel.create({
            firstName,
            lastName,
            country,
            password: hashedPassword,
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
