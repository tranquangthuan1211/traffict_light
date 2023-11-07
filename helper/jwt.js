var jwt = require('jsonwebtoken');

module.exports = {
    generateToken: function(data, secretKey, tokenLife) {
        return new Promise(function(resolve, reject) {
            jwt.sign(data, secretKey, { expiresIn: tokenLife }, function(err, token) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(token);
                }
            })
        });
    },

    verifyToken: function(token, secretKey) {
        return new Promise(function(resolve, reject) {
            jwt.verify(token, secretKey, function(err, decoded) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(decoded);
                }
            })
        });
    },
}

