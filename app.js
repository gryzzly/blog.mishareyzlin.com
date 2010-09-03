// TODO: add authentication for admin http://wiki.github.com/ciaranj/connect-auth/creating-a-form-based-strategy

/* -== DEFINING ==- */
var express = require('express'),
    app = express.createServer(),
    mongoose = require('mongoose').Mongoose,
    db = mongoose.connect('mongodb://localhost/blog-express-mongoose'),
    pub = __dirname + '/public';
    
// db.dropDatabase - to drop DB;

mongoose.model('Post', {
  properties: ['title', 'slug', 'body', {'comments': ['person', 'comment', 'created_at']}, 'created_at']
});

var Post = db.model('Post');

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
