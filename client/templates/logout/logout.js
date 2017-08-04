import { FlowRouter } from 'meteor/kadira:flow-router';

Template.logout.events({
    'click #logout'() {
        Meteor.logout(() => FlowRouter.go('auth.login'));
    }
});