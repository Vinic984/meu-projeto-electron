const brcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/database');
const { JWT_SECRET } = process.env;

exports.registerUser = (req, res) => {
    const { email, senha } = req.body;
    const hash = brcrypt.hashSync(senha, 10);

    db.run(`INSERT INTO users (email, senha) VALUES (?, ?)`, [email, hash], function(err) {
        if (err) return res.status(400).json({ error: 'Email já cadastrado' });
        res.json({ id: this.lastID, email });
    });
};

exports.login =  (req, res) => {
    const { email, senha } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Usuário não encontrado' });

        const isValid = brcrypt.compareSync(senha, user.senha);
        if (!isValid) return res.status(400).json({ error: 'Senha incorreta' });

        const token = jwt.sign({ id: user.id, email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
}