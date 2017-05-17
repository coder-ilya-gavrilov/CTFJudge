Meteor.startup(() => {
  Accounts.onCreateUser((options, user) => {
    user.score = 0;
    return user;
  });
  Accounts.config({
    forbidClientAccountCreation: true
  });
});
