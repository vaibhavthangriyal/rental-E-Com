const express = require('express');
const isEmpty = require("../utils/is-empty");
const userCtrl = require('../controllers/user.controller');
const User = require('../models/user.model');
var mongodb = require("mongodb");
const moment = require('moment');
const router = express.Router();
const bcrypt = require("bcryptjs");
const Ticket = require("../models/ticket.model");
const authorizePrivilege = require("../middleware/authorizationMiddleware");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const uuid = require("uuid/v1");
const AWS = require("aws-sdk");
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  region: process.env.AWS_S3_REGION
});


//GET all users
router.get('/', authorizePrivilege("GET_ALL_USERS"), async (req, res) => {
  try {
    const allUsers = await User
      .find({ _id: { $ne: req.user._id }, role: { $ne: process.env.CUSTOMER_ROLE } })
      .populate("role ")
      .exec();
    // console.log(allUsers);
    return res.json({ status: 200, message: "All users", errors: false, data: allUsers });
  }
  catch (err) {
    return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while fetching users" });
  }
})

// //GET all users
router.get('/all', authorizePrivilege("GET_ALL_USERS"), async (req, res) => {
  try {
    const allUsers = await User.find().populate("role").exec();
    // console.log(allUsers);
    res.json({ status: 200, message: "All users", errors: false, data: allUsers });
  }
  catch (err) {
    res.status(500).json({ status: 500, errors: true, data: null, message: "Error while fetching users" });
  }
})

// GET all users by role
router.get('/role/:role', authorizePrivilege("GET_USER_BY_ROLE"), async (req, res) => {
  if (mongodb.ObjectId.isValid(req.params.role)) {
    try {
      const allUsers = await User.find({ role: req.params.role }).populate("role route area").exec()
      if (allUsers.length > 0) {
        res.status(200).json({ status: 200, errors: false, data: allUsers, message: "All users" })
      } else {
        res.json({ status: 200, errors: false, data: allUsers, message: "No User Found" });
      }
    } catch (err) {
      console.log(err)
      res.status(500).json({ status: 500, errors: true, data: null, message: "Error while searching for users associated with this role" })
    }
  } else {
    res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid role id" });
  }
});


// //GET ALL CUSTOMERs
router.get('/customer', authorizePrivilege("GET_ALL_USERS"), async (req, res) => {
  User
    .find({ role: process.env.CUSTOMER_ROLE })
    .populate("role")
    .then(_customers => {
      if (_customers.length > 0) {
        return res.json({ status: 200, message: "ALL CUSTOMERS", errors: false, data: _customers });
      } else {
        return res.json({ status: 200, message: "NO CUSTOMER FOUND", errors: false, data: _customers });
      }
    }).catch(err => {
      res.status(500).json({ status: 500, errors: true, data: null, message: "Error while fetching users" });
    })
})

// DELETE a user
router.delete('/:id', authorizePrivilege("DELETE_USER"), (req, res) => {
  if (mongodb.ObjectID.isValid(req.params.id)) {
    User.deleteOne({ _id: req.params.id }, (err, user) => {
      if (err) throw err;
      res.send({ status: 200, errors: false, message: "User deleted successfully", data: user })
    }).catch(err => {
      console.log(err);
      res.status(500).json({ status: 500, errors: true, data: null, message: "Error while deleting the user" });
    });
  } else {
    console.log("ID not Found")
    res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid user id" });
  }
});


// UPDATE A USER
router.put('/id/:id', authorizePrivilege("UPDATE_USER"), (req, res) => {
  if (mongodb.ObjectID.isValid(req.params.id)) {
    // let user = (({ full_name, email, role }) => ({ full_name, email, role }))(req.body);
    const result = userCtrl.verifyUpdate(req.body);
    if (!isEmpty(result.errors)) {
      return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields required" })
    }
    User.findByIdAndUpdate(req.params.id, { $set: result.data }, { new: true }, (err, doc) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating user data" });
      }
      else {
        doc.populate("role route area").execPopulate().then(d => {
          if (!d)
            return res.status(200).json({ status: 200, errors: true, data: doc, message: "No User Found" });
          else {
            d = d.toObject();
            delete d.password;
            console.log("Updated User", d);
            res.status(200).json({ status: 200, errors: false, data: d, message: "Updated User" });
          }
        }
        ).catch(e => {
          console.log(e);
          return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating user details" });
        });
      }
    })
  } else {
    return res.status(400).json({ status: 400, errors: true, data: null, message: "Invalid user id" });
    // return res.status(404).send("ID NOT FOUND");
  }
})

// UPDATE USER OWN
router.put('/me', authorizePrivilege("UPDATE_USER_OWN"), (req, res) => {
  let result;
  if (req.user.role._id == process.env.DELIVERY_BOY_ROLE) {
    result = userCtrl.verifyDBoyProfileUpdateOwn(req.body)
  } else {
    result = userCtrl.verifyUpdate(req.body)
  }
  if (!isEmpty(result.errors)) {
    return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields required" })
  }
  User.findByIdAndUpdate(req.user._id, { $set: result.data }, { new: true }, (err, doc) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating user data" });
    }
    else {
      doc.populate("role route").execPopulate().then(d => {
        if (!d)
          return res.status(200).json({ status: 200, errors: true, data: doc, message: "No User Found" });
        else {
          d = d.toObject();
          delete d.password;
          console.log("Updated User", d);
          res.status(200).json({ status: 200, errors: false, data: d, message: "Updated User" });
        }
      }
      ).catch(e => {
        console.log(e);
        return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while updating user details" });
      });
    }
  })
})


// ADD NEW USER
router.post("/", authorizePrivilege("ADD_NEW_USER"), (req, res) => {
  let result;
  if (req.body.role == process.env.DRIVER_ROLE)
    result = userCtrl.verifyAddDriver(req.body);
  else
    result = userCtrl.verifyCreate(req.body);
  if (isEmpty(result.errors)) {
    User.findOne({ email: result.data.email }, (err, doc) => {
      if (err)
        return res.status(500).json({ status: 500, errors: true, data: null, message: "Error while verifying the email" });
      if (doc)
        return res.status(400).json({ status: 400, errors: true, data: null, message: "Email already registered" });
      result.data.user_id = "USR" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
      // console.log(user);
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(result.data.password, salt, function (err, hash) {
          result.data.password = hash;
          const newuser = new User(result.data);
          newuser.save().then(data => {
            data.populate("role route area").execPopulate().then(data => {
              data = data.toObject();
              delete data.password;
              res.status(200).json({ status: 200, errors: false, data, message: "User Added successfully" });
            })
          }).catch(err => {
            console.log(err);
            res.status(500).json({ status: 500, errors: true, data: null, message: "Error while creating new user" });
          })
        });
      });
    })
  }
  else {
    res.status(500).json({ status: 500, errors: result.errors, data: null, message: "Fields Required" });
  }
})


router.put("/changeStatus/", (req, res) => {
  console.log(req.body.is_active)
  if (mongodb.ObjectID.isValid(req.body.id)) {
    User.findByIdAndUpdate(req.body.id, { $set: { is_active: req.body.is_active } }, { new: true }, (err, doc) => {
      if (err)
        return res.json({ status: 500, errors: true, data: null, message: "Error While updatin" });
      if (doc)
        return res.json({ status: 200, errors: false, data: doc, message: "Status Updated" });
    })
  }
  else {
    res.status(500).json({ status: 500, errors: true, data: null, message: "Invaid OID" });
  }
})
module.exports = router;
