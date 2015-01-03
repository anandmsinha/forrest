var get = function(req, res, next) {
    var user = {
        is_login: false,
        id: 'not',
        name: 'not'
    }
    if (req.user) {
        user.is_login = true;
        user.id = req.user.id || req.user._id;
        user.name = req.user.username;
    }
    res.render('base', {user: JSON.stringify(user)})
}

module.exports = {
    GET: get
}