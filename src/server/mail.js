'use strict';

import nodemailer from 'nodemailer';
import stubTransport from 'nodemailer-stub-transport';

import { smtp, admins } from '../config';

var mailTo = ['ebower@michigan.com'];
if (typeof admins !== 'undefined') {
  mailTo = admins;
}

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
  to: mailTo.join()
};

module.exports = { transporter, mailOptions, type };
