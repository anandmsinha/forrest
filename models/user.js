module.exports = function(db) {
    var module = {}

    module.table = 'users'

    module.fields = {
        username: 'username',
        password: 'password'
    }

    module.getById = function(token, callback) {
        db.collection(module.table).findById(token, callback)
    }

    module.getOne = function(condition, callback) {
        db.collection(module.table).findOne(condition, callback)
    }

    module.insert = function(values, callback) {
        db.collection(module.table).insert(values, callback)
    }

    return module
}