const express = require('express');
const router = express.Router();
const passport = require('passport');
const moment = require('moment');

const { requireAuth, requireNotAuth } = require('../middlewares');

const User = require('../models/User');

const EMAIL_REGEX = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/g;

router.get('/', requireNotAuth, (req, res) => {
  return res.render('main', {
    page: 'login',
    path: '/auth',
    title: 'Login | Quarentreino'
  });
});

router.post(
  '/',
  requireNotAuth,
  passport.authenticate('local', {
    failureRedirect: '/auth',
    successRedirect: '/default'
  })
);

router.get('/signup', requireNotAuth, (req, res) => {
  return res.render('main', {
    page: 'signup',
    path: '/auth/signup',
    title: 'Signup | Quarentreino'
  });
});

router.post('/signup', requireNotAuth, async (req, res) => {
  let { nome, sobrenome, email, password, nascimento, telefone, tipo } = req.body;

  const errors = {};

  if (!nome) {
    errors.nome = 'Campo obrigatório';
  }

  if (!sobrenome) {
    errors.sobrenome = 'Campo obrigatório';
  }

  if (!email) {
    errors.email = 'Campo obrigatório';
  } else if (!email.match(EMAIL_REGEX)) {
    errors.email = 'E-mail inválido';
  } else {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      errors.email = 'Email já cadastrado';
    }
  }

  if (password.length < 8) {
    errors.password = 'A senha deve conter pelo menos 8 caracteres';
  }

  if (!nascimento) {
    errors.nascimento = 'Campo obrigatório';
  } else if (!moment(nascimento, 'DD/MM/YYYY').isValid()) {
    errors.nascimento = 'Data inválida';
  }

  if (Object.keys(errors).length !== 0) {
    return res.status(422).render('main', {
      page: 'signup',
      title: 'Signup | Quarentreino',
      errors,
      values: { nome, sobrenome, email, password, nascimento, telefone, tipo }
    });
  }

  try {
    await User.create({
      nome,
      sobrenome,
      email,
      password,
      nascimento: moment(nascimento, 'DD-MM-YYYY'),
      telefone,
      tipo
    });
    return res.status(201).redirect('/auth');
  } catch (error) {
    console.error(error);
    return res.status(500).render('main', {
      page: 'signup',
      title: 'Signup | Quarentreino'
    });
  }
});

router.get('/logout', requireAuth, (req, res) => {
  req.logout();
  return res.redirect('/');
});

module.exports = router;
