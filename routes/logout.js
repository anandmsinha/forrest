var post = function(req, res, next) {
    req.logout()
    res.json({status: true})
}

module.exports = {
    POST: post
}