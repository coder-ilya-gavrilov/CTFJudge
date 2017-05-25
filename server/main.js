Meteor.startup(() => {
  Accounts.onCreateUser((options, user) => {
    user.score = 0;
    user.visible = true;
    user.lastSuccess = 0;
    return user;
  });
  Accounts.config({
    forbidClientAccountCreation: true
  });
});
