import { Roles } from 'meteor/alanning:roles';
import { moment } from 'meteor/momentjs:moment';

Template.registerHelper('isAdmin', function(){
  return Roles.userIsInRole(Meteor.userId(), "admin");
})
Template.registerHelper("prettifyDate", function(timestamp) {
    return moment(timestamp).format('DD.MM.YYYY HH:mm:ss');
});