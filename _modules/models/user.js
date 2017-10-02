exports.getSchema =(mongoose) => {
  const userSchema = new mongoose.Schema({
    contacts: [{
      mobile: { type: String },
      isVerified: { type: Boolean, default: false },
      isPrimary: { type: Boolean, default: false },
      mobileOTP: { type: Number },
      countryCode: { type: String },
      otpUpdatedAt: { type: Date },
    }],
    userName: { type: String, index: true, trim: true },
    name: { type: String, trim: true, index: true, default: null, sparse: true },
    lastName: { type: String, trim: true, default: '' },
    origin: { type: String, trim: true, default: 'local' },
    originId: { type: String, trim: true},
    originToken: { type: String, trim: true},
    originDisplayName: { type: String, trim: true},
    originUsername: { type: String, trim: true},
    email: { type: String, trim: true, unique: true, index: true, required: true },
    // todo rememberMe feature use
    rememberMe: { type: Boolean, default: false },
    password: { type: String, required: false },
    emailVerificationToken: { type: String, required: false },
    emailVerificationTokenUpdatedAt: { type: Date },
    utcoffset: { type: Number },
    cronHardDeleteCount: { type: Number, default: 0, required: true },
    passwordResetToken: { type: String, default: null },
    totalRatingPoints: { type: Number, default: 0 },
    ratedByUserCount: { type: Number, default: 0 },
    role: [{
      type: String,
      // ref: 'role',
      // required: true,
    }],
    status: { type: Number, default: 0, required: true },
  }, { timestamps: true });

  return mongoose.model('User', userSchema);
}
