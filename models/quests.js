module.exports = function(db) {
    var module = {}
    module.table = 'quests'

    module.insert = function(value, callback) {
        db.collection(module.table).insert(value, callback)
    }

    return module
}