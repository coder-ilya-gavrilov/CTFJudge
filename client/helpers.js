import { Roles } from 'meteor/alanning:roles';
import { moment } from 'meteor/momentjs:moment';
import Settings from '/shared/settings.collection';

Template.registerHelper('isAdmin', function(){
  return Roles.userIsInRole(Meteor.userId(), "admin");
});
Template.registerHelper("prettifyDate", function(timestamp) {
    return moment(timestamp).format('DD.MM.YYYY HH:mm:ss');
});
Template.registerHelper("getParameter", function(key) {
    return (Settings.findOne({key}) || {}).value;
});
