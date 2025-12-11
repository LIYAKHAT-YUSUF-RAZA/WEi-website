const mongoose = require('mongoose');

const companyInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'WEintegrity'
  },
  description: {
    type: String,
    required: true
  },
  mission: {
    type: String,
    default: ''
  },
  vision: {
    type: String,
    default: ''
  },
  foundedYear: {
    type: Number
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  services: [{
    title: String,
    description: String,
    icon: String
  }],
  teamSize: {
    type: Number
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CompanyInfo', companyInfoSchema);
