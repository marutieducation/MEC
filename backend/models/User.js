const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'], trim: true },
    lastName: { type: String, required: [true, 'Last name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    role: {
      type: String,
      enum: ['student', 'admin', 'university_partner'],
      default: 'student',
    },
    phone: { type: String, default: '' },
    countryCode: { type: String, default: '+91' },
    city: { type: String, default: '' },


    selectedDestinations: [{ type: String }],
    selectedDegrees: [{ type: String }],
    specialization: { type: String, default: '' },
    intakeTerm: { type: String, default: '' },
    budget: { type: String, default: '' },
    profileCompleted: { type: Boolean, default: false },
    testScores: {
      gre: { type: Number, default: null },
      ielts: { type: Number, default: null },
      toefl: { type: Number, default: null },
      gate: { type: Number, default: null },
      jee: { type: Number, default: null },
      cat: { type: Number, default: null },
    },


    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: String, default: null },
    twoFactorExpiry: { type: Date, default: null },


    universityId: { type: mongoose.Schema.Types.ObjectId, ref: 'University', default: null },

    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // If the password already looks like a bcrypt hash (starts with $2b$ and is 60 chars),
  // and it wasn't explicitly modified (handled by isModified), do not hash it again.
  if (this.password && this.password.startsWith('$2') && this.password.length === 60) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});



userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
