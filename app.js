// TODO: use connect-session for sessions

/* -== DEFINING ==- */
var express = require('express'),
    app = express.createServer(),
    mongoose = require('mongoose').Mongoose,
    db = mongoose.connect('mongodb://localhost/blog-express-mongoose'),
    pub = __dirname + '/public';

/* -== SESSIONS ==- */

// from http://github.com/ry/node_chat/blob/master/server.js
var SESSION_TIMEOUT = 60 * 10 * 1000;
var sessions = {};

function createSession(id) {
  if (id.length > 50) return null;
  if (/[^\w_\w-^!]/.exec(id)) return null;

  for (var i in sessions) {
    var session = sessions[i];
    if (session && session.nick === nick) return null;
  }

  var session = {
    nick: nick,
    id: Math.floor(Math.random()*99999999999).toString(),
    timestamp: new Date(),

    poke: function() {
      session.timestamp = new Date();
    },

    destroy: function() {
      delete sessions[session.id];
    }
  }
}

// interval to kill off old sessions
setInterval(function () {
  var now = new Date();
  for (var id in sessions) {
    if (!sessions.hasOwnProperty(id)) continue;
    var session = sessions[id];

    if (now - session.timestamp > SESSION_TIMEOUT) {
      session.destroy();
    }
  }
}, 1000);


    
// db.dropDatabase - to drop DB;

mongoose.model('Post', {
  properties: [
    'title', 
    'slug', 
    'body', 
    {'comments': [
      'person', 
      'comment', 
      'created_at'
    ]}, 
    'created_at'
  ]
});

mongoose.model('User',{
  properties: [
    'name',
    'password',
    'member_since'
  ]
});

var Post = db.model('Post'),
    User = db.model('User');

/* -== CONFIG ==- */
app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyDecoder());
    app.use(app.router);
    app.use(express.staticProvider(pub));
    /* enable SASS */
    app.use(express.compiler({ src: pub, enable: ['sass'] }));
    /* templating engine */
    app.set('view engine', 'jade');
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

/* -== APP ==- */
app.get('/', function(req, res) {
  Post.find().sort([['date', 'descending']]).all(function(posts) {
    res.render('blogs_index', {
      locals : {
        title : 'Blog',
        articles: posts
      }
    })
  });
});

app.get('/login', function(req, res) {
  res.render('login', {
    locals: {
      title: 'Login',
      error: null
    }
  });
});

app.post('/login', function(req, res) {
  var name = req.param('login'),
      pass = req.param('password');

  User.find({ name: name }).first(function(user){
    if (user) {
      if (pass == user.password) {
        var session = createSession(user._id);
        if (session == null) {
          res.send("Error, session == null returns true", 400);
        }
        res.redirect('/');
      }
      else {
        res.render('login', {
          locals: {
            title: 'Login',
            error: {
              type: 'password'
            }
          }
        });
      }
    } else {
      res.render('login', {
        locals: {
          title: 'Login',
          error: {
            type: 'name', 
            data: req.param('login')
          }
        }
      });
    }
  });
});

app.get('/blog/new', function(req, res) {
  res.render('blog_new', {
    locals: {
      title: 'New Post'
    }
  });
});

app.post('/blog/new', function(req, res) {
  new Post({ 
    title: req.param('title'),
    slug: req.param('slug'),
    body: req.param('body'),
    created_at: new Date()
  }).save(function(){
    res.redirect('/');
  });
});

app.get('/blog/:slug', function(req, res){
  Post.find({ slug: req.params.slug }).first(function(post){
    res.render('blog_post', {
      locals: {
        title: 'Blog',
        post: post
      }
    });
  });
});

/* -== RUNNING SERVER ==- */
app.listen(3000);
console.log('Express server started on port %s', app.address().port);
