import { FlowRouter } from 'meteor/kadira:flow-router';

Template.register.events({
    'click #register'(event, instance){
        event.preventDefault();
        let username = instance.$("[name='login']").val().trim();
        let password = instance.$("[name='password']").val().trim();
        if (username == "" || password == "")
            return;
        Meteor.call("register", { username, password }, function(error){
            if (error) {
                console.log(error);
                if (error.reason == "Username already exists.") {
                    Session.set("registrationError", "Логин уже занят");
                } else {
                    Session.set("registrationError", error.reason || ("Error: " + error.error))
                }
                return;
            }
            Meteor.loginWithPassword(username, password, () => FlowRouter.go('home'));
        });
    }
});
Template.register.helpers({
    registrationError() {
        return Session.get('registrationError');
    }
});
