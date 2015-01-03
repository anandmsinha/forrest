var helpers = require('../config/helpers')
var validator = require('validator')
var findHashtags = require('find-hashtags')

var get = function(req, res, next) {
    if (!req.param('quest_id')) { return next(new Error('Quest id not provided')) }
    req.db.collection('quests').findOne({user_id: req.user._id, _id: helpers.toObjectID(req.param('quest_id'))}, function(err, quest) {
        if (err) { return next(new Error('Quest not found')) }
        if (!quest) { return next(new Error('Invalid quest id')) }
        if (req.param('link_id')) {
            // in this case get just one link
            req.db.collection('links').findOne({_id: helpers.toObjectID(req.param('link_id')), quest_id: req.param('quest_id')}, function(err, link) {
                if (err) { return next(new Error('Link not found')) }
                if (!link) { return next(new Error('Link not found')) }
                res.json({link: link})
            })
        } else {
            req.db.collection('links').find({quest_id: req.param('quest_id')}).toArray(function(err, quest_links) {
                if (err) { return next(new Error('Some error has occured')) }
                res.json({links: quest_links})
            })
        }
    })
}


var post = function(req, res, next) {
    if (!req.body.quest_id) { return  next(new Error('Quest id not provided'))}
    if (!req.body.link || !validator.isURL(req.body.link)) { return next(new Error('A valid link not provided')) }
    var userId = req.user._id || req.user.id
    var questId = helpers.toObjectID(req.body.quest_id)
    // process text from links
    var linkObject = {}
    linkObject.link = req.body.link
    linkObject.created_at = Date.now()
    linkObject.tags = []
    if (req.body.desc) {
        linkObject.description = req.body.desc
        linkObject.tags = findHashtags(req.body.desc)
    }
    req.db.collection('quests').update({user_id: userId, _id: questId}, {$push: {links: linkObject }, $inc: {links_count: 1}, $set: {updated_at: Date.now()}}, {w: 1}, function(err, quest) {
        if (err || !quest) { next(new Error('Some error has occured')) }
        else {
            req.db.collection('quests').findOne({_id: questId}, function(err, final_quest) {
                if (err || !final_quest) { next(new Error('Some error has occured')) }
                else {
                    res.json({status: true, message: 'Link added', quest: final_quest})
                }
            })
        }
    })
}

module.exports = {
    GET: get,
    POST: post
}