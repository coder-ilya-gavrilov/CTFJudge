import { FlowRouter } from 'meteor/kadira:flow-router';

Template.login.events({
  'click #login'(event, instance){
    event.preventDefault();
    var login = instance.$("[name='login']").val().trim();
    var password = instance.$("[name='password']").val().trim();
    if (login == "" || password == null)
      return;
    Meteor.loginWithPassword(login, password, () => FlowRouter.go('home'));
  }
})