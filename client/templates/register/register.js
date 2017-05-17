import { FlowRouter } from 'meteor/kadira:flow-router';

Template.register.events({
  'click #register'(event, instance){
    event.preventDefault();
    var username = instance.$("[name='login']").val().trim();
    var password = instance.$("[name='password']").val().trim();
    if (username == "" || password == null)
      return;
    Meteor.call("register", { username, password }, function(){
      Meteor.loginWithPassword(username, password, () => FlowRouter.go('home'));
    });
  }
})