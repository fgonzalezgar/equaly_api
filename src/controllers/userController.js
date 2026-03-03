const UserModel = require('../models/userModel');
const InvestmentModel = require('../models/investmentModel');
const StockModel = require('../models/stockModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res, next) => {
    try {
        const { firstName, lastName, country, password, email, acceptedTerms, referredByCode } = req.body;

        // 1. Check if user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // 2. Look up referrer if code provided
        let referredBy = null;
        if (referredByCode) {
            const referrer = await UserModel.findByReferralCode(referredByCode);
            if (referrer) {
                referredBy = referrer.id;
            }
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Generate own referral code (Simple unique slug)
        // E.g. JUAN1234
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const userReferralCode = (firstName.substring(0, 4) + randomNum).toUpperCase();

        // 5. Create user
        const newUser = await UserModel.create({
            firstName,
            lastName,
            country,
            password: hashedPassword,
            email,
            acceptedTerms,
            referredBy,
            referralCode: userReferralCode
        });

        // 6. Generate Referral URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const referralUrl = `${frontendUrl}/register?ref=${userReferralCode}`;

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                ...newUser,
                referral_url: referralUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const payload = { id: user.id, email: user.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const referralUrl = `${frontendUrl}/register?ref=${user.referral_code}`;

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            token,
            data: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                country: user.country,
                email: user.email,
                referral_code: user.referral_code,
                referral_url: referralUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

const getReferrals = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const referrals = await UserModel.getReferrals(userId);
        res.status(200).json({
            success: true,
            count: referrals.length,
            data: referrals
        });
    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await UserModel.findAll();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

const getPurchasedPlans = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const investments = await InvestmentModel.findByUserId(userId);
        res.status(200).json({
            success: true,
            count: investments.length,
            data: investments
        });
    } catch (error) {
        next(error);
    }
};

const getPurchasedStocks = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const stocks = await StockModel.findPurchasedByUserId(userId);
        res.status(200).json({
            success: true,
            count: stocks.length,
            data: stocks
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getReferrals,
    getUsers,
    getPurchasedPlans,
    getPurchasedStocks
};
