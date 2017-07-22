Meteor.users.attachSchema(new SimpleSchema({

  // from meteor packages
  username: {
    type: String
  },
  createdAt: {
    type: Date,
    optional: true
  },
  roles: {
    type: [String],
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  fullName: {
    type: String
  },
  encPass: {
    type: String,
    optional: true
  },
  refreshToken: {
    type: String,
    optional: true
  },
  expirationDate:{
    type: String,
    optional: true
  },
  isAdmin: {
    type: Boolean,
    defaultValue: false
  }
}));