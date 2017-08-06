import { FlowRouter } from 'meteor/kadira:flow-router';

Template.login.events({
    'click #login'(event, instance){
        event.preventDefault();
        let login = instance.$("[name='login']").val().trim();
        let password = instance.$("[name='password']").val().trim();
        instance.$("[name='password']").val('');
        if (login === "" || password === "")
            return;
        Meteor.loginWithPassword(login, password, function(error){
            if (error) {;
                if (error.reason == "User not found") {
                    Session.set("loginError", "Неверный логин");
                } else if (error.reason == "Incorrect password") {
                    Session.set("loginError", "Неверный пароль");
                } else {
                    Session.set("loginError", error.reason || ("Error: " + error.error));
                }
                return;
            }
            let next = Session.get('next') || "home";
            Session.set("next", null);
            Session.set("loginError", null);
            FlowRouter.go(next);
        });
    }
});
Template.login.helpers({
    loginError() {
        return Session.get('loginError');
    }
});
