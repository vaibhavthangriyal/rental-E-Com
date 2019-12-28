const Area = require("../models/area.model");
const AreaController = require("../controllers/area.controller");
const router = require("express").Router();
const isEmpty = require('../utils/is-empty');
const mongodb = require('mongoose').Types;
const authorizePrivilege = require("../middleware/authorizationMiddleware");
// Get all areas
router.get("/", authorizePrivilege("GET_ALL_AREAS"), (req, res) => {
    Area.find().populate("hub","-password").populate({path:"city",populate:{path:"state"}}).exec().then(docs => {
        if (docs.length > 0)
            res.json({ status: 200, data: docs, errors: false, message: "All areas" });
        else
            res.json({ status: 200, data: docs, errors: true, message: "No area found" });
    }).catch(err => {
        console.log(err);
        res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting areas" })
    })
})

//Add new area
router.post('/', authorizePrivilege("ADD_NEW_AREA"), async (req, res) => {
    let result = AreaController.verifyCreate(req.body);
    if (!isEmpty(result.errors)) {
        return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
    }
    let newState = new Area(result.data);
    newState.save().then(area => {
        area.populate("hub","-password").populate({path:"city",populate:{path:"state"}}).execPopulate().then(area=>{
            res.json({ status: 200, data: area, errors: false, message: "Area added successfully" })
        }).catch(e => {
            console.log(e);
            res.status(500).json({ status: 500, data: null, errors: true, message: "Error while populating" })
        });
    }).catch(e => {
        console.log(e);
        res.status(500).json({ status: 500, data: null, errors: true, message: "Error while adding area" })
    });
});

//Update a city
router.put("/:id", authorizePrivilege("UPDATE_AREA"), (req, res) => {
    if (mongodb.ObjectId.isValid(req.params.id)) {
        let result = AreaController.verifyUpdate(req.body);
        if (!isEmpty(result.errors)) {
            return res.status(400).json({ status: 400, data: null, errors: result.errors, message: "Fields Required" });
        }
        Area.findByIdAndUpdate(req.params.id, result.data, { new: true }).populate("hub","-password").populate({path:"city",populate:{path:"state"}}).exec()
            .then(area=>{
                    res.status(200).json({ status: 200, data: area, errors: false, message: "Area Updated Successfully" });
            }).catch(err => {
                console.log(err);
                res.status(500).json({ status: 500, data: null, errors: true, message: "Error while updating area" })
            })
    }
    else {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid area id" });
    }
})

//DELETE A area
router.delete("/:id", authorizePrivilege("DELETE_AREA"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid area id" });
    }
    else {
        Area.findByIdAndDelete(req.params.id, (err, doc) => {
            if (err) {
                return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while deleting the area" })
            }
            if (doc) {
                res.json({ status: 200, data: doc, errors: false, message: "Area deleted successfully!" });
            }
        })
    }
})

module.exports = router;