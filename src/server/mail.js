'use strict';

import nodemailer from 'nodemailer';
import stubTransport from 'nodemailer-stub-transport';

import { smtp, admins } from '../config';

var transporter;
var type;
if (smtp && smtp.service) {
  type = 'smtp';
	transporter = nodemailer.createTransport(smtp);
} else {
  type = 'stub';
  transporter = nodemailer.createTransport(stubTransport());
}

var mailOptions = {
  from: 'ebower <ebower@michigan.com>',
  subject: 'MAPI Error Alert',
  to: 'ebower@michigan.com'
};

module.exports = { transporter, mailOptions, type };