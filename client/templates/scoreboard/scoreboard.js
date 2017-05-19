import { userCompare } from '/client/shared/userCompare';

Template.scoreboard.helpers({
  users(){
    return Meteor.users.find({visible: true}, {sort: userCompare});
  },
  invisibleUsers(){
    return Meteor.users.find({visible: false}, {sort: {username: 1}})
  },
  needToShow(index, user){
    return (this.fullTable || index < 10 || user._id == Meteor.userId());
  },
  isCurrentUser(user){
    return user._id == Meteor.userId();
  },
  addOneTo(number) {
    return number + 1;
  }
});