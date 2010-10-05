// TODO: use connect-session for sessions

/* -== DEFINING ==- */
var express = require('express'),
    app = express.createServer(),
    mongoose = require('mongoose').Mongoose,
    db = mongoose.connect('mongodb://localhost/blog-express-mongoose'),
    pub = __dirname + '/public';
    
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
    app.use(express.cookieDecoder());
    //app.use(express.logger());
    app.use(express.session());
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
      error: null,
      // where do we come from
      redirectUri: req.flash('redirect-from')
    }
  });
});

app.post('/login', function(req, res) {
  var name = req.param('login'),
      pass = req.param('password'),
      redirectUri = req.param('redirect-uri');
  
  User.find({ name: name }).first(function(user){
    // login matches db
    if (user) {
      // password matches 
      if (pass == user.password) {
        // initilize session
        req.session.user_id = user._id;
        if (redirectUri && redirectUri != '') {
          res.redirect(redirectUri);
        }
        else {
          res.redirect('/');
        }
      }
      // password doesn't match
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
    } 
    // specified name doesn't match anything in db
    else {
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

app.get('/logout', function(req, res) {
  req.session.regenerate(function(err){
    res.writeHead(302, { Location: '/' });
    res.end();
  });
});

app.get('/blog/new', function(req, res) {
  if (userLoggedIn(req)) {
    res.render('blog_new', {
      locals: {
        title: 'New Post'
      }
    });
  }
  else {
    req.flash('redirect-from', req.url);
    res.redirect('/login');
  }
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
  Post.find({ slug: req.params.slug }).first(function(post) {
    res.render('blog_post', {
      locals: {
        title: 'Blog',
        post: post
      }
    });
  });
});

function userLoggedIn(req) {
  var id = req.session.user_id || '';
  if (id != '') {
    return function() {
      User.find({ _id: id }).first(function(user) {
        return user ? true : false;
      });
    }
  }
}

/* -== RUNNING SERVER ==- */
app.listen(3000);
console.log('Express server started on port %s', app.address().port);
