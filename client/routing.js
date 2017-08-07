import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { Roles } from 'meteor/alanning:roles';
import Settings from '/shared/settings.collection';

FlowRouter.route('/', {
    name: 'home',
    action: function(){
        if (Meteor.userId() !== null)
            FlowRouter.go('tasks.list');
        else
            FlowRouter.go('auth.login');
    }
});
FlowRouter.route('/login', {
    name: 'auth.login',
    action: function(){
        BlazeLayout.render('login');
    }
});
FlowRouter.route('/register', {
    name: 'auth.register',
    action: function(){
        BlazeLayout.render('register');
    }
});
FlowRouter.route('/start', {
    name: 'start',
    action: function(){
        BlazeLayout.render('layout', {menu: 'menu', body: 'beforeStart'});
    }
});

FlowRouter.route('/logout', {
    name: 'auth.logout',
    action: function(){
        if (Meteor.userId() === null)
            FlowRouter.go('auth.login');
        else
            BlazeLayout.render('layout', {menu: 'menu', body: 'logout'});
    }
});

let participantRoutes = FlowRouter.group({
    triggersEnter: [function(context, redirect){
        if (Meteor.userId() === null) {
            redirect(FlowRouter.path('auth.login'));
            return;
        }
        let startTime = (Settings.findOne({key: 'startTime'}) || {}).value;
        if (moment().diff(startTime) < 0 && !Roles.userIsInRole(Meteor.userId(), "admin"))
            redirect(FlowRouter.path('start'));
    }]
});

let adminRoutes = participantRoutes.group({
    triggersEnter: [function(context, redirect){
        if (!Roles.userIsInRole(Meteor.userId(), "admin"))
            redirect(FlowRouter.path('home'));
    }]
});

adminRoutes.route('/settings', {
    name: 'settings',
    action: function(){
        BlazeLayout.render('layout', {menu: 'menu', scoreboard: 'scoreboard', body: 'settings'});
    }
});
adminRoutes.route('/tasks/add', {
    name: 'tasks.add',
    action: function(){
        BlazeLayout.render('layout', {menu: 'menu', scoreboard: 'scoreboard', body: 'editTask'});
    }
});
adminRoutes.route('/tasks/:_id/edit', {
    name: 'tasks.edit',
    action: function(){
        BlazeLayout.render('layout', {menu: 'menu', scoreboard: 'scoreboard', body: 'editTask'});
    }
});
adminRoutes.route('/tasks/:_id/attempts', {
    name: 'tasks.attempts',
    action: function(){
        BlazeLayout.render('layout', {menu: 'menu', scoreboard: 'scoreboard', body: 'attempts'});
    }
});
adminRoutes.route('/attempts', {
    name: 'attempts.list',
    action: function(){
        BlazeLayout.render('layout', {menu: 'menu', scoreboard: 'scoreboard', body: 'attempts'})
    }
});

participantRoutes.route('/scoreboard', {
    name: 'scoreboard',
    action: function(){
        BlazeLayout.render('layout', {menu: 'menu', body: 'scoreboard', fullTable: true});
    }
});

participantRoutes.route('/users/:_id', {
    name: 'users.show',
    action: function(){
        BlazeLayout.render('layout', {menu: 'menu', scoreboard: 'scoreboard', body: 'showUser'});
    }
});
participantRoutes.route('/tasks', {
    name: 'tasks.list',
    action: function(){
        BlazeLayout.render('layout', {menu: 'menu', scoreboard: 'scoreboard', body: 'tasks'});
    }
});
participantRoutes.route('/tasks/:_id', {
    name: 'tasks.show',
    action: function(){
        BlazeLayout.render('layout', {menu: 'menu', scoreboard: 'scoreboard', body: 'showTask'});
    }
});

FlowRouter.notFound = {
    action: function() {
        FlowRouter.go("home");
    }
};
