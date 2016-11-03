var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let User = mongoose.model('User');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/newuser', function(req,res,next){
  let user = new User(req.body);
  user.save();
  console.log('user created');
  res.json(req.body);
});
module.exports = router;
