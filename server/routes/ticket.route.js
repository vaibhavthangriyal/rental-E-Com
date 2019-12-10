const express = require('express');
const isEmpty = require("../utils/is-empty");
const TicketController = require('../controllers/ticket.controller');
const Ticket = require('../models/ticket.model');
const mongodb = require("mongodb");
const CustomerOrder = require("../models/customer.order.model");
const moment = require('moment');
const authorizePrivilege = require("../middleware/authorizationMiddleware");
const router = express.Router();
const Product = require("../models/products/Products.model");

//GET own Tickets
router.get("/", authorizePrivilege("GET_TICKETS_OWN"), (req, res) => {
    let query;
    if(req.user.role._id == process.env.CUSTOMER_ROLE){
        query = { customer: req.user._id }
    }else{
        query = { created_by: req.user._id }
    }
    Ticket.find(query,null, {
        sort: {
            created_at: 'desc' //Sort by Date DESC
        }
    }).populate([{path:"created_by customer assignTo", select :"-password"}]).lean().exec().then(_tickets => {
        return res.json({ status: 200, data: _tickets, errors: false, message: "Your Tickets" });
    }).catch(err => {
        console.log(err);
        return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting tickets" })
    })
})
//GET single Ticket
// router.get("/id/:id", authorizePrivilege("GET_TICKET_OWN"), (req, res) => {
//     Ticket.findOne({ created_by: req.user._id , _id:req.params.id }).populate("created_by messages.executive","full_name").lean().exec().then(_ticket => {
//         return res.json({ status: 200, data: _ticket, errors: false, message: "Your Tickets" });
//     }).catch(err => {
//         console.log(err);
//         return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting tickets" })
//     })
// })

//GET all tickets from all users
router.get("/all", authorizePrivilege("GET_TICKETS_ALL"), (req, res) => {
    Ticket.find().populate([{path:"created_by customer assignTo", select :"-password"},{path:"responses.by", select :"-password"}]).sort({ created_at: 'desc' }).lean().exec().then(doc => {
        return res.json({ status: 200, data: doc, errors: false, message: "All Tickets" });
    }).catch(err => {
        return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while getting orders" })
    });
})

// Add new ticket
router.post("/", authorizePrivilege("ADD_NEW_TICKET"), (req, res) => {
    let result = TicketController.verifyCreateWeb(req.body);
    if (!isEmpty(result.errors))
        return res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields required" });
    result.data.ticket_number = "TKT" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
    if(req.user.role._id != process.env.CUSTOMER_ROLE)
    result.data.created_by = req.user._id;
    let newTicket = new Ticket(result.data)
    newTicket.save().then(_tkt=>{
        res.json({ status: 200, data: _tkt, errors: false, message: "Ticket Created Successfully!" });
    }).catch(err=>{
        console.log(err);
        res.status(500).json({status:500, data:null, errors:true, message:"Error while creating new ticket"});
    })
})
// Add new ticket
router.post("/customer", authorizePrivilege("ADD_NEW_TICKET_CUSTOMER"), (req, res) => {
    let result = TicketController.verifyCreate(req.body);
    if (!isEmpty(result.errors))
        return res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields required" });
    result.data.ticket_number = "TKT" + moment().year() + moment().month() + moment().date() + moment().hour() + moment().minute() + moment().second() + moment().milliseconds() + Math.floor(Math.random() * (99 - 10) + 10);
    // if(req.user.role._id != process.env.CUSTOMER_ROLE)
    result.data.customer = req.user._id;
    let newTicket = new Ticket(result.data)
    newTicket.save().then(_tkt=>{
        res.json({ status: 200, data: _tkt, errors: false, message: "Ticket Created Successfully!" });
    }).catch(err=>{
        console.log(err);
        res.status(500).json({status:500, data:null, errors:true, message:"Error while creating new ticket"});
    })
})

//Follow up
router.put("/followupconern/:id", authorizePrivilege("CONCERN_FOLLOWUP"), (req, res) => {
    console.log("FIELDS : ",req.body);
    let result = TicketController.verifyTicketFollowUp(req.body);
    if (!isEmpty(result.errors))
        return res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields required" });
        result.data.by = req.user._id;
    Ticket.findByIdAndUpdate(req.params.id,{$push:{responses:result.data},status:"Open"},{new:true}).populate([{path:"created_by customer assignTo responses.by", select :"-password"}]).exec().then(_tkt=>{
        res.json({ status: 200, data: _tkt, errors: false, message: "Ticket Updated Successfully!" });
    }).catch(err=>{
        console.log(err);
        res.status(500).json({status:500, data:null, errors:true, message:"Error while updating ticket"});
    })
})
// // Add new message on ticket from executive
// router.put("/executive/:id", authorizePrivilege("ADD_NEW_MESSAGE_ON_TICKET_EXECUTIVE"), (req, res) => {
//     if (mongodb.ObjectID.isValid(req.params.id)) {
//         let result = TicketController.verifyExecutiveMsg(req.body);
//         if (!isEmpty(result.errors))
//             return res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields required" });
//         Ticket.findByIdAndUpdate(req.params.id, { $set: { status: "Open" }, $push: { messages: { message: req.body.message, executive: req.user._id } } }, { new: true })
//             .populate([{ path: "created_by", select: "full_name" }, { path: "messages.executive", select: "full_name" }]).lean().exec().then(_tkt => {
//                 return res.json({ status: 200, data: _tkt, errors: false, message: "Message sent successfully" });
//             }).catch(_err => {
//                 console.log(_err);
//                 res.status(500).json({ status: 500, data: null, errors: true, message: "Error while populating ticket" })
//             })
//     } else {
//         res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid Ticket Id" });
//     }
// })
// Add new message on ticket from customer
// router.put("/customer/:id", authorizePrivilege("ADD_NEW_MESSAGE_ON_TICKET_CUSTOMER"), (req, res) => {
//     if (mongodb.ObjectID.isValid(req.params.id)) {
//         let result = TicketController.verifyExecutiveMsg(req.body);
//         if (!isEmpty(result.errors))
//             return res.status(400).json({ status: 400, errors: result.errors, data: null, message: "Fields required" });
//         Ticket.findByIdAndUpdate(req.params.id, { $set: { status: "Open" }, $push: { messages: { customer: req.body.message } } }, { new: true })
//             .populate([{ path: "created_by", select: "full_name" }, { path: "messages.executive", select: "full_name" }]).lean().exec().then(_tkt => {
//                 return res.json({ status: 200, data: _tkt, errors: false, message: "Message sent successfully" });
//             }).catch(_err => {
//                 console.log(_err);
//                 res.status(500).json({ status: 500, data: null, errors: true, message: "Error while populating ticket" })
//             })
//     } else {
//         res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid Ticket Id" });
//     }
// })
// Close a ticket
router.put("/close/:id", authorizePrivilege("CLOSE_TICKET"), (req, res) => {
    if (mongodb.ObjectID.isValid(req.params.id)) {
       Ticket.findByIdAndUpdate(req.params.id, { $set: { status: "Close" }}, { new: true })
            .populate([{path:"created_by customer assignTo", select :"-password"}]).lean().exec().then(_tkt => {
                return res.json({ status: 200, data: _tkt, errors: false, message: "Ticket Closed Successfully" });
            }).catch(_err => {
                console.log(_err);
                res.status(500).json({ status: 500, data: null, errors: true, message: "Error while populating ticket" })
            })
    } else {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid Ticket Id" });
    }
})


// Delete a ticket
router.delete("/:id", authorizePrivilege("DELETE_TICKET"), (req, res) => {
    if (!mongodb.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ status: 400, data: null, errors: true, message: "Invalid Ticket Id" });
    }
    else {
        Ticket.findByIdAndDelete(req.params.id).exec().then(_tkt => {
            res.json({ status: 200, data: _tkt, errors: false, message: "Ticket deleted successfully!" });
        }).catch(er => {
            console.log(er);
            return res.status(500).json({ status: 500, data: null, errors: true, message: "Error while deleting the ticket" })
        })
    }
})


module.exports = router;