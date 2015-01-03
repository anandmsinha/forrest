var helpers = require('../config/helpers')

var get = function(req, res, next) {
    req.db.collection('quests').find({user_id: req.user._id}).toArray(function(err, user_quests) {
        if (err) { return next(new Error('Internal server error')) }
        res.json({quests: user_quests})
    })
}

/**
 * Post method to create a quest name parameter is needed.
 */
var createQuest = function(req, res, next) {
    var questName = req.body.name
    if (questName) {
        questName = questName.trim()
        if (questName.length > 0 && questName.length < 120) {
            var params = {
                user_id: req.user.id || req.user._id,
                name: questName,
                created_at: Date.now(),
                links_count: 0
            }
            req.db.collection('quests').insert(params, function(err, quest) {
                if (err || !quest) { next(new Error('Error creating the quest')) }
                else { res.json({status: true, message: 'Quest created', quest: quest}) }
            })
        } else {
            next(new Error('Quest name should atleast contain a non space character and their maximum length can be 120.'))
        }
    } else {
        next(new Error('No quest name specified.'))
    }
}

/**
 * Get method to get all quests
 */
var getQuests = function(req, res, next) {
    req.db.collection('quests').find({user_id: req.user._id || req.user.id}, {fields: { name: 1, created_at: 1, links_count: 1 }, sort: [['created_at', 'asc']]}).toArray(function(err, user_quests) {
        if (err) { next(new Error('Sorry request cannot be completed at the moment.')); }
        else {
            res.json({status: true, quests: user_quests, message: 'Quests fetched'})
        }
    })
}

/**
 * Get a single quest with details
 */
var getQuest = function(req, res, next) {
    if (!req.body.quest_id) { next(new Error('No quest id provided.')) }
    else {
        req.db.collection('quests').findOne({user_id: req.user._id || req.user.id, _id: helpers.toObjectID(req.body.quest_id)}, function(err, quest) {
            if (err) { next(new Error('Some error has occured')) }
            else if (!quest) { next(new Error('Quest not found')) }
            else {
                res.json({status: true, quest: quest, message: 'Quest fetched'})
            }
        })
    }
}

module.exports = {
    GET: getQuests,
    POST: createQuest,
    GETQuest: getQuest
}