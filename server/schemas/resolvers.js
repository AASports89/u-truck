const { AuthenticationError } = require('apollo-server-express');
const { User, Truck, Reservation } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
//PULL MODEL DATA//
  Query: {
    users: async () => {
      return User.find().populate('reservations');
    },
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate('reservations');
    },
    reservations: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Reservation.find(params).sort({ createdAt: -1 }).populate('trucks');
    },
    reservation: async (parent, { reservationId }) => {
      return Reservation.findOne({ _id: reservationId });
    },
    trucks: async () => {
      return Truck.find();
    },
    truck: async (parent, args) => {
      return Truck.findById(args.truckId);
    },
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("reservations");
      }
      throw new AuthenticationError("Please login❗");
    },
  },
//CHANGE MODEL DATA//
  Mutation: {
//CREATE USER//
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('No user found with this login❗');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Invalid login credentials❗');
      }

      const token = signToken(user);

      return { token, user };
    },
//ADD RESERVATION//
    addReservation: async (parent, { title, date }, context) => {
      if(context.user) {
        const reservation = await Reservation.create({
          title,
          date,
          username: context.user.username,
        });

      await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { reservations: reservation._id, username: context.user.username } },
          {
            new: true,
            runValidators: true,
          }
        );
        return reservation;
      }
      throw new AuthenticationError("Please login to create reservation request❗");
    },
//ADD TRUCK//
    addTruck: async (parent, { reservationId, image, truckModel, rentalPrice }, context) => {
      if (context.user) {
        return Reservation.findOneAndUpdate(
          { _id: reservationId },
          {
            $addToSet: {
              trucks: { image, truckModel, rentalPrice, username: context.user.username },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      throw new AuthenticationError("Please login to create reservation request❗");
    },
//DELETE RESERVATION//
    removeReservation: async (parent, { reservationId }, context) => {
      if(context.user) {
        const reservation = await Reservation.findOneAndDelete({
          _id: reservationId,
          username: context.user.username,
        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { reservations: reservation._id }}
        );
        return reservation;
      }
      throw new AuthenticationError("Please login to delete reservation request❗");
    },
//DELETE TRUCK//
    removeTruck: async (parent, { reservationId, truckId }, context) => {
      if (context.user) {
        return Reservation.findOneAndUpdate(
          { _id: reservationId },
          {$pull: {
            trucks: {
              _id: truckId,
              username: context.user.username,
            },
          },
        },
        { new: true }
        );
      }
      throw new AuthenticationError("Please login to update reservation request❗");
    },
  },
};

module.exports = resolvers;