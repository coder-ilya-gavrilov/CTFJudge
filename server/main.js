Meteor.startup(() => {
  Accounts.onCreateUser((options, user) => {
    user.score = 0;
    user.visible = true;
    return user;
  });
  Accounts.config({
    forbidClientAccountCreation: true
  });
});
