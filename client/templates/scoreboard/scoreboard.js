import { userCompare } from '/client/shared/userCompare';

Template.scoreboard.helpers({
  users(){
    return Meteor.users.find({}, {sort: userCompare});
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